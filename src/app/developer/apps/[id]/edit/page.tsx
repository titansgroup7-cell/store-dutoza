import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, XCircle } from "lucide-react";
import EditAppForm from "@/components/EditAppForm";
import CancelUpdateButton from "@/components/CancelUpdateButton";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/developer/apps/${id}/edit`);

  const { data: app } = await supabase
    .from("apps")
    .select("*")
    .eq("id", id)
    .eq("developer_id", user.id)
    .single();
  if (!app) notFound();

  const [{ data: categories }, { data: screenshots }, { data: updates }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("app_screenshots")
      .select("id, image_url")
      .eq("app_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("app_updates")
      .select("id, status, admin_note, created_at, version_name")
      .eq("app_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const last = updates?.[0];
  const pending = last?.status === "pending" ? last : null;

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-5">
      <div>
        <Link href="/developer/apps" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-3">
          <ArrowLeft className="w-4 h-4" /> Apps Zangu
        </Link>
        <h1 className="page-title">Hariri {app.name}</h1>
        <p className="page-sub">Tuma mabadiliko kwa ukaguzi wa admin.</p>
      </div>

      {app.status === "blocked" ? (
        <div className="card p-6 text-center">
          <p className="font-bold text-slate-900">App hii imezuiwa</p>
          {app.admin_note && <p className="text-sm text-slate-500 mt-1">{app.admin_note}</p>}
          <Link href="/support" className="btn-primary mt-4">
            Wasiliana na Customer Care
          </Link>
        </div>
      ) : pending ? (
        <div className="card p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-900">Una ombi la sasisho linalosubiri</p>
          <p className="text-sm text-slate-500">
            Lilitumwa {timeAgo(pending.created_at)}. Subiri admin alikague, au lifute ukitaka kutuma jipya.
          </p>
          <CancelUpdateButton updateId={pending.id} />
        </div>
      ) : (
        <>
          {last?.status === "rejected" && (
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex gap-3 text-sm text-rose-800">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ombi lako la awali lilikataliwa</p>
                <p className="mt-0.5">{last.admin_note || "Rekebisha kisha tuma tena."}</p>
              </div>
            </div>
          )}
          {app.status === "rejected" && app.admin_note && (
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-800">
              <p className="font-bold">App imekataliwa</p>
              <p className="mt-0.5">{app.admin_note}</p>
            </div>
          )}
          <EditAppForm app={app} categories={categories || []} screenshots={screenshots || []} />
        </>
      )}
    </div>
  );
}
