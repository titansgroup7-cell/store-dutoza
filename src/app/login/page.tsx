"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Ingia</h1>
        <p className="text-gray-500 text-xs mb-4">Karibu tena kwenye Store Dutoza</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[11px] font-medium text-gray-600">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-blue-600 hover:underline"
              >
                Umesahau?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-full text-xs transition"
          >
            {loading ? "Inaingia..." : "Ingia"}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-500 mt-4">
          Huna account?{" "}
          <Link href="/register" className="text-blue-600 font-medium">
            Jisajili
          </Link>
        </p>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Kwa kuingia unakubali{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Masharti
          </Link>{" "}
          na{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Faragha
          </Link>
        </p>
      </div>
    </div>
  );
}
