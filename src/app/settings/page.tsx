"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PushToggle from "@/components/PushToggle";

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
        <h1 className="page-title">
          Settings
        </h1>
        <p className="page-sub">Simamia akaunti yako</p>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-xl">
          {error}
        </div>
      )}

      <PushToggle />

      <section className="card p-5">
        <h2 className="font-bold text-slate-900 mb-3">Wasifu</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-3">
          <div>
            <label className="label">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input"
            />
          </div>
          <div>
            <label className="label">
              Jina kamili
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="Jina lako"
            />
          </div>
          <div>
            <label className="label">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="username"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary btn-sm"
          >
            {saving ? "Inahifadhi..." : "Hifadhi Wasifu"}
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="font-bold text-slate-900 mb-3">
          Badilisha Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="label">
              Password mpya
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label">
              Thibitisha password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="btn-primary btn-sm"
          >
            {pwLoading ? "..." : "Badilisha Password"}
          </button>
        </form>
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-bold text-slate-900 mb-2">Sheria & Sera</h2>
        <Link
          href="/terms"
          className="block text-sm text-brand-600 hover:underline"
        >
          Masharti ya Matumizi (Terms)
        </Link>
        <Link
          href="/privacy"
          className="block text-sm text-brand-600 hover:underline"
        >
          Sera ya Faragha (Privacy Policy)
        </Link>
        <Link
          href="/forgot-password"
          className="block text-sm text-brand-600 hover:underline"
        >
          Umesahau password?
        </Link>
      </section>

      <section className="card !border-rose-200 p-5">
        <h2 className="font-bold text-rose-700 mb-1">Futa Akaunti</h2>
        <p className="text-[11px] text-gray-500 mb-3">
          Hatua hii itafuta apps zako na wasifu. Haiwezi kutenduliwa.
        </p>
        <div className="space-y-2">
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Andika "FUTA" kuthibitisha'
            className="input !border-rose-200"
          />
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteLoading || deleteConfirm !== "FUTA"}
            className="btn bg-rose-600 text-white hover:bg-rose-700 btn-sm"
          >
            {deleteLoading ? "Inafuta..." : "Futa Akaunti Yangu"}
          </button>
        </div>
      </section>
    </div>
  );
}
