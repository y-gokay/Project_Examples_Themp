import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Başvuru Alındı | Atakum Belediyesi Çocuk Gelişim Merkezi",
  description:
    "Çocuk Gelişim Merkezi başvurunuz başarıyla kaydedilmiştir. Değerlendirme süreci tamamlandığında sonuç hakkında bilgilendirileceksiniz.",
};

export default function BasariliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
