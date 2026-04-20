import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Başvuru Formu",
  description:
    "Atakum Belediyesi çocuk gelişim merkezlerine online başvuru formu. Formu eksiksiz doldurun, başvurunuz değerlendirilecektir.",
  alternates: {
    canonical: "/basvuru",
  },
  openGraph: {
    title: "Başvuru Formu | Atakum Belediyesi Çocuk Gelişim Merkezi",
    description:
      "Çocuk gelişim merkezlerine online başvuru yapın. Formu eksiksiz doldurun, başvurunuz değerlendirilecektir.",
  },
};

export default function BasvuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
