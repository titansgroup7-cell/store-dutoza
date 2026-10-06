"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Store <span className="text-blue-600">Dutoza</span>
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Tafuta apps..."
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/apps"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium hidden sm:block"
            >
              Apps
            </Link>
            <Link
              href="/developer"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium hidden sm:block"
            >
              Developer
            </Link>

            {user ? (
              <>
                <Link
                  href="/developer/apps"
                  className="text-gray-600 hover:text-blue-600 text-sm font-medium hidden sm:block"
                >
                  My Apps
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 text-sm font-medium"
                >
                  Toka
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
              >
                Ingia
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
