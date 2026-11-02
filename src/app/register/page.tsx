"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        username: email.split("@")[0],
      });
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto mt-4 sm:mt-10">
      <div className="card p-6 sm:p-8">
        <img src="/icon.svg" alt="" className="w-12 h-12 rounded-2xl shadow-glow mb-4" />
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Jisajili</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Unda account yako ya Store Dutoza</p>

        {error && <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">Jina Kamili</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input !pl-10" placeholder="Jina lako" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input !pl-10" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input !pl-10" placeholder="Angalau herufi 6" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? "Inasajili..." : "Jisajili"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Tayari una account? <Link href="/login" className="text-brand-600 font-bold">Ingia</Link>
        </p>
        <p className="text-center text-[11px] text-slate-400 mt-3">
          Kwa kujisajili unakubali <Link href="/terms" className="text-brand-600 hover:underline">Masharti</Link> na{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">Faragha</Link>
        </p>
      </div>
    </div>
  );
}
