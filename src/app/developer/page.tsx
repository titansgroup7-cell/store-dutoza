import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UploadCloud, Smartphone, Download, Clock, CheckCircle2, LifeBuoy, ArrowRight } from "lucide-react";
import PushToggle from "@/components/PushToggle";
import { formatDownloads } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/developer");

  const [{ data: apps }, { count: pendingUpdates }] = await Promise.all([
    supabase.from("apps").select("id, status, downloads_count").eq("developer_id", user.id),
    supabase
      .from("app_updates")
      .select("id", { count: "exact", head: true })
      .eq("developer_id", user.id)
      .eq("status", "pending"),
  ]);

  const list = apps || [];
  const stats = [
    { label: "Apps zangu", value: list.length, icon: Smartphone, tone: "bg-brand-50 text-brand-600" },
    { label: "Downloads", value: formatDownloads(list.reduce((s, a: any) => s + (a.downloads_count || 0), 0)), icon: Download, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Zinasubiri idhini", value: list.filter((a: any) => a.status === "pending").length + (pendingUpdates || 0), icon: Clock, tone: "bg-amber-50 text-amber-600" },
    { label: "Live", value: list.filter((a: any) => a.status === "approved").length, icon: CheckCircle2, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Developer Dashboard</h1>
        <p className="page-sub">Pakia, hariri na fuatilia apps zako.</p>
      </div>

      <PushToggle highlight />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-4">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone}`}>
              <Icon className="w-[18px] h-[18px]" />
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-3 leading-none">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: "/developer/upload", title: "Pakia App Mpya", desc: "APK, icon na screenshots", icon: UploadCloud, grad: "from-brand-600 to-violet-600" },
          { href: "/developer/apps", title: "Apps Zangu", desc: "Hariri na tuma masasisho", icon: Smartphone, grad: "from-emerald-500 to-teal-600" },
          { href: "/support", title: "Customer Care", desc: "Pata msaada wa haraka", icon: LifeBuoy, grad: "from-sky-500 to-blue-600" },
        ].map(({ href, title, desc, icon: Icon, grad }) => (
          <Link key={href} href={href} className="group card card-hover p-5">
            <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} text-white flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5" />
            </span>
            <h2 className="font-bold text-slate-900 mt-4 flex items-center gap-1">
              {title} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5">
        <h3 className="font-bold text-brand-900 mb-2">Maelekezo</h3>
        <ul className="text-sm text-brand-800 space-y-1.5 list-disc pl-5">
          <li>Hakikisha APK yako ni salama na haina virus.</li>
          <li>Kila app mpya na kila sasisho hukaguliwa na admin kabla ya kuwa live.</li>
          <li>Ukitaka kubadilisha app: Apps Zangu → Hariri, kisha subiri idhini.</li>
          <li>Washa arifa za simu ili ujue mara moja admin akimaliza kukagua.</li>
        </ul>
      </div>
    </div>
  );
}
