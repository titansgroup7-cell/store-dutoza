"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CancelUpdateButton({ updateId }: { updateId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cancel = async () => {
    if (!confirm("Futa ombi hili la sasisho?")) return;
    setLoading(true);
    const { error } = await supabase.from("app_updates").delete().eq("id", updateId);
    if (error) alert(error.message);
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={cancel} disabled={loading} className="btn-ghost btn-sm">
      {loading ? "..." : "Futa ombi"}
    </button>
  );
}
