import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

const PhotoGallery = dynamic(
  () => import("@/components/photo-gallery").then((mod) => mod.PhotoGallery),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    ),
    ssr: true,
  },
);
import { fetchKindergartenById } from "@/lib/kindergartens";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kindergarten = await fetchKindergartenById(id);

  if (!kindergarten) {
    return { title: "Çocuk Gelişim Merkezi Bulunamadı" };
  }

  const description =
    kindergarten.description?.slice(0, 155) ||
    `${kindergarten.name} - Atakum Belediyesi Çocuk Gelişim Merkezi hakkında bilgi edinin ve başvuru yapın.`;

  return {
    title: kindergarten.name,
    description,
    alternates: {
      canonical: `/cgmerkezler/${id}`,
    },
    openGraph: {
      title: `${kindergarten.name} | Atakum Belediyesi Çocuk Gelişim Merkezi`,
      description,
      type: "article",
      images: kindergarten.image
        ? [{ url: kindergarten.image, alt: kindergarten.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: kindergarten.name,
      description,
      images: kindergarten.image ? [kindergarten.image] : [],
    },
  };
}

export default async function KindergartenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kindergarten = await fetchKindergartenById(id);

  if (!kindergarten) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ChildCare",
    name: kindergarten.name,
    description: kindergarten.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: kindergarten.address,
      addressLocality: "Atakum",
      addressRegion: "Samsun",
      addressCountry: "TR",
    },
    telephone: kindergarten.phone,
    email: kindergarten.email,
    image: kindergarten.gallery,
    ...(kindergarten.latitude &&
      kindergarten.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: kindergarten.latitude,
          longitude: kindergarten.longitude,
        },
      }),
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: "Atakum Belediyesi",
      url: "https://www.atakum.bel.tr",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
        {/* Hero Section with Background Image */}
        <section
          className="relative h-[280px] sm:h-[320px] md:h-[400px] lg:h-[500px] bg-cover bg-center rounded-b-[1.5rem] sm:rounded-b-[2rem] md:rounded-b-[2.5rem] lg:rounded-b-[3rem] overflow-hidden mx-2 sm:mx-4 md:mx-6 lg:mx-8 shadow-2xl"
          style={{ backgroundImage: `url(${kindergarten.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="relative h-full container mx-auto px-4 sm:px-6 flex flex-col justify-end pb-6 sm:pb-8 md:pb-12">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 sm:mb-3 md:mb-4 tracking-tight drop-shadow-lg">
                {kindergarten.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90 mb-4 sm:mb-5 md:mb-6 font-medium">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                <span className="text-sm sm:text-base md:text-lg">
                  {kindergarten.address}
                </span>
              </div>
              {!kindergarten.available && (
                <div className="inline-block bg-rose-500 text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-bold shadow-lg shadow-rose-900/30 backdrop-blur-md">
                  Kontenjan Dolu
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description */}
                  <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-primary">
                        Hakkında
                      </h2>
                      <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                        {kindergarten.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
                        Özellikler
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                        {kindergarten.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                          >
                            <div className="p-1.5 rounded-full bg-green-100 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                            <span className="text-foreground/80 font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {kindergarten.ageGroups &&
                        kindergarten.ageGroups.length > 0 && (
                          <>
                            <h3 className="text-lg font-bold mb-3 mt-6 text-primary">
                              Kabul Edilen Yaş Grupları
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {kindergarten.ageGroups.map((group) => (
                                <div
                                  key={group.id}
                                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-100"
                                >
                                  {group.name} Yaş
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                    </CardContent>
                  </Card>

                  {/* Photo Gallery */}
                  <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
                        Fotoğraf Galerisi
                      </h2>
                      <PhotoGallery
                        images={kindergarten.gallery}
                        name={kindergarten.name}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - Sticky Wrapper */}
                <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-32 h-fit">
                  {/* Info Card */}
                  <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                      <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-primary">
                        İletişim Bilgileri
                      </h3>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                            Telefon
                          </p>
                          <p className="font-semibold text-lg">
                            {kindergarten.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                            E-posta
                          </p>
                          <p className="font-medium break-all">
                            {kindergarten.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30">
                          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                              Adres
                            </p>
                            <p className="font-medium">
                              {kindergarten.address}
                            </p>
                          </div>
                        </div>

                        {/* Google Maps Iframe */}
                        <div className="w-full h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner border border-border/50">
                          <iframe
                            title={`${kindergarten.name} - Harita`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${
                              kindergarten.latitude && kindergarten.longitude
                                ? `${kindergarten.latitude},${kindergarten.longitude}`
                                : encodeURIComponent(kindergarten.address)
                            }&output=embed`}
                          ></iframe>
                        </div>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${
                            kindergarten.latitude && kindergarten.longitude
                              ? `${kindergarten.latitude},${kindergarten.longitude}`
                              : encodeURIComponent(kindergarten.address)
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full p-3 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                        >
                          <span>Haritada Gör</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CTA Card */}
                  <Card className="bg-gradient-to-br from-primary to-blue-900 text-white rounded-[1.5rem] sm:rounded-[2rem] border-0 shadow-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:p-8 relative">
                      {/* Decorative Circles */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                      <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 relative z-10">
                        Başvuru Yapın
                      </h3>
                      <p className="text-white/90 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed relative z-10">
                        {kindergarten.available
                          ? "Online başvuru formunu doldurarak hemen kayıt sürecini başlatabilirsiniz."
                          : "Şu an kontenjanımız dolu ancak yeni dönem için takipte kalabilirsiniz."}
                      </p>
                      {kindergarten.available ? (
                        <Button
                          asChild
                          className="w-full bg-white text-primary hover:bg-white/90 font-bold h-11 sm:h-12 rounded-xl shadow-lg relative z-10 text-sm sm:text-base"
                        >
                          <Link
                            href="/basvuru"
                            className="flex items-center justify-center gap-2"
                          >
                            Hemen Başvur
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-white/30 text-white bg-white/10 hover:bg-white/20 font-bold h-11 sm:h-12 rounded-xl relative z-10 text-sm sm:text-base"
                        >
                          <Link href="/cgmerkezler">
                            Diğer Çocuk Gelişim Merkezleri İncele
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
