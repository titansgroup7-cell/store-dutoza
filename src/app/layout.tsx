import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Store Dutoza - App Store",
  description: "Pakua apps za Dutoza kwa urahisi. Official Dutoza App Store.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sw" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="max-w-6xl w-full mx-auto px-4 py-5 sm:py-7 flex-1 pb-24 md:pb-10">
          {children}
        </main>
        <footer className="hidden md:block border-t border-slate-200/70 bg-white/60">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Store Dutoza</span>
            <div className="flex gap-5 font-medium">
              <Link href="/support" className="hover:text-brand-600">Msaada</Link>
              <Link href="/terms" className="hover:text-brand-600">Masharti</Link>
              <Link href="/privacy" className="hover:text-brand-600">Faragha</Link>
              <Link href="/developer" className="hover:text-brand-600">Developer</Link>
            </div>
          </div>
        </footer>
        <MobileNav />
      </body>
    </html>
  );
}
