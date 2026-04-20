"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ApplicationForm = dynamic(
  () =>
    import("@/components/application-form").then((mod) => mod.ApplicationForm),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Form yükleniyor...</div>
      </div>
    ),
    ssr: true,
  },
);

interface ApplicationContentProps {
  isOpen: boolean;
}

export function ApplicationContent({ isOpen }: ApplicationContentProps) {
  const [hasAcceptedInfo, setHasAcceptedInfo] = useState(false);
  const [infoChecked, setInfoChecked] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.div
        className="text-center mb-8 sm:mb-10 md:mb-12"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: "easeOut" }
        }
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          Çocuk Gelişim Merkezi Başvuru Formu
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-2">
          Lütfen formu eksiksiz doldurunuz. Başvurunuz değerlendirildikten sonra
          tarafınıza bilgi verilecektir.
        </p>
      </motion.div>

      {isOpen ? (
        <>
          {!hasAcceptedInfo ? (
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: 0.2 }
              }
            >
              <Card className="border border-border/60 bg-card/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl">
                <CardContent className="p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                    Başvuru Öncesi Bilgilendirme
                  </h2>
                  <div className="space-y-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    <p>
                      Bu formda verdiğiniz tüm bilgilerin doğru ve eksiksiz
                      olması gerekmektedir.{" "}
                      <span className="font-semibold text-foreground">
                        Gerçeğe aykırı beyan verildiğinin tespiti halinde
                        hakkınızda idari ve hukuki işlem uygulanabilir.
                      </span>
                    </p>
                    <p>
                      Çocuk Gelişim Merkezi kayıt hakkı kazanmanız durumunda{" "}
                      <span className="font-semibold text-foreground">
                        ikamet belgesi, gelir beyan belgesi, adli sicil kaydı,
                        SGK tescil ve hizmet dökümü
                      </span>{" "}
                      gibi istenen tüm belgeleri süresi içerisinde ibraz etmeniz
                      zorunludur. Belgeleri getirmeyen veya eksik/uygunsuz belge
                      sunan başvuru sahiplerinin{" "}
                      <span className="font-semibold text-foreground">
                        kayıt haklarını kaybetme ihtimali
                      </span>{" "}
                      bulunmaktadır.
                    </p>
                    <p>
                      Belgeler tam olsa dahi, yapılan inceleme ve değerlendirme
                      sonucunda{" "}
                      <span className="font-semibold text-foreground">
                        başvurunun kabul edilmeyebileceğini
                      </span>{" "}
                      ve bu durumun idarenin takdirinde olduğunu kabul etmiş
                      olursunuz.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 pt-3">
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer select-none transition-all duration-200 ${
                        infoChecked
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : "border-red-400 bg-red-50/60 dark:bg-red-950/20"
                      }`}
                    >
                      <Checkbox
                        checked={infoChecked}
                        onCheckedChange={(checked) =>
                          setInfoChecked(!!checked)
                        }
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          !infoChecked
                            ? "border-red-400 data-[state=unchecked]:border-red-400"
                            : ""
                        }`}
                      />
                      <span
                        className={`text-sm sm:text-base font-medium leading-snug ${
                          infoChecked
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 dark:text-red-400"
                        }`}
                      >
                        Bilgilendirme metnini okudum, anladım ve koşulları kabul
                        ediyorum.
                      </span>
                    </label>
                    <Button
                      type="button"
                      size="lg"
                      disabled={!infoChecked}
                      onClick={() => setHasAcceptedInfo(true)}
                      className="rounded-full w-full sm:w-auto self-end"
                    >
                      Başvuruya Başla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: 0.2 }
              }
            >
              <ApplicationForm />
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.2 }
          }
        >
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: shouldReduceMotion ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.3,
                      }
                }
              >
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
              </motion.div>
              <motion.h2
                className="text-2xl font-bold mb-4"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.5, delay: 0.4 }
                }
              >
                Kayıtlar Kapalı
              </motion.h2>
              <motion.p
                className="text-muted-foreground mb-6 leading-relaxed"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.5, delay: 0.5 }
                }
              >
                Bu dönem için kayıt kapanmıştır.
                <br />
                Yeni kayıt dönemleri hakkında bilgi almak için lütfen{" "}
                <a
                  href="tel:4444055"
                  className="text-primary font-medium underline underline-offset-2 hover:no-underline"
                >
                  444 40 55
                </a>{" "}
                numaralı telefondan arayabilir veya{" "}
                <a
                  href="mailto:iletisim@atakum.bel.tr"
                  className="text-primary font-medium underline underline-offset-2 hover:no-underline"
                >
                  iletisim@atakum.bel.tr
                </a>{" "}
                adresine yazabilirsiniz.
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
