"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UploadAppPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [packageName, setPackageName] = useState("");
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Tafadhali ingia kwanza ili upakie app.");
        setLoading(false);
        return;
      }

      if (!apkFile) {
        setError("Tafadhali chagua faili la APK.");
        setLoading(false);
        return;
      }

      // 2. Create slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // 3. Upload APK
      const apkFileName = `${user.id}/${slug}-${versionName}.apk`;
      const { error: apkError } = await supabase.storage
        .from("apps")
        .upload(apkFileName, apkFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (apkError) throw new Error("Imeshindikana kupakia APK: " + apkError.message);

      const { data: apkUrlData } = supabase.storage
        .from("apps")
        .getPublicUrl(apkFileName);

      // 4. Upload Icon (optional)
      let iconUrl = null;
      if (iconFile) {
        const iconFileName = `${user.id}/${slug}-icon.png`;
        const { error: iconError } = await supabase.storage
          .from("screenshots")
          .upload(iconFileName, iconFile);

        if (!iconError) {
          const { data: iconUrlData } = supabase.storage
            .from("screenshots")
            .getPublicUrl(iconFileName);
          iconUrl = iconUrlData.publicUrl;
        }
      }

      // 5. Insert into database
      const { error: insertError } = await supabase.from("apps").insert({
        developer_id: user.id,
        name,
        slug,
        short_description: shortDescription,
        description,
        package_name: packageName,
        version_name: versionName,
        version_code: parseInt(versionCode) || 1,
        apk_url: apkUrlData.publicUrl,
        apk_size: apkFile.size,
        icon_url: iconUrl,
        status: "pending",
      });

      if (insertError) throw new Error(insertError.message);

      setSuccess(true);
      setTimeout(() => {
        router.push("/developer");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Kuna hitilafu imetokea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pakia App Mpya</h1>
      <p className="text-gray-500 mb-8">
        Jaza taarifa za app yako na upakie APK
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm">
          App imepakia kikamilifu! Inasubiri idhini...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* App Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jina la App *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mfano: Dutoza Chat"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maelezo Mafupi *
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            maxLength={80}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Maelezo mafupi (max 80 characters)"
          />
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maelezo Kamili
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Andika maelezo kamili ya app yako..."
          />
        </div>

        {/* Package Name & Version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Name
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="com.dutoza.app"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version Name *
            </label>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version Code
            </label>
            <input
              type="number"
              value={versionCode}
              onChange={(e) => setVersionCode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
        </div>

        {/* APK File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faili la APK *
          </label>
          <input
            type="file"
            accept=".apk"
            onChange={(e) => setApkFile(e.target.files?.[0] || null)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {apkFile && (
            <p className="text-sm text-gray-500 mt-1">
              {apkFile.name} ({(apkFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon ya App (PNG/JPG)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIconFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition text-lg"
        >
          {loading ? "Inapakia... Subiri" : "Pakia App"}
        </button>
      </form>
    </div>
  );
}
