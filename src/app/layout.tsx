import type { Metadata } from "next";
import { Roboto_Mono, Roboto_Slab, Inter } from "next/font/google";
import { Reddit_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const redditMono = Reddit_Mono({
  subsets: ["latin"],
  variable: "--font-reddit",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-slab",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Negosyante Island",
  description: "Social media + culture analytics platform",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${redditMono.variable} ${robotoSlab.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--ni-bg)] text-[var(--ni-text-strong)] transition-colors duration-200">
        <NavBar />
        <main className="mx-auto w-full max-w-6xl px-2 py-3 sm:p-4">{children}</main>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  );
}
