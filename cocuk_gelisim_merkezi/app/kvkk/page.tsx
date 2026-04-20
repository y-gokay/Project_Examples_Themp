import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  FileText,
  Clock,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Atakum Belediyesi Çocuk Gelişim Merkezi KVKK Aydınlatma Metni. Kişisel verilerinizin işlenmesine ilişkin bilgilendirme.",
  alternates: {
    canonical: "/kvkk",
  },
};

export default function KVKKPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* 
        Footer'ın üstündeki dalga (wave) şeklinin içeriğin üstüne binmemesi için 
        alt boşluğu (padding-bottom) artırdık: pb-32 sm:pb-40 md:pb-48 
      */}
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 pb-32 sm:pb-40 md:pb-48 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 bg-muted/50 px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-primary mb-4 tracking-tight">
                Kişisel Verileriniz Hakkında Bilgilendirme
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Atakum Belediyesi olarak size ve çocuklarınıza ait bilgileri
                önemsiyor, güvenle saklıyor ve sadece başvurunuzu değerlendirmek
                için kullanıyoruz. Aşağıda bu süreci herkesin anlayabileceği
                şeffaf bir dille özetledik.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Hangi Bilgilerinizi İstiyoruz?
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Başvuru formunu doldururken sizden şu bilgileri
                        alıyoruz:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base text-foreground/80">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            <strong>Sizin Bilgileriniz:</strong> Adınız, TC
                            kimlik numaranız, telefonunuz, adresiniz ve çalışma
                            durumunuz.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            <strong>Çocuğunuzun Bilgileri:</strong> Adı, yaşı,
                            cinsiyeti ve varsa özel sağlık durumu (alerji,
                            kronik rahatsızlık vb.).
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            <strong>Ailenizin Durumu:</strong> Başvuruları adil
                            değerlendirebilmek için evdeki kişi sayısı, kira
                            durumu ve genel gelir aralığınız.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Bu Bilgileri Neden İstiyoruz?
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Amacımız kontenjanlarımızı en adil şekilde dağıtmaktır.
                        Bilgilerinizi şu amaçlarla kullanıyoruz:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base text-foreground/80">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Başvurunuzu incelemek ve puanlamak,</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Sonuçlar belli olduğunda size haber vermek,
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Kayıt hakkı kazanırsanız resmi işlemleri tamamlamak.
                          </span>
                        </li>
                      </ul>
                      <p className="mt-4 text-sm font-medium text-green-700 bg-green-50 p-3 rounded-lg">
                        Bilgilerinizi kesinlikle reklam amacıyla kullanmıyor
                        veya dışarıdan şirketlere satmıyoruz. Sadece yasal bir
                        zorunluluk olursa resmi devlet kurumlarıyla
                        paylaşıyoruz.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Bilgilerinizi Ne Kadar Saklıyoruz?
                      </h2>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        Bilgileriniz güvende tutulur ve sadece başvurunuzu
                        değerlendirmek için kullanılır.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Haklarınız Neler?
                      </h2>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        Kanun (KVKK) gereği kendi bilgileriniz üzerinde tam
                        kontrole sahipsiniz:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base text-foreground/80 mb-6">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Hangi bilgilerinizi tuttuğumuzu sorabilirsiniz.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Yanlış bir bilgi varsa düzeltilmesini
                            isteyebilirsiniz.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Bilgilerinizin tamamen silinmesini talep
                            edebilirsiniz.
                          </span>
                        </li>
                      </ul>

                      <div className="bg-muted/50 p-4 rounded-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4" />
                          Bize Ulaşın
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Bu haklarınızı kullanmak veya soru sormak için bize{" "}
                          <strong>444 40 55</strong> numaralı telefondan veya{" "}
                          <strong>iletisim@atakum.bel.tr</strong> adresinden
                          ulaşabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
