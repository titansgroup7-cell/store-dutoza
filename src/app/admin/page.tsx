import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink, Inbox, MessageCircle, RefreshCw, Smartphone, UploadCloud } from "lucide-react";
import AdminAppActions from "@/components/AdminAppActions";
import AdminUpdateActions from "@/components/AdminUpdateActions";
import PushToggle from "@/components/PushToggle";
import { formatSize, statusMeta, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

type Tab = "pending" | "updates" | "all" | "support";

function AppIcon({ url, name, size = "w-12 h-12" }: { url?: string | null; name: string; size?: string }) {
  return (
    <div className={`${size} rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 ring-1 ring-black/5`}>
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-lg">📱</div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="card p-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
        <Inbox className="w-6 h-6" />
      </div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (["pending", "updates", "all", "support"].includes(tabParam || "") ? tabParam : "pending") as Tab;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-extrabold text-slate-900">Access Denied</h1>
        <p className="text-sm text-slate-500 mt-1">Huna ruhusa ya kuingia hapa.</p>
      </div>
    );
  }

  const head = { count: "exact" as const, head: true };
  const [pendingC, updatesC, supportC, totalC] = await Promise.all([
    supabase.from("apps").select("id", head).eq("status", "pending"),
    supabase.from("app_updates").select("id", head).eq("status", "pending"),
    supabase.from("support_tickets").select("id", head).eq("status", "open"),
    supabase.from("apps").select("id", head),
  ]);
  const counts = {
    pending: pendingC.count || 0,
    updates: updatesC.count || 0,
    support: supportC.count || 0,
    all: totalC.count || 0,
  };

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "pending", label: "Apps mpya", icon: UploadCloud, badge: counts.pending },
    { key: "updates", label: "Masasisho", icon: RefreshCw, badge: counts.updates },
    { key: "support", label: "Msaada", icon: MessageCircle, badge: counts.support },
    { key: "all", label: "Apps zote", icon: Smartphone },
  ];

  let content: React.ReactNode = null;

  if (tab === "pending") {
    const { data } = await supabase
      .from("apps")
      .select("*, profiles(full_name, username), categories(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    content =
      !data || data.length === 0 ? (
        <Empty text="Hakuna apps mpya zinazosubiri idhini. 🎉" />
      ) : (
        <div className="space-y-3">
          {data.map((app: any) => (
            <div key={app.id} className="card p-4 sm:p-5">
              <div className="flex gap-3.5">
                <AppIcon url={app.icon_url} name={app.name} size="w-14 h-14" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{app.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.profiles?.full_name || app.profiles?.username || "—"} · v{app.version_name} ·{" "}
                    {formatSize(app.apk_size)} · {app.categories?.name || "—"} · {timeAgo(app.created_at)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">{app.description || app.short_description}</p>
                  {app.apk_url && (
                    <a href={app.apk_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 mt-2 hover:underline">
                      Pakua APK kukagua <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <AdminAppActions appId={app.id} currentStatus={app.status} />
              </div>
            </div>
          ))}
        </div>
      );
  }

  if (tab === "updates") {
    const [{ data: updates }, { data: cats }] = await Promise.all([
      supabase
        .from("app_updates")
        .select("*, apps(name, slug, icon_url, short_description, description, package_name, version_name, version_code, category_id, apk_size, status), profiles:developer_id(full_name, username)")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase.from("categories").select("id, name"),
    ]);
    const catName = (id?: string | null) => cats?.find((c: any) => c.id === id)?.name || "—";

    content =
      !updates || updates.length === 0 ? (
        <Empty text="Hakuna masasisho yanayosubiri idhini." />
      ) : (
        <div className="space-y-3">
          {updates.map((u: any) => {
            const a = u.apps || {};
            const rows: [string, string, string][] = [];
            const add = (label: string, oldV: any, newV: any) => {
              if (newV !== null && newV !== undefined && String(newV) !== String(oldV ?? "")) {
                rows.push([label, String(oldV ?? "—"), String(newV)]);
              }
            };
            add("Jina", a.name, u.name);
            add("Maelezo mafupi", a.short_description, u.short_description);
            add("Maelezo kamili", (a.description || "").slice(0, 80), u.description !== a.description ? (u.description || "").slice(0, 80) : null);
            add("Package", a.package_name, u.package_name);
            add("Version", a.version_name, u.version_name);
            add("Version code", a.version_code, u.version_code);
            if (u.category_id && u.category_id !== a.category_id) rows.push(["Category", catName(a.category_id), catName(u.category_id)]);
            if (u.apk_url) rows.push(["APK", `${formatSize(a.apk_size)}`, `${formatSize(u.apk_size)} (mpya)`]);

            return (
              <div key={u.id} className="card p-4 sm:p-5">
                <div className="flex gap-3.5 items-start">
                  <AppIcon url={u.icon_url || a.icon_url} name={a.name || "app"} size="w-14 h-14" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{a.name}</h3>
                      <span className="badge-brand">Sasisho</span>
                      {a.status !== "approved" && <span className={statusMeta(a.status).cls}>App: {statusMeta(a.status).label}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {u.profiles?.full_name || u.profiles?.username || "—"} · {timeAgo(u.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3.5">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Nini kimebadilika (maelezo ya developer)</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{u.change_notes}</p>
                </div>

                {(rows.length > 0 || u.icon_url || u.screenshots) && (
                  <div className="mt-3 space-y-2">
                    {rows.map(([label, from, to]) => (
                      <div key={label} className="grid grid-cols-[96px_1fr] gap-2 text-xs items-start">
                        <span className="font-semibold text-slate-500 pt-0.5">{label}</span>
                        <div className="min-w-0">
                          <span className="text-rose-600 line-through break-words">{from}</span>
                          <span className="mx-1.5 text-slate-300">→</span>
                          <span className="text-emerald-700 font-semibold break-words">{to}</span>
                        </div>
                      </div>
                    ))}
                    {u.icon_url && (
                      <div className="grid grid-cols-[96px_1fr] gap-2 text-xs items-center">
                        <span className="font-semibold text-slate-500">Icon</span>
                        <div className="flex items-center gap-2">
                          <AppIcon url={a.icon_url} name="old" size="w-9 h-9" />
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                          <AppIcon url={u.icon_url} name="new" size="w-9 h-9" />
                        </div>
                      </div>
                    )}
                    {u.screenshots && (
                      <div className="grid grid-cols-[96px_1fr] gap-2 text-xs items-start">
                        <span className="font-semibold text-slate-500 pt-0.5">Screenshots</span>
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                          {(u.screenshots as string[]).map((s) => (
                            <img key={s} src={s} alt="" className="h-20 rounded-lg border border-slate-200" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {u.apk_url && (
                  <a href={u.apk_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 mt-3 hover:underline">
                    Pakua APK mpya kukagua <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <AdminUpdateActions updateId={u.id} />
                </div>
              </div>
            );
          })}
        </div>
      );
  }

  if (tab === "support") {
    const { data: tickets } = await supabase
      .from("support_tickets")
      .select("id, subject, status, last_message_at, profiles(full_name, username)")
      .order("last_message_at", { ascending: false })
      .limit(60);

    content =
      !tickets || tickets.length === 0 ? (
        <Empty text="Hakuna maombi ya msaada." />
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {tickets.map((t: any) => {
            const m = statusMeta(t.status);
            return (
              <Link key={t.id} href={`/support/${t.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition">
                <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{t.subject}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.profiles?.full_name || t.profiles?.username || "—"} · {timeAgo(t.last_message_at)}
                  </p>
                </div>
                <span className={m.cls}>{m.label}</span>
              </Link>
            );
          })}
        </div>
      );
  }

  if (tab === "all") {
    const { data } = await supabase
      .from("apps")
      .select("*, profiles(full_name, username)")
      .order("created_at", { ascending: false })
      .limit(60);

    content =
      !data || data.length === 0 ? (
        <Empty text="Hakuna apps." />
      ) : (
        <div className="space-y-3">
          {data.map((app: any) => {
            const m = statusMeta(app.status);
            return (
              <div key={app.id} className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <AppIcon url={app.icon_url} name={app.name} size="w-11 h-11" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{app.name}</h3>
                      <span className={m.cls}>{m.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {app.profiles?.full_name || app.profiles?.username || "—"} · v{app.version_name} · {app.downloads_count || 0} dl
                    </p>
                    {app.admin_note && <p className="text-[11px] text-rose-600 mt-0.5">Sababu: {app.admin_note}</p>}
                  </div>
                  {app.status === "approved" && app.slug && (
                    <Link href={`/app/${app.slug}`} className="text-xs font-semibold text-brand-600 hover:underline ml-auto sm:ml-2">
                      Angalia
                    </Link>
                  )}
                </div>
                <AdminAppActions appId={app.id} currentStatus={app.status} />
              </div>
            );
          })}
        </div>
      );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Kagua apps, masasisho na usaidie wateja.</p>
      </div>

      <PushToggle highlight />

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <Link key={key} href={`/admin?tab=${key}`} className={tab === key ? "chip-active" : "chip"}>
            <Icon className="w-3.5 h-3.5" /> {label}
            {!!badge && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${tab === key ? "bg-white/25 text-white" : "bg-rose-500 text-white"}`}>
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {content}
    </div>
  );
}
