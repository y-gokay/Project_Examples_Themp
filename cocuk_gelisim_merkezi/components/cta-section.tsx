"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-t from-orange-50 to-transparent dark:from-orange-950/20 dark:to-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.6, ease: "easeOut" }
          }
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Online Başvuru
          </h2>
          <motion.p
            className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.2 }
            }
          >
            Başvuru formunu doldurarak çocuk gelişim merkezi kontenjanlarından
            yararlanabilirsiniz
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.4 }
            }
          >
            <Button asChild size="lg">
              <Link href="/basvuru">Başvuru Formuna Git</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
