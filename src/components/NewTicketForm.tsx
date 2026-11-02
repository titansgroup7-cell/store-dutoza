"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TOPICS = ["Tatizo la app", "Ombi la kuidhinisha", "Akaunti", "Malipo / mengineyo"];

export default function NewTicketForm() {
  const supabase = createClient();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?next=/support");
      return;
    }
    const { data: ticket, error: tErr } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject: subject.trim() })
      .select("id")
      .single();
    if (tErr || !ticket) {
      setError(tErr?.message || "Imeshindikana kutuma ombi");
      setLoading(false);
      return;
    }
    const { error: mErr } = await supabase
      .from("support_messages")
      .insert({ ticket_id: ticket.id, sender_id: user.id, is_staff: false, body: message.trim() });
    if (mErr) {
      setError(mErr.message);
      setLoading(false);
      return;
    }
    router.push(`/support/${ticket.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div>
        <label className="label">Mada</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={120}
          className="input"
          placeholder="Mfano: App yangu haionekani kwenye store"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TOPICS.map((t) => (
            <button type="button" key={t} onClick={() => setSubject(t)} className="chip !py-1 !text-[11px]">
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Maelezo</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          maxLength={4000}
          className="input"
          placeholder="Eleza tatizo lako kwa ufupi..."
        />
      </div>
      {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
      <button disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? "Inatuma..." : "Tuma kwa Customer Care"}
      </button>
    </form>
  );
}
