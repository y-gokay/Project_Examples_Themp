"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, FileText, ArrowRight, Building2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<"home" | "kindergartens">(
    "home",
  );
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const mobileHasSolidBg = scrolled || mobileMenuOpen || !isHomePage;

  // Tek scroll dinleyicisi: navbar görünümü + bölüm vurgusu (daha az rAF / layout)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 20);

        if (isHomePage) {
          const section = document.getElementById("merkezler");
          if (section) {
            const rect = section.getBoundingClientRect();
            setActiveSection(rect.top <= 200 ? "kindergartens" : "home");
          }
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Floating Navigation */}
      <header
        className={`hidden md:flex fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-auto max-w-5xl items-center gap-2 will-change-transform ${
          scrolled ? "top-4 scale-95 origin-top" : "top-6 scale-100"
        }`}
      >
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 rounded-full px-2 sm:px-3 py-2 sm:py-3 flex items-center gap-3 sm:gap-5 md:gap-7 pr-2 sm:pr-3 md:pr-4 transition-colors duration-300">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 pl-2 group select-none"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/50 group-hover:scale-105 transition-transform duration-300 bg-white dark:bg-transparent">
              {/* Light Mode Logo */}
              <Image
                src="/atakum-logo.png"
                alt="Atakum"
                width={48}
                height={48}
                className="object-cover dark:hidden"
                priority
              />
              {/* Dark Mode Logo */}
              <Image
                src="/atakum-logo_darkmode.png"
                alt="Atakum"
                width={48}
                height={48}
                className="object-cover hidden dark:block"
                priority
              />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-foreground/90 group-hover:text-primary transition-colors whitespace-nowrap">
              <span className="hidden sm:inline">Atakum Belediyesi </span>
              <span className="sm:hidden">Atakum </span>
              <span className="text-muted-foreground font-normal">Çocuk Gelişim Merkezi</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center bg-muted/50 dark:bg-muted/20 rounded-full px-1 sm:px-1.5 py-1 sm:py-1.5">
            <Link
              href="/"
              onClick={() => setActiveSection("home")}
              className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-medium rounded-full transition-all duration-300 select-none ${
                isHomePage && activeSection === "home"
                  ? "bg-white dark:bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/#merkezler"
              onClick={() => setActiveSection("kindergartens")}
              className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-medium rounded-full transition-all duration-300 select-none ${
                isHomePage && activeSection === "kindergartens"
                  ? "bg-white dark:bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              Çocuk Gelişim Merkezleri
            </Link>
          </nav>

          {/* Action Button */}
          <Button
            asChild
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 px-3 sm:px-4 md:px-6 h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base transition-transform active:scale-95"
          >
            <Link href="/basvuru" className="flex items-center gap-1 sm:gap-2">
              <span className="hidden sm:inline">Başvuru Yap</span>
              <span className="sm:hidden">Başvuru</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          mobileHasSolidBg
            ? "bg-background/90 backdrop-blur-lg border-b border-border/40"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between p-5">
          <Link href="/" className="flex items-center gap-3 select-none">
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white shadow-sm dark:bg-transparent dark:shadow-none">
              <Image
                src="/atakum-logo.png"
                alt="Atakum"
                width={44}
                height={44}
                className="object-cover dark:hidden"
              />
              <Image
                src="/atakum-logo_darkmode.png"
                alt="Atakum"
                width={44}
                height={44}
                className="object-cover hidden dark:block"
              />
            </div>
            <span className="font-bold text-sm sm:text-base">Atakum Çocuk Gelişim Merkezi</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 bg-muted/50 rounded-full active:scale-90 transition-transform"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-background border-t border-border/40"
            >
              <div className="p-4 space-y-4">
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 font-medium active:scale-98 transition-transform"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="w-5 h-5 text-primary" />
                    Ana Sayfa
                  </Link>
                  <Link
                    href="/#merkezler"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 font-medium active:scale-98 transition-transform"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building2 className="w-5 h-5 text-primary" />
                    Çocuk Gelişim Merkezleri
                  </Link>
                  <Link
                    href="/basvuru"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-medium active:scale-98 transition-transform"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    Başvuru Yap
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
