"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, FileUp, X, Send, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatMB, uploadWithProgress } from "@/lib/upload";
import ProgressBar from "./ProgressBar";

type Shot = { id: string; image_url: string };

export default function EditAppForm({
  app,
  categories,
  screenshots,
}: {
  app: any;
  categories: { id: string; name: string }[];
  screenshots: Shot[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(app.name || "");
  const [shortDescription, setShortDescription] = useState(app.short_description || "");
  const [description, setDescription] = useState(app.description || "");
  const [packageName, setPackageName] = useState(app.package_name || "");
  const [versionName, setVersionName] = useState(app.version_name || "");
  const [versionCode, setVersionCode] = useState(String(app.version_code ?? 1));
  const [categoryId, setCategoryId] = useState<string>(app.category_id || "");
  const [changeNotes, setChangeNotes] = useState("");

  const [apkFile, setApkFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [kept, setKept] = useState<Shot[]>(screenshots);
  const [newShots, setNewShots] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [label, setLabel] = useState("");
  const [pct, setPct] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);

  const iconRef = useRef<HTMLInputElement>(null);
  const shotRef = useRef<HTMLInputElement>(null);

  const maxNew = Math.max(0, 8 - kept.length);

  const onShots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxNew - newShots.length);
    setNewShots((p) => [...p, ...files]);
    setNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const progress = (l: number, t: number) => {
    setLoaded(l);
    setTotal(t);
    setPct((l / t) * 100);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const origIds = screenshots.map((s) => s.id).join(",");
    const shotsChanged = newShots.length > 0 || kept.map((s) => s.id).join(",") !== origIds;
    const contentChanged =
      name !== (app.name || "") ||
      shortDescription !== (app.short_description || "") ||
      description !== (app.description || "") ||
      packageName !== (app.package_name || "") ||
      versionName !== (app.version_name || "") ||
      Number(versionCode) !== Number(app.version_code) ||
      categoryId !== (app.category_id || "");

    if (!contentChanged && !apkFile && !iconFile && !shotsChanged) {
      return setError("Hujabadilisha chochote bado.");
    }
    if (!changeNotes.trim()) return setError('Andika "Nini kimebadilika?" kwa ufupi.');
    if (apkFile && Number(versionCode) <= Number(app.version_code)) {
      return setError(
        `APK mpya inahitaji Version Code kubwa kuliko ya sasa (${app.version_code}).`
      );
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!user || !session) throw new Error("Session imeisha. Ingia tena.");
      const token = session.access_token;
      const stamp = Date.now();

      let apk_url: string | null = null;
      let apk_size: number | null = null;
      if (apkFile) {
        setLabel("Inapakia APK mpya...");
        const path = `${user.id}/${app.slug}-${versionName || "v"}-${stamp}.apk`;
        await uploadWithProgress("apps", path, apkFile, token, progress);
        apk_url = supabase.storage.from("apps").getPublicUrl(path).data.publicUrl;
        apk_size = apkFile.size;
      }

      let icon_url: string | null = null;
      if (iconFile) {
        setLabel("Inapakia icon mpya...");
        setPct(0);
        const ext = iconFile.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${user.id}/${app.slug}-icon-${stamp}.${ext}`;
        await uploadWithProgress("screenshots", path, iconFile, token, progress);
        icon_url = supabase.storage.from("screenshots").getPublicUrl(path).data.publicUrl;
      }

      let screenshotsFinal: string[] | null = null;
      if (shotsChanged) {
        const urls: string[] = [];
        for (let i = 0; i < newShots.length; i++) {
          setLabel(`Inapakia screenshot ${i + 1}/${newShots.length}...`);
          setPct(0);
          const path = `${user.id}/${app.slug}-ss-${stamp}-${i}.jpg`;
          await uploadWithProgress("screenshots", path, newShots[i], token, progress);
          urls.push(supabase.storage.from("screenshots").getPublicUrl(path).data.publicUrl);
        }
        screenshotsFinal = [...kept.map((s) => s.image_url), ...urls];
      }

      setLabel("Inatuma ombi la sasisho...");
      setPct(95);
      const { error: insErr } = await supabase.from("app_updates").insert({
        app_id: app.id,
        developer_id: user.id,
        name: name.trim(),
        short_description: shortDescription.trim(),
        description,
        package_name: packageName.trim() || null,
        version_name: versionName.trim(),
        version_code: Number(versionCode) || app.version_code,
        category_id: categoryId || null,
        apk_url,
        apk_size,
        icon_url,
        screenshots: screenshotsFinal,
        change_notes: changeNotes.trim(),
        status: "pending",
      });
      if (insErr) throw new Error(insErr.message);

      setPct(100);
      setDone(true);
      setTimeout(() => {
        router.push("/developer/apps");
        router.refresh();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Kuna hitilafu imetokea");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 flex gap-3 text-sm text-brand-900">
        <Info className="w-5 h-5 flex-shrink-0 text-brand-600 mt-0.5" />
        <p>
          Mabadiliko yako <b>hayataonekana kwa wateja</b> mpaka admin atakapoyaidhinisha. Version ya
          sasa (v{app.version_name}) itaendelea kuwa live wakati unasubiri.
        </p>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 text-sm p-3.5 rounded-xl">{error}</div>}
      {done && (
        <div className="bg-emerald-50 text-emerald-700 text-sm p-3.5 rounded-xl font-semibold">
          Ombi limetumwa! Admin amejulishwa na utapata notification akimaliza.
        </div>
      )}
      {loading && (
        <div className="card p-4">
          <ProgressBar
            percent={pct}
            loadedMB={formatMB(loaded)}
            totalMB={total > 0 ? formatMB(total) : "..."}
            label={label}
          />
        </div>
      )}

      <section className="card p-5 space-y-4">
        <h2 className="font-bold text-slate-900">Taarifa za app</h2>
        <div>
          <label className="label">Jina la App</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <label className="label">Maelezo mafupi</label>
          <input
            className="input"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={80}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Maelezo kamili</label>
          <textarea
            className="input"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={loading}
                onClick={() => setCategoryId(c.id)}
                className={categoryId === c.id ? "chip-active" : "chip"}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold text-slate-900">Version & APK</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Package Name</label>
            <input className="input" value={packageName} onChange={(e) => setPackageName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="label">Version Name</label>
            <input className="input" value={versionName} onChange={(e) => setVersionName(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="label">Version Code</label>
            <input type="number" className="input" value={versionCode} onChange={(e) => setVersionCode(e.target.value)} disabled={loading} />
          </div>
        </div>
        <div>
          <label className="label">APK mpya (hiari)</label>
          <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 p-4 cursor-pointer transition">
            <FileUp className="w-5 h-5 text-brand-600" />
            <span className="text-sm text-slate-600 flex-1 truncate">
              {apkFile ? `${apkFile.name} · ${formatMB(apkFile.size)} MB` : "Chagua faili la .apk kama unabadilisha version"}
            </span>
            <input
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              className="hidden"
              disabled={loading}
              onChange={(e) => setApkFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold text-slate-900">Icon & Screenshots</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-black/5">
            <img src={iconPreview || app.icon_url || ""} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <button type="button" disabled={loading} onClick={() => iconRef.current?.click()} className="btn-soft btn-sm">
              <ImagePlus className="w-4 h-4" /> Badilisha icon
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5">PNG/JPG, angalau 512×512</p>
          </div>
          <input
            ref={iconRef}
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
          {kept.map((s) => (
            <div key={s.id} className="relative w-24 h-40 rounded-xl overflow-hidden border border-slate-200">
              <img src={s.image_url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                disabled={loading}
                onClick={() => setKept((p) => p.filter((x) => x.id !== s.id))}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {newPreviews.map((src, i) => (
            <div key={src} className="relative w-24 h-40 rounded-xl overflow-hidden border-2 border-brand-300">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 badge-brand !text-[9px]">Mpya</span>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setNewShots((p) => p.filter((_, j) => j !== i));
                  setNewPreviews((p) => p.filter((_, j) => j !== i));
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {kept.length + newShots.length < 8 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => shotRef.current?.click()}
              className="w-24 h-40 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 text-slate-400 hover:text-brand-600 flex flex-col items-center justify-center gap-1 text-xs transition"
            >
              <ImagePlus className="w-5 h-5" /> Ongeza
            </button>
          )}
          <input ref={shotRef} type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onShots} />
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="font-bold text-slate-900">Nini kimebadilika? *</h2>
        <textarea
          className="input"
          rows={3}
          value={changeNotes}
          onChange={(e) => setChangeNotes(e.target.value)}
          placeholder="Mfano: Nimerekebisha tatizo la kuingia, nimeongeza dark mode..."
          required
          disabled={loading}
        />
        <p className="text-[11px] text-slate-400">
          Admin ataisoma hii, na itaonekana kwa wateja kama "Kipya kwenye toleo hili".
        </p>
      </section>

      <button disabled={loading || done} className="btn-primary w-full !py-3.5 text-base">
        <Send className="w-4 h-4" /> {loading ? "Inatuma..." : "Tuma kwa Idhini"}
      </button>
    </form>
  );
}
