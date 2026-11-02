"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X, Ban, Trash2, RotateCcw } from "lucide-react";

type Status = "approved" | "rejected" | "blocked" | "pending";

export default function AdminAppActions({
  appId,
  currentStatus,
}: {
  appId: string;
  currentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [askNote, setAskNote] = useState<null | "rejected" | "blocked">(null);
  const [note, setNote] = useState("");

  const setStatus = async (status: Status, adminNote: string | null = null) => {
    setLoading(true);
    const { error } = await supabase
      .from("apps")
      .update({ status, admin_note: adminNote })
      .eq("id", appId);
    if (error) alert("Hitilafu: " + error.message);
    setAskNote(null);
    setNote("");
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setLoading(true);
    const { error } = await supabase.from("apps").delete().eq("id", appId);
    if (error) {
      alert("Imeshindikana kufuta: " + error.message);
      setConfirmDelete(false);
    }
    router.refresh();
    setLoading(false);
  };

  if (askNote) {
    return (
      <div className="w-full sm:w-64 space-y-2">
        <textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder={
            askNote === "rejected" ? "Sababu ya kukataa (developer ataiona)" : "Sababu ya kuzuia"
          }
          className="input !text-xs"
        />
        <div className="flex gap-1.5">
          <button
            disabled={loading || !note.trim()}
            onClick={() => setStatus(askNote, note.trim())}
            className="btn-danger btn-sm flex-1"
          >
            {loading ? "..." : "Thibitisha"}
          </button>
          <button disabled={loading} onClick={() => setAskNote(null)} className="btn-ghost btn-sm">
            Ghairi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {currentStatus !== "approved" && currentStatus !== "blocked" && (
        <button disabled={loading} onClick={() => setStatus("approved")} className="btn-success btn-sm">
          <Check className="w-3.5 h-3.5" /> Approve
        </button>
      )}
      {currentStatus === "blocked" && (
        <button disabled={loading} onClick={() => setStatus("approved")} className="btn-soft btn-sm">
          <RotateCcw className="w-3.5 h-3.5" /> Unblock
        </button>
      )}
      {currentStatus !== "rejected" && currentStatus !== "blocked" && (
        <button disabled={loading} onClick={() => setAskNote("rejected")} className="btn-warn btn-sm">
          <X className="w-3.5 h-3.5" /> Reject
        </button>
      )}
      {currentStatus !== "blocked" && (
        <button disabled={loading} onClick={() => setAskNote("blocked")} className="btn-ghost btn-sm">
          <Ban className="w-3.5 h-3.5" /> Block
        </button>
      )}
      {confirmDelete ? (
        <>
          <button disabled={loading} onClick={handleDelete} className="btn-danger btn-sm">
            {loading ? "..." : "Ndio, futa"}
          </button>
          <button disabled={loading} onClick={() => setConfirmDelete(false)} className="btn-ghost btn-sm">
            Hapana
          </button>
        </>
      ) : (
        <button disabled={loading} onClick={handleDelete} className="btn-danger btn-sm">
          <Trash2 className="w-3.5 h-3.5" /> Futa
        </button>
      )}
    </div>
  );
}
