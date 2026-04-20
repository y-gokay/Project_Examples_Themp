"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative mt-0">
      {/* Curved Top Shape */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[98%] overflow-hidden leading-[0]">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px] fill-slate-900"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>

      <div className="bg-slate-900 text-slate-200 pt-12 sm:pt-14 md:pt-16 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
            {/* Brand */}
            <div className="space-y-6">
              <Link href="/" className="inline-block group">
                <div className="flex items-center gap-4">
                  {/* Logo Container - Background removed */}
                  <div className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/atakum-logo_darkmode.png"
                      alt="Atakum Belediyesi"
                      width={64}
                      height={64}
                      className="object-contain w-full h-full dark:hidden"
                    />
                    <Image
                      src="/atakum-logo_darkmode.png"
                      alt="Atakum Belediyesi"
                      width={64}
                      height={64}
                      className="object-contain w-full h-full hidden dark:block"
                    />
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-white tracking-tight">
                      Atakum
                    </span>
                    <span className="text-sm text-slate-400">
                      Çocuk Gelişim Merkezi ve Gündüz
                      <br />
                      Bakımevleri
                    </span>
                  </div>
                </div>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Geleceğimizin teminatı çocuklarımız için sevgi dolu, güvenli ve
                eğitici bir dünya kuruyoruz.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white text-lg mb-6">Keşfet</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/basvuru"
                    className="text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                    Başvuru Yap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#merkezler"
                    className="text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                    Çocuk Gelişim Merkezlerimiz
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gizlilik"
                    className="text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="/kvkk"
                    className="text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors" />
                    KVKK Aydınlatma Metni
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-white text-lg mb-6">İletişim</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-400 leading-relaxed">
                    Mimar Sinan Mah. İsmet İnönü Bulv. No:114 Atakum / SAMSUN
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a
                    href="tel:4444055"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    444 40 55
                  </a>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a
                    href="mailto:iletisim@atakum.bel.tr"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    iletisim@atakum.bel.tr
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} T.C. Atakum Belediyesi
            </p>
            <p className="text-sm text-slate-500 font-medium">
              <span className="font-bold">
                Atakum Belediyesi Bilgi İşlem Müdürlüğü
              </span>{" "}
              tarafından hazırlanmıştır.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.instagram.com/atakumbeltr/"
                aria-label="Atakum Belediyesi Instagram sayfası"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-primary hover:text-white transition-all hover:-translate-y-1"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="https://x.com/atakumbeltr"
                aria-label="Atakum Belediyesi X (Twitter) sayfası"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-primary hover:text-white transition-all hover:-translate-y-1"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.facebook.com/atakumbeltr"
                aria-label="Atakum Belediyesi Facebook sayfası"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-primary hover:text-white transition-all hover:-translate-y-1"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.atakum.bel.tr/"
                aria-label="Atakum Belediyesi resmi web sitesi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-primary hover:text-white transition-all hover:-translate-y-1"
              >
                <Globe className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
