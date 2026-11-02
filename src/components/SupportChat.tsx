"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { statusMeta } from "@/lib/format";

type Msg = { id: string; sender_id: string; is_staff: boolean; body: string; created_at: string };

export default function SupportChat({
  ticketId,
  userId,
  isStaff,
  initialMessages,
  initialStatus,
}: {
  ticketId: string;
  userId: string;
  isStaff: boolean;
  initialMessages: Msg[];
  initialStatus: string;
}) {
  const supabase = useRef(createClient()).current;
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [status, setStatus] = useState(initialStatus);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${ticketId}` },
        (payload: any) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
          setStatus(m.is_staff ? "answered" : "open");
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, supabase]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError("");
    const { data, error: err } = await supabase
      .from("support_messages")
      .insert({ ticket_id: ticketId, sender_id: userId, is_staff: isStaff, body })
      .select("id, sender_id, is_staff, body, created_at")
      .single();
    if (err) {
      setError(err.message);
    } else if (data) {
      setMessages((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data as Msg]));
      setStatus(isStaff ? "answered" : "open");
      setText("");
    }
    setSending(false);
  };

  const setTicketStatus = async (next: "open" | "closed") => {
    const { error: err } = await supabase.from("support_tickets").update({ status: next }).eq("id", ticketId);
    if (err) return setError(err.message);
    setStatus(next);
    router.refresh();
  };

  const meta = statusMeta(status);

  return (
    <div className="card overflow-hidden flex flex-col h-[calc(100vh-15rem)] min-h-[420px]">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <span className={meta.cls}>{meta.label}</span>
        {status === "closed" ? (
          <button onClick={() => setTicketStatus("open")} className="btn-ghost btn-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Fungua tena
          </button>
        ) : (
          <button onClick={() => setTicketStatus("closed")} className="btn-ghost btn-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Funga ombi
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm ${
                  mine
                    ? "bg-gradient-to-br from-brand-600 to-violet-600 text-white rounded-br-md"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                }`}
              >
                {m.is_staff && !mine && (
                  <p className="text-[10px] font-bold text-brand-600 mb-0.5">Customer Care</p>
                )}
                {m.body}
                <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {new Date(m.created_at).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t border-slate-100 bg-white">
        {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}
        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder="Andika ujumbe..."
            className="input resize-none max-h-32"
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary !px-3.5 !py-2.5">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
