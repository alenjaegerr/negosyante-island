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
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[var(--ni-bg)] text-[var(--ni-text-strong)] transition-colors duration-200">
        <NavBar />
        <main className="w-full flex-1">{children}</main>
        <footer className="mt-8 border-t border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-6 sm:px-4">
          <nav className="mx-auto max-w-6xl font-reddit flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-extrabold uppercase tracking-figma-tight text-[var(--ni-text)] sm:text-[13px]">
            <a href="#">Advertising</a>
            <a href="#">What We Do</a>
            <a href="#">Data Analytic Process</a>
            <a href="#">Legal</a>
            <a href="#">Privacy Policy</a>
          </nav>

          <div className="mx-auto mt-6 max-w-6xl flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="font-reddit tracking-figma-tight mb-2 text-[10px] font-extrabold leading-[1.4] text-[var(--ni-text-strong)] sm:text-[14px]">
                INTERNET CULTURE IS COMEDY GOLD
              </p>
              <div className="mt-1">
                <img src="/brand/ni-logo.png" alt="Negosyante Island" className="h-8" />
              </div>
            </div>

            <p className="font-roboto-mono self-end text-right text-[10.5px] leading-[1.4] tracking-[-0.03em] text-[var(--ni-text)] sm:text-[12px]">
              © Negosyante Island Inc. 2025
              <br />
              All Rights Reserved
            </p>
          </div>
        </footer>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  );
}
