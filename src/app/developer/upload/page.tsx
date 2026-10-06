"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

/** Upload with XHR for real progress tracking */
function uploadWithProgress(
  supabaseUrl: string,
  anonKey: string,
  bucket: string,
  path: string,
  file: File,
  accessToken: string,
  onProgress: (loaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded, e.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const j = JSON.parse(xhr.responseText);
          if (j.message) msg = j.message;
          if (j.error) msg = j.error;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function UploadAppPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [packageName, setPackageName] = useState("");
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Progress state
  const [progressLabel, setProgressLabel] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const ssInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (data) setCategories(data);
    })();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIconFile(file);
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    } else {
      setIconPreview(null);
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8);
    setScreenshotFiles(files);
    setScreenshotPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setProgressPct(0);

    try {
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

      if (!iconFile) {
        setError("Tafadhali chagua icon ya app (lazima).");
        setLoading(false);
        return;
      }

      if (!categoryId) {
        setError("Tafadhali chagua category.");
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        setError("Session imeisha. Ingia tena.");
        setLoading(false);
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // --- 1. Upload APK ---
      setProgressLabel("Inapakia APK...");
      const apkFileName = `${user.id}/${slug}-${versionName || "1.0"}.apk`;

      await uploadWithProgress(
        supabaseUrl,
        anonKey,
        "apps",
        apkFileName,
        apkFile,
        token,
        (loaded, total) => {
          setProgressLoaded(loaded);
          setProgressTotal(total);
          setProgressPct((loaded / total) * 100);
        }
      );

      const { data: apkUrlData } = supabase.storage
        .from("apps")
        .getPublicUrl(apkFileName);

      // --- 2. Upload Icon ---
      setProgressLabel("Inapakia Icon...");
      setProgressPct(0);

      const iconExt = iconFile.name.split(".").pop()?.toLowerCase() || "png";
      const iconFileName = `${user.id}/${slug}-icon-${Date.now()}.${iconExt}`;

      await uploadWithProgress(
        supabaseUrl,
        anonKey,
        "screenshots",
        iconFileName,
        iconFile,
        token,
        (loaded, total) => {
          setProgressLoaded(loaded);
          setProgressTotal(total);
          setProgressPct((loaded / total) * 100);
        }
      );

      const { data: iconUrlData } = supabase.storage
        .from("screenshots")
        .getPublicUrl(iconFileName);

      const iconUrl = iconUrlData.publicUrl;
      if (!iconUrl) throw new Error("Icon URL haikupatikana");

      // --- 3. Insert app ---
      setProgressLabel("Inahifadhi taarifa...");
      setProgressPct(90);

      const { data: insertedApp, error: insertError } = await supabase
        .from("apps")
        .insert({
          developer_id: user.id,
          name,
          slug,
          short_description: shortDescription,
          description,
          package_name: packageName,
          version_name: versionName || "1.0",
          version_code: parseInt(versionCode) || 1,
          category_id: categoryId || null,
          apk_url: apkUrlData.publicUrl,
          apk_size: apkFile.size,
          icon_url: iconUrl,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);

      // --- 4. Upload screenshots ---
      if (screenshotFiles.length > 0 && insertedApp?.id) {
        for (let i = 0; i < screenshotFiles.length; i++) {
          const file = screenshotFiles[i];
          setProgressLabel(`Inapakia Screenshot ${i + 1}/${screenshotFiles.length}...`);
          setProgressPct(0);

          const ssName = `${user.id}/${slug}-ss-${i}-${Date.now()}.jpg`;

          await uploadWithProgress(
            supabaseUrl,
            anonKey,
            "screenshots",
            ssName,
            file,
            token,
            (loaded, total) => {
              setProgressLoaded(loaded);
              setProgressTotal(total);
              setProgressPct((loaded / total) * 100);
            }
          );

          const { data: ssUrl } = supabase.storage
            .from("screenshots")
            .getPublicUrl(ssName);

          await supabase.from("app_screenshots").insert({
            app_id: insertedApp.id,
            image_url: ssUrl.publicUrl,
            sort_order: i,
          });
        }
      }

      setProgressPct(100);
      setProgressLabel("Imekamilika!");
      setSuccess(true);

      setTimeout(() => {
        router.push("/developer/apps");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Kuna hitilafu imetokea");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pakia App Mpya</h1>
      <p className="text-gray-500 mb-8">
        Jaza taarifa, icon, screenshots na APK
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium">
          App imepakia kikamilifu! Inasubiri idhini ya admin...
        </div>
      )}

      {/* Progress panel */}
      {loading && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <ProgressBar
            percent={progressPct}
            loadedMB={formatMB(progressLoaded)}
            totalMB={progressTotal > 0 ? formatMB(progressTotal) : "..."}
            label={progressLabel}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Andika maelezo kamili ya app yako..."
          />
        </div>

        {/* ===================== CUSTOM CATEGORY SELECTOR ===================== */}
        <div ref={categoryRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>

          {categories.length === 0 ? (
            <p className="text-xs text-amber-600">
              Hakuna categories. Endesha SQL ya categories kwenye Supabase.
            </p>
          ) : (
            <>
              {/* Trigger Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsCategoryOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition-all duration-200
                  ${
                    categoryId
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                <span className="font-medium">
                  {selectedCategoryName || "Chagua category..."}
                </span>

                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isCategoryOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="max-h-64 overflow-y-auto py-1">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(c.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors
                          ${
                            categoryId === c.id
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        <span>{c.name}</span>
                        {categoryId === c.id && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* ===================== END CUSTOM SELECTOR ===================== */}

        {/* Package & Version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Name
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
        </div>

        {/* Icon Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            App Icon *
          </label>
          <div className="flex items-center gap-4">
            <div
              onClick={() => !loading && iconInputRef.current?.click()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden bg-gray-50 flex-shrink-0"
            >
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">
                  + Icon
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>PNG au JPG, angalau 512×512</p>
              <p className="text-xs mt-1">Bonyeza kuongeza icon</p>
            </div>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleIconChange}
              className="hidden"
              disabled={loading}
            />
          </div>
        </div>

        {/* Screenshots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Screenshots (hadi 8)
          </label>
          <div className="flex flex-wrap gap-3">
            {screenshotPreviews.map((src, i) => (
              <div
                key={i}
                className="relative w-24 h-40 rounded-xl overflow-hidden border border-gray-200 group"
              >
                <img
                  src={src}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  disabled={loading}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
            {screenshotFiles.length < 8 && (
              <button
                type="button"
                onClick={() => !loading && ssInputRef.current?.click()}
                disabled={loading}
                className="w-24 h-40 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition text-xs gap-1"
              >
                <span className="text-2xl">+</span>
                Screenshot
              </button>
            )}
          </div>
          <input
            ref={ssInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleScreenshotsChange}
            className="hidden"
            disabled={loading}
          />
        </div>

        {/* APK File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faili la APK *
          </label>
          <input
            type="file"
            accept=".apk,application/vnd.android.package-archive"
            required
            disabled={loading}
            onChange={(e) => setApkFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
          />
          {apkFile && (
            <p className="text-xs text-gray-500 mt-1">
              {apkFile.name} · {formatMB(apkFile.size)} MB
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition text-base"
        >
          {loading ? "Inapakia..." : "Pakia App"}
        </button>
      </form>
    </div>
  );
}
