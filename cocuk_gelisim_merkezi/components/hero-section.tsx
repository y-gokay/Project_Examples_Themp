"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";

const HERO_IMAGES = ["/atacouck.webp", "/atacocukgraph.webp"];

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Hareket azaltma tercihinde otomatik slayt geçişini kapat
    if (shouldReduceMotion) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  const prevImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length,
    );
  }, []);

  // Memoize doodle images to prevent re-renders
  const doodleImages = useMemo(
    () => [
      {
        src: "/doodle/rocket.svg",
        alt: "",
        width: 320,
        height: 320,
        className:
          "absolute -right-8 sm:-right-12 md:-right-16 top-1/4 w-48 sm:w-64 md:w-72 lg:w-80 rotate-12 opacity-50 drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)]",
      },
      {
        src: "/doodle/rocket.svg",
        alt: "",
        width: 160,
        height: 160,
        className:
          "absolute -left-8 sm:-left-12 md:-left-20 top-8 w-24 sm:w-28 md:w-32 -rotate-18 opacity-25",
      },
      {
        src: "/doodle/sun.svg",
        alt: "",
        width: 200,
        height: 200,
        className:
          "absolute top-12 right-1/4 w-32 sm:w-36 md:w-40 lg:w-48 rotate-45 opacity-40",
      },
      {
        src: "/doodle/sun.svg",
        alt: "",
        width: 120,
        height: 120,
        className:
          "absolute top-32 left-1/4 w-20 sm:w-22 md:w-24 -rotate-12 opacity-20",
      },
      {
        src: "/doodle/rainbow.svg",
        alt: "",
        width: 300,
        height: 150,
        className:
          "absolute top-32 left-1/2 -translate-x-1/2 w-48 sm:w-56 md:w-64 lg:w-80 rotate-3 opacity-30",
      },
      {
        src: "/doodle/rainbow.svg",
        alt: "",
        width: 200,
        height: 100,
        className:
          "absolute bottom-20 right-1/4 w-32 sm:w-36 md:w-40 rotate-12 opacity-20",
      },
      {
        src: "/doodle/cloud.svg",
        alt: "",
        width: 180,
        height: 120,
        className:
          "absolute top-16 left-4 sm:left-6 md:left-8 w-28 sm:w-32 md:w-36 lg:w-44 rotate-6 opacity-35",
      },
      {
        src: "/doodle/cloud.svg",
        alt: "",
        width: 220,
        height: 150,
        className:
          "absolute top-1/3 right-4 sm:right-6 md:right-8 w-36 sm:w-40 md:w-44 lg:w-52 -rotate-8 opacity-30",
      },
      {
        src: "/doodle/cloud.svg",
        alt: "",
        width: 140,
        height: 90,
        className:
          "absolute bottom-32 left-1/3 w-24 sm:w-26 md:w-28 rotate-15 opacity-25",
      },
      {
        src: "/doodle/plane.svg",
        alt: "",
        width: 200,
        height: 120,
        className:
          "absolute top-1/4 left-4 sm:left-8 md:left-12 w-32 sm:w-36 md:w-40 lg:w-48 rotate-25 opacity-40",
      },
      {
        src: "/doodle/plane.svg",
        alt: "",
        width: 150,
        height: 90,
        className:
          "absolute bottom-1/4 right-4 sm:right-8 md:right-12 w-24 sm:w-28 md:w-32 -rotate-20 opacity-25",
      },
      {
        src: "/doodle/car.svg",
        alt: "",
        width: 180,
        height: 120,
        className:
          "absolute bottom-16 left-1/4 w-28 sm:w-32 md:w-36 lg:w-44 rotate-8 opacity-35",
      },
      {
        src: "/doodle/car.svg",
        alt: "",
        width: 140,
        height: 90,
        className:
          "absolute top-1/2 right-1/3 w-24 sm:w-26 md:w-28 -rotate-12 opacity-20",
      },
      {
        src: "/doodle/girl.svg",
        alt: "",
        width: 200,
        height: 250,
        className:
          "absolute bottom-8 left-4 sm:left-8 w-32 sm:w-36 md:w-40 lg:w-48 -rotate-6 opacity-45",
      },
      {
        src: "/doodle/boy.svg",
        alt: "",
        width: 200,
        height: 250,
        className:
          "absolute bottom-12 right-4 sm:right-8 md:right-16 w-32 sm:w-36 md:w-40 lg:w-48 rotate-8 opacity-45",
      },
    ],
    [],
  );

  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-24 pb-8 md:pb-12 overflow-hidden bg-transparent">
      {/* Children's Doodle-style Drawings - Lazy loaded */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {doodleImages.map((doodle, index) => (
          <Image
            key={`${doodle.src}-${index}`}
            src={doodle.src}
            alt={doodle.alt}
            aria-hidden="true"
            width={doodle.width}
            height={doodle.height}
            className={doodle.className}
            loading="lazy"
            fetchPriority="low"
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium text-sm mb-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span>Mutlu Çocuklar, Güvenli Yarınlar</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] mb-6 md:mb-8 text-foreground">
              Oyunla ve
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 relative">
                Güvenle
                <svg
                  className="absolute w-full h-2 md:h-3 -bottom-1 left-0 text-primary opacity-30"
                  viewBox="0 0 200 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.00025 6.99997C2.00025 6.99997 23.3551 2.21953 45.4211 4.36449C65.2536 6.29235 78.4908 6.77259 97.464 6.73278C117.765 6.69018 132.898 5.62629 152.923 3.65345C170.835 1.88909 198.001 2.00002 198.001 2.00002"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 md:mb-10 max-w-lg">
              Atakum Belediyesi çocuk gelişim merkezlerinde çocuklarınızı
              güvenle bırakın.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 text-sm md:text-base lg:text-lg shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 active:scale-95"
              >
                <Link href="/basvuru">
                  Başvuru Yap
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 text-sm md:text-base lg:text-lg border-2 hover:bg-muted transition-all duration-300 active:scale-95"
              >
                <Link href="/#merkezler">Çocuk Gelişim Merkezleri Keşfet</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Visuals - Image Slider */}
          <motion.div
            className="relative order-1 lg:order-2 mb-8 lg:mb-0 w-full max-w-[500px] mx-auto lg:max-w-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Organic Blob Frame */}
            <div className="relative z-10 w-full aspect-square will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-[3rem] rotate-3 transform transition-transform duration-500" />
              {/* Masking Container - Added translate-z-0 and rounded corners directly */}
              <div
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] -rotate-3 overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 isolate"
                style={{ transform: "translateZ(0)" }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={currentImageIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Image
                      src={HERO_IMAGES[currentImageIndex]}
                      alt="Mutlu Çocuklar"
                      fill
                      className={`rounded-[3rem] ${
                        HERO_IMAGES[currentImageIndex].includes("atacocukgraph")
                          ? "object-contain p-4 sm:p-6"
                          : "object-cover"
                      }`}
                      priority={currentImageIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Slider Controls */}
                <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                  <button
                    onClick={prevImage}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white transition-colors border border-white/30 active:scale-90"
                    aria-label="Önceki Fotoğraf"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white transition-colors border border-white/30 active:scale-90"
                    aria-label="Sonraki Fotoğraf"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
