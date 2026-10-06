"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/settings`
          : undefined,
    });

    if (err) {
      setError(err.message);
    } else {
      setMessage(
        "Tumekutumia link ya ku-reset password kwenye email yako. Angalia inbox (na spam)."
      );
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          Umesahau Password?
        </h1>
        <p className="text-gray-500 text-xs mb-4">
          Weka email yako, tutakutumia link ya kuweka password mpya.
        </p>

        {message && (
          <div className="bg-green-50 text-green-700 text-xs p-2.5 rounded-lg mb-3">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-full text-xs"
          >
            {loading ? "Inatuma..." : "Tuma Link ya Reset"}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-500 mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            Rudi kuingia
          </Link>
        </p>
      </div>
    </div>
  );
}
