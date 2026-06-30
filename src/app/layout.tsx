import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Lumora — Your AI Brand Companion",
  description:
    "Lumora is your AI-powered brand twin — turning customer insights into smart strategies, posters, and reels. Powered by Multi-Agent AI.",
  keywords: [
    "Lumora",
    "AI Brand Intelligence",
    "Brand Twin",
    "SWOT Analysis",
    "AI Strategy",
    "Marketing AI",
    "Brand Identity AI",
    "Multi-Agent AI",
  ],
  authors: [{ name: "Lumora" }],
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}