import type { Metadata } from "next";
import { Roboto_Flex, Roboto_Mono } from "next/font/google";
import { Reddit_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-flex",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const redditMono = Reddit_Mono({
  subsets: ["latin"],
  variable: "--font-reddit",
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
    <html lang="en" className={`${robotoFlex.variable} ${robotoMono.variable} ${redditMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <NavBar />
        <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  );
}
