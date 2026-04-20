import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchKindergartens, type Kindergarten } from "@/lib/kindergartens";
import { HeroSection } from "@/components/hero-section";
import { KindergartensSection } from "@/components/kindergartens-section";
import { HashScrollHandler } from "@/components/hash-scroll-handler";

export const metadata: Metadata = {
  title: "Atakum Belediyesi Çocuk Gelişim Merkezi",
  description:
    "Atakum Belediyesi çocuk gelişim merkezleri ve gündüz bakımevleri. Online başvuru yapın, merkezlerimizi keşfedin. Güvenli, eğitici ve sevgi dolu ortam.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  let kindergartens: Kindergarten[];
  try {
    kindergartens = await fetchKindergartens();
  } catch (error) {
    console.error("Ana sayfa yüklenirken hata:", error);
    kindergartens = [];
  }
  const availableKindergartens = kindergartens.filter((k) => k.available);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: "Atakum Belediyesi Çocuk Gelişim Merkezi",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/atakum-logo.png`,
    description:
      "Atakum Belediyesi çocuk gelişim merkezleri ve gündüz bakımevleri.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mimar Sinan Mah. İsmet İnönü Bulv. No:114",
      addressLocality: "Atakum",
      addressRegion: "Samsun",
      addressCountry: "TR",
    },
    telephone: "444 40 55",
    email: "iletisim@atakum.bel.tr",
    sameAs: [
      "https://www.instagram.com/atakumbeltr/",
      "https://x.com/atakumbeltr",
      "https://www.facebook.com/atakumbeltr",
      "https://www.atakum.bel.tr/",
    ],
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
      
      <HashScrollHandler />
      <Header />

      <main className="flex-1 pt-16 sm:pt-18 md:pt-20">
        <HeroSection />
        <KindergartensSection kindergartens={availableKindergartens} />
      </main>

      <Footer />
    </div>
  );
}
