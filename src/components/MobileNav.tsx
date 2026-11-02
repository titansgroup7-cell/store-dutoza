"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, PlusCircle, LifeBuoy, User } from "lucide-react";

const items = [
  { href: "/", label: "Nyumbani", icon: Home },
  { href: "/apps", label: "Apps", icon: LayoutGrid },
  { href: "/developer", label: "Developer", icon: PlusCircle },
  { href: "/support", label: "Msaada", icon: LifeBuoy },
  { href: "/settings", label: "Akaunti", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-slate-200/70 pb-safe">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition ${
                active ? "text-brand-600" : "text-slate-500"
              }`}
            >
              <span
                className={`px-4 py-1 rounded-full transition ${active ? "bg-brand-50" : ""}`}
              >
                <Icon className="w-5 h-5" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
