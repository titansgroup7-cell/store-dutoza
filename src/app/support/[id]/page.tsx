import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SupportChat from "@/components/SupportChat";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/support/${id}`);

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  const isAdmin = !!profile?.is_admin;

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, subject, status, user_id, profiles(full_name, username)")
    .eq("id", id)
    .single();
  if (!ticket) notFound();

  const { data: messages } = await supabase
    .from("support_messages")
    .select("id, sender_id, is_staff, body, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const owner: any = ticket.profiles;
  const ownerName = owner?.full_name || owner?.username || "Mtumiaji";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <Link
          href={isAdmin && ticket.user_id !== user.id ? "/admin?tab=support" : "/support"}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Rudi
        </Link>
        <h1 className="page-title">{ticket.subject}</h1>
        {isAdmin && ticket.user_id !== user.id && <p className="page-sub">Kutoka kwa {ownerName}</p>}
      </div>
      <SupportChat
        ticketId={ticket.id}
        userId={user.id}
        isStaff={isAdmin && ticket.user_id !== user.id}
        initialMessages={messages || []}
        initialStatus={ticket.status}
      />
    </div>
  );
}
