"use client";

import { motion } from "framer-motion";
import { KindergartenCard } from "@/components/kindergarten-card";
import { Kindergarten } from "@/lib/kindergartens";

interface KindergartensSectionProps {
  kindergartens: Kindergarten[];
}

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function KindergartensSection({
  kindergartens,
}: KindergartensSectionProps) {
  return (
    <section
      id="merkezler"
      className="scroll-mt-28 sm:scroll-mt-32 pt-16 sm:pt-20 md:pt-24 pb-32 sm:pb-40 md:pb-48 bg-muted/60 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <span>Çocuk Gelişim Merkezlerimiz Keşfedin</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 tracking-tight"
          >
            Atakum Belediyesi Çocuk Gelişim Merkezleri
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4"
          >
            Atakum Belediyesi çocuk gelişim merkezlerinde çocuklarınızı güvenle
            bırakın. Çocuk Gelişim Merkezlerimizden size en yakın olanı seçin.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08, margin: "0px 0px -12% 0px" }}
        >
          {kindergartens.map((kindergarten, index) => (
            <motion.div
              key={kindergarten.id}
              variants={gridItemVariants}
              className={
                index === 0 || index === 3 ? "sm:col-span-2 lg:col-span-2" : ""
              }
            >
              <KindergartenCard {...kindergarten} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
