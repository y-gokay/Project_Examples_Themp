import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, FileQuestion } from "lucide-react";

export const metadata = {
  title: "Sayfa Bulunamadı | Atakum Belediyesi Çocuk Gelişim Merkezi",
  description: "Aradığınız sayfa bulunamadı.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-xl mx-auto">
            <Card className="border-2 border-muted bg-card shadow-xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileQuestion className="h-12 w-12 sm:h-14 sm:w-14" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                    Sayfa Bulunamadı
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                    Ana sayfadan devam edebilirsiniz.
                  </p>
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/" className="inline-flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Ana Sayfaya Dön
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
