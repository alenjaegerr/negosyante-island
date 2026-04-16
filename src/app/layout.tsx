import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "Negosyante Island",
  description: "Social media + culture analytics platform",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <NavBar />
        <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
