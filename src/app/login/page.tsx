"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next && next.startsWith("/") ? next : "/");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto mt-4 sm:mt-10">
      <div className="card p-6 sm:p-8">
        <img src="/icon.svg" alt="" className="w-12 h-12 rounded-2xl shadow-glow mb-4" />
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Karibu tena</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Ingia kwenye Store Dutoza</p>

        {error && <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input !pl-10" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand-600 font-semibold hover:underline">Umesahau?</Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input !pl-10" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? "Inaingia..." : "Ingia"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Huna account? <Link href="/register" className="text-brand-600 font-bold">Jisajili</Link>
        </p>
        <p className="text-center text-[11px] text-slate-400 mt-3">
          Kwa kuingia unakubali <Link href="/terms" className="text-brand-600 hover:underline">Masharti</Link> na{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">Faragha</Link>
        </p>
      </div>
    </div>
  );
}
