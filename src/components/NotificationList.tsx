"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Ban,
  UploadCloud,
  RefreshCw,
  MessageCircle,
  Inbox,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";

type N = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function iconFor(type: string) {
  if (type.includes("approved")) return { Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" };
  if (type.includes("rejected")) return { Icon: XCircle, cls: "bg-rose-50 text-rose-600" };
  if (type.includes("blocked")) return { Icon: Ban, cls: "bg-orange-50 text-orange-600" };
  if (type.startsWith("update")) return { Icon: RefreshCw, cls: "bg-violet-50 text-violet-600" };
  if (type.startsWith("app")) return { Icon: UploadCloud, cls: "bg-brand-50 text-brand-600" };
  if (type.startsWith("support")) return { Icon: MessageCircle, cls: "bg-sky-50 text-sky-600" };
  return { Icon: Bell, cls: "bg-slate-100 text-slate-600" };
}

export default function NotificationList({ userId, initial }: { userId: string; initial: N[] }) {
  const supabase = useRef(createClient()).current;
  const router = useRouter();
  const [items, setItems] = useState<N[]>(initial);

  useEffect(() => {
    const channel = supabase
      .channel(`notif-list-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload: any) => setItems((prev) => [payload.new as N, ...prev])
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const unread = items.filter((i) => !i.is_read).length;

  const markAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  };

  const open = async (n: N) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, is_read: true } : i)));
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    if (n.link) router.push(n.link);
  };

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
          <Inbox className="w-7 h-7" />
        </div>
        <p className="font-bold text-slate-900">Hakuna notifications bado</p>
        <p className="text-sm text-slate-500 mt-1">Taarifa za idhini, masasisho na msaada zitaonekana hapa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {unread > 0 ? `${unread} hazijasomwa` : "Zote zimesomwa"}
        </p>
        {unread > 0 && (
          <button onClick={markAll} className="btn-soft btn-sm">
            <CheckCheck className="w-3.5 h-3.5" /> Weka zote zimesomwa
          </button>
        )}
      </div>
      <div className="card divide-y divide-slate-100 overflow-hidden">
        {items.map((n) => {
          const { Icon, cls } = iconFor(n.type);
          return (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={`w-full text-left flex gap-3 p-4 hover:bg-slate-50 transition ${
                n.is_read ? "" : "bg-brand-50/40"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${n.is_read ? "font-semibold text-slate-700" : "font-bold text-slate-900"}`}>
                    {n.title}
                  </p>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />}
                </div>
                {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
