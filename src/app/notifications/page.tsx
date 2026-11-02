import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationList from "@/components/NotificationList";
import PushToggle from "@/components/PushToggle";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="page-title">Notifications</h1>
        <p className="page-sub">Taarifa za idhini, masasisho na msaada.</p>
      </div>
      <PushToggle highlight />
      <NotificationList userId={user.id} initial={data || []} />
    </div>
  );
}
