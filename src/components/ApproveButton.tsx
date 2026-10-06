"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveButton({ appId }: { appId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    await supabase.from("apps").update({ status }).eq("id", appId);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Approve
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium"
      >
        Reject
      </button>
    </div>
  );
}
