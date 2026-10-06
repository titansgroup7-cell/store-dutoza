import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
      <body className="antialiased bg-gray-50 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-3 py-3 sm:py-4">{children}</main>
      </body>
    </html>
  );
}
