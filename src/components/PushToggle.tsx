"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing, BellOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { disablePush, enablePush, getPushState } from "@/lib/push";

export default function PushToggle({ highlight = false }: { highlight?: boolean }) {
  const supabase = useRef(createClient()).current;
  const [state, setState] = useState<"loading" | "unsupported" | "denied" | "off" | "on">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPushState().then(setState);
  }, []);

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      if (state === "on") {
        await disablePush(supabase);
      } else {
        await enablePush(supabase);
      }
      setState(await getPushState());
    } catch (e: any) {
      setError(e.message || "Imeshindikana");
      setState(await getPushState());
    }
    setBusy(false);
  };

  if (state === "loading") return null;

  return (
    <div
      className={`rounded-2xl p-4 flex items-center gap-3 ${
        highlight && state !== "on"
          ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow"
          : "card"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          highlight && state !== "on" ? "bg-white/20" : "bg-brand-50 text-brand-600"
        }`}
      >
        {state === "on" ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">
          {state === "on" ? "Arifa za simu zimewashwa" : "Washa arifa za simu (push)"}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            highlight && state !== "on" ? "text-white/80" : "text-slate-500"
          }`}
        >
          {state === "unsupported" &&
            "Kivinjari hiki hakiauni push. Kwenye iPhone: Share → Add to Home Screen kwanza."}
          {state === "denied" && "Umezuia ruhusa. Ruhusu notifications kwenye settings za kivinjari."}
          {state === "off" && "Pata taarifa papo hapo hata app ikiwa imefungwa."}
          {state === "on" && "Utapokea taarifa za idhini, masasisho na majibu ya msaada."}
        </p>
        {error && <p className="text-xs mt-1 text-rose-200 bg-rose-600/30 rounded px-2 py-1">{error}</p>}
      </div>
      {(state === "off" || state === "on") && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`btn btn-sm ${
            state === "on"
              ? "btn-ghost"
              : highlight
              ? "bg-white text-brand-700 hover:bg-brand-50"
              : "btn-primary"
          }`}
        >
          {busy ? "..." : state === "on" ? "Zima" : "Washa"}
        </button>
      )}
    </div>
  );
}
