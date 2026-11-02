import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus, Clock, XCircle, Eye } from "lucide-react";
import DeleteAppButton from "@/components/DeleteAppButton";
import { statusMeta, formatDownloads } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MyAppsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/developer/apps");

  const [{ data: apps }, { data: updates }] = await Promise.all([
    supabase.from("apps").select("*").eq("developer_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("app_updates")
      .select("id, app_id, status, admin_note, created_at")
      .eq("developer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const latestByApp = new Map<string, any>();
  (updates || []).forEach((u: any) => {
    if (!latestByApp.has(u.app_id)) latestByApp.set(u.app_id, u);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Apps Zangu</h1>
          <p className="page-sub">{apps?.length || 0} apps</p>
        </div>
        <Link href="/developer/upload" className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> Pakia Mpya
        </Link>
      </div>

      {!apps || apps.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-slate-500">Bado hujapakia app yoyote.</p>
          <Link href="/developer/upload" className="btn-primary btn-sm mt-4">Pakia App Ya Kwanza</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app: any) => {
            const meta = statusMeta(app.status);
            const upd = latestByApp.get(app.id);
            return (
              <div key={app.id} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 ring-1 ring-black/5">
                    {app.icon_url ? (
                      <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">📱</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 truncate">{app.name}</h3>
                      <span className={meta.cls}>{meta.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      v{app.version_name} · {formatDownloads(app.downloads_count)} downloads
                    </p>
                  </div>
                </div>

                {upd?.status === "pending" && (
                  <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 rounded-xl px-3 py-2">
                    <Clock className="w-4 h-4 flex-shrink-0" /> Sasisho lako linasubiri idhini ya admin.
                  </div>
                )}
                {upd?.status === "rejected" && (
                  <div className="flex items-start gap-2 text-xs bg-rose-50 text-rose-800 rounded-xl px-3 py-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><b>Sasisho limekataliwa:</b> {upd.admin_note || "Rekebisha kisha tuma tena."}</span>
                  </div>
                )}
                {app.status === "rejected" && app.admin_note && (
                  <div className="flex items-start gap-2 text-xs bg-rose-50 text-rose-800 rounded-xl px-3 py-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><b>App imekataliwa:</b> {app.admin_note}</span>
                  </div>
                )}
                {app.status === "blocked" && (
                  <div className="text-xs bg-orange-50 text-orange-800 rounded-xl px-3 py-2">
                    Imezuiwa{app.admin_note ? `: ${app.admin_note}` : "."}{" "}
                    <Link href="/support" className="underline font-semibold">Wasiliana na msaada</Link>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {app.status !== "blocked" && (
                    <Link href={`/developer/apps/${app.id}/edit`} className="btn-soft btn-sm">
                      <Pencil className="w-3.5 h-3.5" /> Hariri
                    </Link>
                  )}
                  {app.status === "approved" && (
                    <Link href={`/app/${app.slug}`} className="btn-ghost btn-sm">
                      <Eye className="w-3.5 h-3.5" /> Angalia
                    </Link>
                  )}
                  <div className="ml-auto">
                    <DeleteAppButton appId={app.id} appName={app.name} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
