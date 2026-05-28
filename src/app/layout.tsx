import type { Metadata } from "next";
import { Roboto_Mono, Roboto_Slab, Inter, Source_Serif_4 } from "next/font/google";
import { Reddit_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import MobileGetStartedOverlay from "@/components/mobile-get-started-overlay";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import AnalyticsConsentScripts from "@/components/analytics-consent";
import SitewideMediaUploadEnhancer from "@/components/sitewide-media-upload-enhancer";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
const metadataBase = new URL(siteUrl);
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

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

const articleSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-article",
});

export const metadata: Metadata = {
  title: "Negosyante Island",
  description: "Social media + culture analytics platform",
  metadataBase,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Negosyante Island",
    description: "Social media + culture analytics platform",
    url: "/",
    siteName: "Negosyante Island",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Negosyante Island social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Negosyante Island",
    description: "Social media + culture analytics platform",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${redditMono.variable} ${robotoSlab.variable} ${inter.variable} ${articleSerif.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--ni-bg)] text-[var(--ni-text-strong)] transition-colors duration-200">
        <SitewideMediaUploadEnhancer />
        <MobileGetStartedOverlay />
        <NavBar />
        <main className="page-enter mx-auto w-full max-w-screen-2xl px-3 py-4 pb-24 sm:px-4 sm:py-4 md:pb-4">{children}</main>
        <CookieConsentBanner />
        <AnalyticsConsentScripts gaId={gaId} />
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  );
}
