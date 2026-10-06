import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Store Dutoza - App Store",
  description: "Pakua apps za Dutoza kwa urahisi. Official Dutoza App Store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw">
      <body className="antialiased bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-3 py-3 sm:py-4 flex-1">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="container mx-auto px-3 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
            <span>© {new Date().getFullYear()} Store Dutoza</span>
            <div className="flex gap-3">
              <Link href="/terms" className="hover:text-blue-600">
                Masharti
              </Link>
              <Link href="/privacy" className="hover:text-blue-600">
                Faragha
              </Link>
              <Link href="/developer" className="hover:text-blue-600">
                Developer
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
