import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { Home, ArrowLeft, Star } from "lucide-react";
import { ROUTES } from "../constants";
import { SEOHead } from "../components/common";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="404 - Sayfa Bulunamadı"
        description="Üzgünüz, aradığınız sayfa bulunamadı. Lütfen URL'yi kontrol edin veya ana sayfaya dönün."
        noindex
      />

      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-20 blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="text-center max-w-2xl animate-fade-in">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent leading-none animate-scale-in">
            404
          </h1>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full mb-6">
          <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Sayfa Bulunamadı
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Üzgünüz, Bu Sayfa Mevcut Değil
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          Lütfen URL'yi kontrol edin veya ana sayfaya dönün.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={ROUTES.HOME}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              leftIcon={<Home className="w-5 h-5" />}
            >
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Button
            onClick={() => window.history.back()}
            size="lg"
            variant="outline"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Geri Dön
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Popüler sayfalar:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to={ROUTES.JOBS}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              İş İlanları
            </Link>
            <Link
              to={ROUTES.ABOUT}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Hakkımızda
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              İletişim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
