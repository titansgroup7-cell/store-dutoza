"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileUp, ImagePlus, X, UploadCloud } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { formatMB, slugify, uploadWithProgress } from "@/lib/upload";

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
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [progressLabel, setProgressLabel] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const ssInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      if (data) setCategories(data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProgress = (loaded: number, total: number) => {
    setProgressLoaded(loaded);
    setProgressTotal(total);
    setProgressPct((loaded / total) * 100);
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8 - screenshotFiles.length);
    setScreenshotFiles((p) => [...p, ...files]);
    setScreenshotPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
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
      if (!user) throw new Error("Tafadhali ingia kwanza ili upakie app.");
      if (!apkFile) throw new Error("Tafadhali chagua faili la APK.");
      if (!iconFile) throw new Error("Tafadhali chagua icon ya app (lazima).");
      if (!categoryId) throw new Error("Tafadhali chagua category.");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Session imeisha. Ingia tena.");

      // slug ya kipekee
      let slug = slugify(name) || "app";
      const { data: existing } = await supabase.from("apps").select("id").eq("slug", slug).maybeSingle();
      if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

      const stamp = Date.now();

      setProgressLabel("Inapakia APK...");
      const apkPath = `${user.id}/${slug}-${versionName || "1.0"}-${stamp}.apk`;
      await uploadWithProgress("apps", apkPath, apkFile, token, onProgress);
      const apkUrl = supabase.storage.from("apps").getPublicUrl(apkPath).data.publicUrl;

      setProgressLabel("Inapakia Icon...");
      setProgressPct(0);
      const iconExt = iconFile.name.split(".").pop()?.toLowerCase() || "png";
      const iconPath = `${user.id}/${slug}-icon-${stamp}.${iconExt}`;
      await uploadWithProgress("screenshots", iconPath, iconFile, token, onProgress);
      const iconUrl = supabase.storage.from("screenshots").getPublicUrl(iconPath).data.publicUrl;

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
          apk_url: apkUrl,
          apk_size: apkFile.size,
          icon_url: iconUrl,
          status: "pending",
        })
        .select("id")
        .single();
      if (insertError) throw new Error(insertError.message);

      for (let i = 0; i < screenshotFiles.length; i++) {
        setProgressLabel(`Inapakia Screenshot ${i + 1}/${screenshotFiles.length}...`);
        setProgressPct(0);
        const ssName = `${user.id}/${slug}-ss-${stamp}-${i}.jpg`;
        await uploadWithProgress("screenshots", ssName, screenshotFiles[i], token, onProgress);
        const { data: ssUrl } = supabase.storage.from("screenshots").getPublicUrl(ssName);
        await supabase.from("app_screenshots").insert({
          app_id: insertedApp!.id,
          image_url: ssUrl.publicUrl,
          sort_order: i,
        });
      }

      setProgressPct(100);
      setProgressLabel("Imekamilika!");
      setSuccess(true);
      setTimeout(() => router.push("/developer/apps"), 2000);
    } catch (err: any) {
      setError(err.message || "Kuna hitilafu imetokea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <Link href="/developer" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-3">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="page-title">Pakia App Mpya</h1>
      <p className="page-sub mb-6">Jaza taarifa, icon, screenshots na APK. Admin ataikagua kabla ya kuwa live.</p>

      {error && <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl mb-5 text-sm">{error}</div>}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl mb-5 text-sm font-semibold">
          App imepakiwa! Admin amejulishwa, utapata notification akimaliza kukagua.
        </div>
      )}
      {loading && (
        <div className="card p-4 mb-5">
          <ProgressBar
            percent={progressPct}
            loadedMB={formatMB(progressLoaded)}
            totalMB={progressTotal > 0 ? formatMB(progressTotal) : "..."}
            label={progressLabel}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900">Taarifa za app</h2>
          <div>
            <label className="label">Jina la App *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} placeholder="Mfano: Dutoza Chat" />
          </div>
          <div>
            <label className="label">Maelezo Mafupi *</label>
            <input className="input" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required maxLength={80} disabled={loading} placeholder="Max herufi 80" />
          </div>
          <div>
            <label className="label">Maelezo Kamili</label>
            <textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} placeholder="Andika maelezo kamili ya app yako..." />
          </div>
          <div>
            <label className="label">Category *</label>
            {categories.length === 0 ? (
              <p className="text-xs text-amber-600">Hakuna categories. Endesha SQL ya categories kwenye Supabase.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c.id} type="button" disabled={loading} onClick={() => setCategoryId(c.id)} className={categoryId === c.id ? "chip-active" : "chip"}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900">Version & APK</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Package Name</label>
              <input className="input" value={packageName} onChange={(e) => setPackageName(e.target.value)} disabled={loading} placeholder="com.dutoza.app" />
            </div>
            <div>
              <label className="label">Version Name *</label>
              <input className="input" value={versionName} onChange={(e) => setVersionName(e.target.value)} required disabled={loading} placeholder="1.0.0" />
            </div>
            <div>
              <label className="label">Version Code</label>
              <input type="number" className="input" value={versionCode} onChange={(e) => setVersionCode(e.target.value)} disabled={loading} placeholder="1" />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 p-4 cursor-pointer transition">
            <FileUp className="w-5 h-5 text-brand-600" />
            <span className="text-sm text-slate-600 flex-1 truncate">
              {apkFile ? `${apkFile.name} · ${formatMB(apkFile.size)} MB` : "Chagua faili la .apk *"}
            </span>
            <input type="file" accept=".apk,application/vnd.android.package-archive" required disabled={loading} className="hidden" onChange={(e) => setApkFile(e.target.files?.[0] || null)} />
          </label>
        </section>

        <section className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900">Icon & Screenshots</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => !loading && iconInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-400 overflow-hidden bg-slate-50 flex items-center justify-center text-xs text-slate-400 flex-shrink-0"
            >
              {iconPreview ? <img src={iconPreview} alt="" className="w-full h-full object-cover" /> : "+ Icon *"}
            </button>
            <p className="text-xs text-slate-500">PNG au JPG, angalau 512×512. Bonyeza kuchagua.</p>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setIconFile(f);
                setIconPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {screenshotPreviews.map((src, i) => (
              <div key={src} className="relative w-24 h-40 rounded-xl overflow-hidden border border-slate-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setScreenshotFiles((p) => p.filter((_, j) => j !== i));
                    setScreenshotPreviews((p) => p.filter((_, j) => j !== i));
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {screenshotFiles.length < 8 && (
              <button
                type="button"
                disabled={loading}
                onClick={() => ssInputRef.current?.click()}
                className="w-24 h-40 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 text-slate-400 hover:text-brand-600 flex flex-col items-center justify-center gap-1 text-xs transition"
              >
                <ImagePlus className="w-5 h-5" /> Screenshot
              </button>
            )}
            <input ref={ssInputRef} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleScreenshotsChange} />
          </div>
        </section>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
          <UploadCloud className="w-5 h-5" /> {loading ? "Inapakia..." : "Pakia App"}
        </button>
      </form>
    </div>
  );
}
