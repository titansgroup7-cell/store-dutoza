"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setUsername(profile.username || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        username: username.trim() || null,
      })
      .eq("id", user.id);

    if (err) {
      setError(err.message);
    } else {
      setMessage("Wasifu umesasishwa.");
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Password lazima iwe angalau herufi 6.");
      setPwLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password hazifanani.");
      setPwLoading(false);
      return;
    }

    const { error: err } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (err) {
      setError(err.message);
    } else {
      setMessage("Password imebadilishwa.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "FUTA") {
      setError('Andika "FUTA" ili kuthibitisha.');
      return;
    }
    setDeleteLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("apps").delete().eq("developer_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    setMessage(
      "Akaunti yako imefutwa kwenye store. Unaweza kuomba ufutaji kamili wa email kwa admin."
    );
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Inapakia...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-500 text-xs">Simamia akaunti yako</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 text-xs p-2.5 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Wasifu</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
              Jina kamili
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Jina lako"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="username"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-full text-xs font-medium"
          >
            {saving ? "Inahifadhi..." : "Hifadhi Wasifu"}
          </button>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          Badilisha Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
              Password mpya
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">
              Thibitisha password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-full text-xs font-medium"
          >
            {pwLoading ? "..." : "Badilisha Password"}
          </button>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Sheria & Sera</h2>
        <Link
          href="/terms"
          className="block text-xs text-blue-600 hover:underline"
        >
          Masharti ya Matumizi (Terms)
        </Link>
        <Link
          href="/privacy"
          className="block text-xs text-blue-600 hover:underline"
        >
          Sera ya Faragha (Privacy Policy)
        </Link>
        <Link
          href="/forgot-password"
          className="block text-xs text-blue-600 hover:underline"
        >
          Umesahau password?
        </Link>
      </section>

      <section className="bg-white border border-red-200 rounded-xl p-4">
        <h2 className="text-sm font-bold text-red-700 mb-1">Futa Akaunti</h2>
        <p className="text-[11px] text-gray-500 mb-3">
          Hatua hii itafuta apps zako na wasifu. Haiwezi kutenduliwa.
        </p>
        <div className="space-y-2">
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Andika "FUTA" kuthibitisha'
            className="w-full px-3 py-2 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteLoading || deleteConfirm !== "FUTA"}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1.5 rounded-full text-xs font-medium"
          >
            {deleteLoading ? "Inafuta..." : "Futa Akaunti Yangu"}
          </button>
        </div>
      </section>
    </div>
  );
}
