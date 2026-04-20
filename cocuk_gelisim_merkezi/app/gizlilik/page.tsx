import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  ArrowLeft,
  Cookie,
  Shield,
  EyeOff,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Atakum Belediyesi Çocuk Gelişim Merkezi Gizlilik Politikası. Çerez kullanımı, veri güvenliği ve üçüncü taraf hizmetler hakkında bilgilendirme.",
  alternates: {
    canonical: "/gizlilik",
  },
};

export default function GizlilikPage() {
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
                Gizlilik Politikası
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                atacocuk.atakum.bel.tr sitemizi kullanırken gizliliğinize saygı
                duyuyoruz. Sizi takip etmiyor, reklam göstermiyor ve kişisel
                bilgilerinizi korumak için en üst düzey güvenlik önlemlerini
                alıyoruz.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shrink-0">
                      <Cookie className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Sizi Nasıl Takip Ediyoruz? (Çerezler)
                      </h2>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        Sitemizde sizi rahatsız edecek reklam veya takip
                        çerezleri (cookie) yoktur.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                      <EyeOff className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Ziyaret İstatistikleri
                      </h2>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        Sitemizin kaç kişi tarafından ziyaret edildiğini anlamak
                        için anonim sayımlar yapıyoruz. Bu sayımlar sırasında{" "}
                        <strong>kim olduğunuzu asla bilmiyoruz.</strong>
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base text-foreground/80">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Hangi sayfaların daha çok okunduğunu,</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Ziyaretçilerin telefondan mı yoksa bilgisayardan mı
                            girdiğini,
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            Hangi şehirden bağlandıklarını (genel olarak)
                            görüyoruz.
                          </span>
                        </li>
                      </ul>
                      <p className="mt-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        Bu işlemi yaparken çerez kullanmıyoruz ve bilgileri
                        reklam şirketlerine satmıyoruz.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl shrink-0">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Güvenliğiniz İçin Neler Yapıyoruz?
                      </h2>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        Başvuru formuna girdiğiniz bilgilerin başkalarının eline
                        geçmemesi için sitemiz şifrelidir (HTTPS). Ayrıca
                        sistemimiz teknik olarak şu kurallara uyar:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base text-foreground/80 mb-6">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            <strong>Kamera ve Mikrofon:</strong> Sitemiz
                            kameranıza, mikrofonunuza veya konumunuza asla
                            erişmez. Sistemimiz bunu teknik olarak engeller.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>
                            <strong>Gizli Bağlantılar:</strong> Başka bir siteye
                            tıkladığınızda, tam olarak hangi sayfadan
                            geldiğinizi gizleriz.
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
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                      <ExternalLink className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">
                        Dış Bağlantılar (Haritalar)
                      </h2>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        Çocuk gelişim merkezlerimizin yerini göstermek için
                        sitemizde <strong>Google Haritalar</strong>{" "}
                        kullanıyoruz. Bu haritalar Google tarafından sağlanır
                        ancak sizin kişisel bilgilerinizi toplamaz.
                      </p>

                      <div className="bg-muted/50 p-4 rounded-xl mt-6">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4" />
                          Daha Fazla Bilgi
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Kişisel verilerinizin nasıl işlendiğiyle ilgili tüm
                          yasal detayları öğrenmek için{" "}
                          <Link
                            href="/kvkk"
                            className="text-primary hover:underline font-bold"
                          >
                            KVKK Aydınlatma Metni
                          </Link>{" "}
                          sayfamızı okuyabilirsiniz.
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
