import { Link } from "react-router-dom";
import { ROUTES } from "../../constants";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useAppStore } from "../../store";
import atimLogo from "../../assets/atim_darkmode.webp";
import atimLogoDark from "../../assets/atim_darkmode.webp";
import Belediyelogo from "../../assets/belediyelogo_darkmode.webp";
import BelediyelogoDark from "../../assets/belediyelogo_darkmode.webp";
import iskurLogoBlue from "../../assets/iskurlogo2.webp";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useAppStore();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-blue-900 text-white mt-auto overflow-hidden">
      {/* Background Pattern */}
      {/*       <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-bg-scroll-slow"></div>
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Hakkımızda */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={theme === "dark" ? BelediyelogoDark : Belediyelogo}
                alt="Atakum Belediyesi Logo"
                className="h-16 object-contain"
              />
              <img
                src={theme === "dark" ? atimLogoDark : atimLogo}
                alt="ATİM Logo"
                className="h-16 object-contain"
              />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">
              Atakum Belediyesi
            </h3>
            <p className="text-base font-semibold text-white leading-relaxed mb-3">
              İstihdam Merkezi
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              İstihdam Merkezi ile kariyerinize yön verin. Belediye güvencesiyle
              ücretsiz iş bulma ve danışmanlık hizmeti.
            </p>
            {/* Social Media */}
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/atakumbeltr/?locale=tr_TR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/atakumbeltr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-400 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/atakumbeltr/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/atakumbeltr/?originalSubdomain=tr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Hızlı Linkler
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/ilanlar"
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  İş İlanları
                </Link>
              </li>
              <li>
                <Link
                  to="/hakkimizda"
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  to="/iletisim"
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:w-2 transition-all"></span>
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Bilgilendirme
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.PRIVACY}
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.TERMS}
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link
                  to="/kvkk"
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link
                  to="/iletisim#sss"
                  className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:w-2 transition-all"></span>
                  S.S.S (Sıkça Sorulan Sorular)
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              İletişim
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Phone className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Telefon</p>
                  <span className="text-sm text-gray-300">444 4 055</span>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <Mail className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">E-posta</p>
                  <a
                    href="mailto:istihdam@atakum.bel.tr"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    istihdam@atakum.bel.tr
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <MapPin className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Adres</p>
                  <span className="text-sm text-gray-300">
                    Mimarsinan, İsmet İnönü Blv. No:114, 55200 Atakum/Samsun
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 group">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="flex-shrink-0 p-3 w-40 sm:w-56 md:w-64 flex items-center justify-center transition-transform duration-300">
                <img
                  src={iskurLogoBlue}
                  alt="İŞKUR Logo"
                  className="h-16 w-full object-contain"
                />
              </div>
            </div>
            <div className="text-[10px] sm:text-[12px] text-gray-400 text-center md:text-center font-medium leading-relaxed max-w-4xl">
              <p>
                ATAKUM Belediyesi İstihdam Merkezi, Türkiye İş Kurumu tarafından
                13.10.2025 tarihinde Türkiye İş Kurumu hizmet noktası olarak
                faaliyette bulunmak üzere yetkilendirilmiştir. 4904 sayılı Kanun
                uyarınca iş arayanlardan ücret alınmayacak ve menfaat temin
                edilmeyecektir. Şikayetleriniz için aşağıdaki telefon
                numaralarına başvurabilirsiniz. Türkiye İş Kurumu Samsun İl
                Müdürlüğü: 0362 233 15 00
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between md:items-center border-t border-white/5 pt-6">
            <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left font-medium">
              © {currentYear} Atakum Belediyesi Bilgi İşlem Müdürlüğü tarafından
              yapılmıştır.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 md:gap-6">
              <a
                href="https://www.atakum.bel.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-400 hover:text-white transition-all duration-300 hover:scale-105"
              >
                atakum.bel.tr
              </a>
              <span className="hidden sm:inline text-gray-700">•</span>
              <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                Atakum İstihdam Merkezi
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
