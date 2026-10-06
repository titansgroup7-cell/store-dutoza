"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const setStatus = async (status: Status) => {
    setLoading(true);
    const { error } = await supabase
      .from("apps")
      .update({ status })
      .eq("id", appId);
    if (error) {
      alert("Hitilafu: " + error.message);
    }
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("apps").delete().eq("id", appId);
    if (error) {
      alert("Imeshindikana kufuta: " + error.message);
      setLoading(false);
      setConfirmDelete(false);
      return;
    }
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[100px]">
      {currentStatus !== "approved" && (
        <button
          onClick={() => setStatus("approved")}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          Approve
        </button>
      )}
      {currentStatus !== "rejected" && (
        <button
          onClick={() => setStatus("rejected")}
          disabled={loading}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          Reject
        </button>
      )}
      {currentStatus !== "blocked" && (
        <button
          onClick={() => setStatus("blocked")}
          disabled={loading}
          className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          Block
        </button>
      )}
      {currentStatus === "blocked" && (
        <button
          onClick={() => setStatus("approved")}
          disabled={loading}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          Unblock
        </button>
      )}

      {confirmDelete ? (
        <div className="flex gap-1">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[11px] font-medium"
          >
            {loading ? "..." : "Ndio"}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            disabled={loading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-[11px] font-medium"
          >
            Hapana
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          Futa
        </button>
      )}
    </div>
  );
}
