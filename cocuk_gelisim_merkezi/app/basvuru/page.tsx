import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { apiConfig, isKresMockMode } from "@/lib/api-config";
import { ApplicationContent } from "@/components/application-content";

export const metadata: Metadata = {
  title: "Başvuru Formu | Atakum Belediyesi Çocuk Gelişim Merkezi",
  description:
    "Atakum Belediyesi Çocuk Gelişim Merkezi online başvuru formu. Başvurunuzu kolayca yapın.",
  alternates: {
    canonical: "/basvuru",
  },
};

async function checkApplicationOpen(): Promise<boolean> {
  if (isKresMockMode) {
    return true;
  }
  try {
    const response = await fetch(apiConfig.endpoints.applications.open, {
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.open === true;
  } catch (error) {
    console.error("Başvuru durumu kontrol edilemedi:", error);
    return false;
  }
}

export default async function ApplicationPage() {
  const isOpen = await checkApplicationOpen();

  return (
    <div className="flex min-h-screen max-h-screen flex-col relative overflow-y-auto no-scrollbar">
      <Header />

      {/* Children's Doodle Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Rainbow */}
        <Image
          src="/doodle/rainbow.svg"
          alt=""
          aria-hidden="true"
          width={250}
          height={125}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-48 md:w-64 opacity-15"
          loading="lazy"
        />
        <Image
          src="/doodle/rainbow.svg"
          alt=""
          aria-hidden="true"
          width={180}
          height={90}
          className="absolute bottom-24 right-1/4 w-36 rotate-12 opacity-12"
          loading="lazy"
        />

        {/* Sun */}
        <Image
          src="/doodle/sun.svg"
          alt=""
          aria-hidden="true"
          width={150}
          height={150}
          className="absolute top-16 right-1/3 w-28 rotate-45 opacity-15"
          loading="lazy"
        />
        <Image
          src="/doodle/sun.svg"
          alt=""
          aria-hidden="true"
          width={120}
          height={120}
          className="absolute top-40 left-1/4 w-24 -rotate-20 opacity-12"
          loading="lazy"
        />

        {/* Cloud */}
        <Image
          src="/doodle/cloud.svg"
          alt=""
          aria-hidden="true"
          width={180}
          height={120}
          className="absolute bottom-32 left-1/3 w-32 rotate-6 opacity-12"
          loading="lazy"
        />
        <Image
          src="/doodle/cloud.svg"
          alt=""
          aria-hidden="true"
          width={160}
          height={100}
          className="absolute top-1/3 right-8 w-28 -rotate-8 opacity-10"
          loading="lazy"
        />
        <Image
          src="/doodle/cloud.svg"
          alt=""
          aria-hidden="true"
          width={140}
          height={90}
          className="absolute bottom-40 left-8 w-24 rotate-12 opacity-10"
          loading="lazy"
        />

        {/* Rocket */}
        <Image
          src="/doodle/rocket.svg"
          alt=""
          aria-hidden="true"
          width={160}
          height={160}
          className="absolute top-1/4 left-12 w-28 -rotate-18 opacity-15"
          loading="lazy"
        />
        <Image
          src="/doodle/rocket.svg"
          alt=""
          aria-hidden="true"
          width={140}
          height={140}
          className="absolute bottom-20 right-12 w-24 rotate-12 opacity-12"
          loading="lazy"
        />

        {/* Plane */}
        <Image
          src="/doodle/plane.svg"
          alt=""
          aria-hidden="true"
          width={150}
          height={90}
          className="absolute top-1/2 right-1/4 w-28 -rotate-15 opacity-12"
          loading="lazy"
        />
        <Image
          src="/doodle/plane.svg"
          alt=""
          aria-hidden="true"
          width={120}
          height={70}
          className="absolute bottom-1/3 left-1/4 w-24 rotate-20 opacity-10"
          loading="lazy"
        />

        {/* Car */}
        <Image
          src="/doodle/car.svg"
          alt=""
          aria-hidden="true"
          width={140}
          height={90}
          className="absolute bottom-16 left-1/4 w-28 rotate-8 opacity-12"
          loading="lazy"
        />
      </div>

      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-8 sm:pb-10 md:pb-12 lg:pb-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <ApplicationContent isOpen={isOpen} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
