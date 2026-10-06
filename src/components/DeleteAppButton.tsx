"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAppButton({
  appId,
  appName,
}: {
  appId: string;
  appName: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("apps").delete().eq("id", appId);
    if (error) {
      alert("Imeshindikana kufuta: " + error.message);
      setLoading(false);
      setConfirm(false);
      return;
    }
    router.refresh();
    setLoading(false);
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          {loading ? "..." : "Thibitisha"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg text-[11px] font-medium"
        >
          Ghairi
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-red-100"
      title={`Futa ${appName}`}
    >
      Futa
    </button>
  );
}
