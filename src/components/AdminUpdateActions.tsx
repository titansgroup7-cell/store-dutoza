"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminUpdateActions({ updateId }: { updateId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"" | "approve" | "reject">("");
  const [error, setError] = useState("");

  const review = async (approve: boolean) => {
    if (!approve && !note.trim()) {
      setError("Andika sababu ya kukataa ili developer ajue cha kurekebisha.");
      return;
    }
    setError("");
    setLoading(approve ? "approve" : "reject");
    const { error: err } = await supabase.rpc("review_app_update", {
      p_update_id: updateId,
      p_approve: approve,
      p_note: note.trim() || null,
    });
    if (err) setError(err.message);
    setLoading("");
    router.refresh();
  };

  return (
    <div className="space-y-2.5">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Ujumbe kwa developer (lazima ukikataa, hiari ukiidhinisha)"
        className="input !text-xs"
      />
      {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button disabled={!!loading} onClick={() => review(true)} className="btn-success btn-sm flex-1">
          <Check className="w-4 h-4" /> {loading === "approve" ? "Inaidhinisha..." : "Idhinisha sasisho"}
        </button>
        <button disabled={!!loading} onClick={() => review(false)} className="btn-danger btn-sm flex-1">
          <X className="w-4 h-4" /> {loading === "reject" ? "Inakataa..." : "Kataa"}
        </button>
      </div>
    </div>
  );
}
