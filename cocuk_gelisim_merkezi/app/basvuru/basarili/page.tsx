"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Home, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function BasvuruBasariliPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16 ">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="border-2 border-emerald-600/30 dark:border-emerald-500/30 bg-card shadow-xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                  >
                    <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14" />
                  </motion.div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Başvurunuz Alındı
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
                    Çocuk Gelişim Merkezi başvurunuz başarıyla kaydedilmiştir. Değerlendirme
                    süreci tamamlandığında sonuç hakkında
                    bilgilendirileceksiniz.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button asChild size="lg" className="rounded-full">
                      <Link href="/" className="inline-flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Ana Sayfaya Dön
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-full"
                    >
                      <Link
                        href="/basvuru"
                        className="inline-flex items-center gap-2"
                      >
                        <FileText className="h-5 w-5" />
                        Yeni Başvuru
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
