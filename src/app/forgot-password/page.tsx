"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/settings` : undefined,
    });

    if (err) setError(err.message);
    else setMessage("Tumekutumia link ya kubadilisha password. Angalia email yako.");
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-4 sm:mt-10">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Umesahau password?</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Weka email yako tukutumie link ya kubadilisha.</p>

        {message && <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl mb-4">{message}</div>}
        {error && <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input !pl-10" placeholder="email@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? "Inatuma..." : "Tuma link"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="text-brand-600 font-bold">← Rudi kuingia</Link>
        </p>
      </div>
    </div>
  );
}
