"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Toast = { id: string; title: string; body?: string; link?: string };

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = useRef(createClient()).current;
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnread(count || 0);
  };

  useEffect(() => {
    refreshCount();
    const channel = supabase
      .channel(`notif-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload: any) => {
          refreshCount();
          if (payload.eventType === "INSERT") {
            const n = payload.new;
            setToast({ id: n.id, title: n.title, body: n.body, link: n.link });
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setToast(null), 7000);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <>
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>

      {toast && (
        <div className="fixed top-16 right-3 left-3 sm:left-auto sm:w-96 z-[100] animate-slide-in">
          <div
            onClick={() => {
              setToast(null);
              router.push(toast.link || "/notifications");
            }}
            className="cursor-pointer card shadow-float p-3.5 flex gap-3 items-start border-brand-200"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 leading-snug">{toast.title}</p>
              {toast.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.body}</p>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Funga"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
