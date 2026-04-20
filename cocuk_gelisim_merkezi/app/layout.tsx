import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScrollbarWidthFix } from "@/components/scrollbar-width-fix";
import "./globals.css";

// Font optimizasyonu - display swap ile daha hızlı render
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Mono font daha az kullanıldığı için preload false
  variable: "--font-geist-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Atakum Belediyesi Çocuk Gelişim Merkezi",
    template: "%s | Atakum Belediyesi Çocuk Gelişim Merkezi",
  },
  description:
    "Atakum Belediyesi çocuk gelişim merkezlerine online başvuru yapın. Güvenli, eğitici ve sevgi dolu ortamda çocuğunuzun gelişimine katkı sağlayın.",
  keywords: [
    "Atakum",
    "çocuk gelişim merkezi",
    "kreş",
    "gündüz bakımevi",
    "Samsun",
    "Atakum Belediyesi",
    "online başvuru",
    "okul öncesi eğitim",
  ],
  authors: [{ name: "Atakum Belediyesi Bilgi İşlem Müdürlüğü" }],
  icons: {
    icon: "/atakum-logo.png",
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Atakum Belediyesi Çocuk Gelişim Merkezi Başvuru Sistemi",
    description:
      "Atakum Belediyesi çocuk gelişim merkezlerine online başvuru yapın. Güvenli, eğitici ve sevgi dolu ortamda çocuğunuzun gelişimine katkı sağlayın.",
    type: "website",
    url: siteUrl,
    locale: "tr_TR",
    siteName: "Atakum Belediyesi Çocuk Gelişim Merkezi",
    images: [
      {
        url: "/atacocukgraph.webp",
        width: 1200,
        height: 630,
        alt: "Atakum Belediyesi Çocuk Gelişim Merkezi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atakum Belediyesi Çocuk Gelişim Merkezi",
    description:
      "Çocuk gelişim merkezlerine online başvuru yapın. Güvenli ve eğitici ortamda çocuğunuzun gelişimine katkı sağlayın.",
    images: ["/atacocukgraph.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        <ScrollbarWidthFix />
        {children}
      </body>
    </html>
  );
}
