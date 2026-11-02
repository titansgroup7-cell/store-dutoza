"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  LayoutDashboard,
  Smartphone,
  Settings,
  LifeBuoy,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const supabase = useRef(createClient()).current;
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const loadProfile = async (uid: string | undefined) => {
    if (!uid) return setProfile(null);
    const { data } = await supabase
      .from("profiles")
      .select("full_name, username, is_admin")
      .eq("id", uid)
      .single();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      loadProfile(data.user?.id);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user?.id);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setMenu(false);
    router.push("/");
    router.refresh();
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/apps?q=${encodeURIComponent(q.trim())}` : "/apps");
  };

  const name = profile?.full_name || profile?.username || user?.email || "";
  const initial = name.charAt(0).toUpperCase() || "U";

  const item =
    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/icon.svg" alt="" className="w-8 h-8 rounded-xl shadow-glow" />
          <span className="font-extrabold text-[17px] tracking-tight text-slate-900 hidden sm:block">
            Store <span className="text-brand-600">Dutoza</span>
          </span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tafuta apps..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/10 border border-transparent focus:border-brand-300 transition"
          />
        </form>

        <div className="hidden md:flex items-center gap-1 ml-auto text-sm font-semibold text-slate-600">
          <Link href="/apps" className="px-3 py-1.5 rounded-full hover:bg-slate-100 transition">
            Apps
          </Link>
          <Link href="/developer" className="px-3 py-1.5 rounded-full hover:bg-slate-100 transition">
            Developer
          </Link>
          <Link href="/support" className="px-3 py-1.5 rounded-full hover:bg-slate-100 transition">
            Msaada
          </Link>
        </div>

        <div className="flex items-center gap-1.5 ml-auto md:ml-2">
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white text-sm font-bold flex items-center justify-center">
                    {initial}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>
                {menu && (
                  <div className="absolute right-0 mt-2 w-60 card shadow-float p-2 animate-slide-in">
                    <div className="px-3 py-2 mb-1 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    {profile?.is_admin && (
                      <Link href="/admin" className={item}>
                        <ShieldCheck className="w-4 h-4 text-brand-600" /> Admin Panel
                      </Link>
                    )}
                    <Link href="/developer" className={item}>
                      <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                    </Link>
                    <Link href="/developer/apps" className={item}>
                      <Smartphone className="w-4 h-4 text-slate-400" /> Apps Zangu
                    </Link>
                    <Link href="/support" className={item}>
                      <LifeBuoy className="w-4 h-4 text-slate-400" /> Customer Care
                    </Link>
                    <Link href="/settings" className={item}>
                      <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                    <button onClick={logout} className={`${item} w-full text-rose-600 hover:bg-rose-50`}>
                      <LogOut className="w-4 h-4" /> Toka
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-primary btn-sm">
              Ingia
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
