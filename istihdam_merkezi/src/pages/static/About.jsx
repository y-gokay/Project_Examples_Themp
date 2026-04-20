import { Link } from "react-router-dom";
import {
  Users,
  Target,
  Eye,
  Heart,
  Award,
  TrendingUp,
  Star,
  CheckCircle2,
  ArrowRight,
  Building2,
  Briefcase,
} from "lucide-react";
import { Button, Card } from "../../components/ui";
import { SEOHead } from "../../components/common";
import heroBackgroundImage from "../../assets/atakumun-essiz-sahili.webp";
import heroBackgroundImageNight from "../../assets/atakumun-essiz-sahili-gece.webp";
import { useAppStore } from "../../store";

const About = () => {
  /*   const stats = [
    {
      label: "Aktif İlan",
      value: "500+",
      icon: Briefcase,
      color: "from-blue-600 to-indigo-600",
    },
    {
      label: "İş Arayan",
      value: "1000+",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
    },
    {
      label: "İşveren",
      value: "150+",
      icon: Building2,
      color: "from-violet-600 to-purple-600",
    },
    {
      label: "Başarı Oranı",
      value: "85%",
      icon: TrendingUp,
      color: "from-amber-600 to-orange-600",
    },
  ]; */

  const values = [
    {
      icon: Target,
      title: "Güvenilirlik",
      description:
        "Belediye güvencesiyle şeffaf ve güvenilir istihdam hizmeti sunuyoruz.",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      icon: Users,
      title: "İnsan Odaklılık",
      description:
        "Her bireyin potansiyelini ortaya çıkarmak için kişiye özel çözümler üretiyoruz.",
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      icon: Award,
      title: "Kalite",
      description:
        "Profesyonel danışmanlık ile iş bulma ve işverenlere yüksek kaliteli hizmet standartları.",
      gradient: "from-violet-600 to-purple-600",
    },
    {
      icon: Heart,
      title: "Toplumsal Fayda",
      description:
        "İstihdamı artırarak Atakum'da yaşam kalitesinin yükselmesine katkı sağlıyoruz.",
      gradient: "from-orange-600 to-red-600",
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "Atakum Belediyesi İstihdam Merkezi Açıldı",
      description:
        "Atakum Belediyesi İstihdam Merkezi kuruldu ve vatandaşlarımıza hizmet vermeye başladı.",
    },
    {
      year: "2021",
      title: "İlk 1000 Başvuru",
      description: "İlk 1000 başvuru alındı",
    },
    {
      year: "2022",
      title: "150+ İşveren Ortaklığı",
      description: "Güçlü işveren ağı oluşturuldu",
    },
    {
      year: "2025",
      title: "Atakum Belediyesi İstihdam Merkezi Website Açıldı",
      description:
        "Atakum Belediyesi İstihdam Merkezi website açıldı ve kullanıcılarımıza hizmet vermeye başladı.",
    },
  ];

  const { isAuthenticated, theme } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <SEOHead
        title="Hakkımızda"
        description="Atakum Belediyesi İstihdam Merkezi hakkında bilgi edinin. Misyonumuz, vizyonumuz ve değerlerimiz ile Atakum'da istihdama katkı sağlıyoruz."
        path="/hakkimizda"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white">
        <img
          src={
            theme === "dark" ? heroBackgroundImageNight : heroBackgroundImage
          }
          alt="Atakum sahili"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/70 to-blue-900/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6 animate-fade-in">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-xs sm:text-sm font-semibold">
                Atakum Belediyesi
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-slide-up">
              Hakkımızda
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 animate-slide-up px-2 sm:px-0">
              İstihdamı artırmak, kariyer hedeflerini gerçekleştirmek ve
              Atakum'un ekonomik gelişimine katkı sağlamak için çalışıyoruz
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/*       <section className="relative py-8 sm:py-12 -mt-10 sm:-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100/50 dark:border-gray-700/50"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                ></div>
                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-md`}
                  >
                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Mission & Vision */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/*           <div className="mb-10 sm:mb-16 text-center max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "Atakum Belediyesi İstihdam Merkezi ile iş arayan vatandaşlarımızı
              yetenekleri, eğitimleri ve ilgilerine göre iş sahibi yapıyoruz.
              Ekonomik şartların gittikçe ağırlaştığı dönemde önemli bir
              ihtiyaca cevap veren merkezimiz, iş arayanla işvereni bir araya
              getirerek istihdama önemli katkı sağlıyor. Daha fazla
              vatandaşımızı iş sahibi yapmak ve daha çok ailenin yaşamına destek
              olmak için çalışmalarımıza hız kazandırdık. Atakum Belediyesi
              olarak çalışmaya, üretmeye ve halkımızın yanında olmaya devam
              edeceğiz."
            </p>
          </div> */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            {/* Mission */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative h-40 sm:h-64 bg-gradient-to-br from-blue-600 to-indigo-700 p-4 sm:p-8 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse-slow"></div>
                </div>
                <div className="relative text-center text-white">
                  <Target className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4" />
                  <h2 className="text-xl sm:text-3xl font-bold">Misyonumuz</h2>
                </div>
              </div>
              <div className="p-4 sm:p-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-lg">
                  Atakum'da yaşayan herkese eşit istihdam fırsatları sunmak,
                  işverenleri nitelikli adaylarla buluşturmak ve sürdürülebilir
                  bir istihdam ekosistemi oluşturmaktır.
                </p>
              </div>
            </Card>

            {/* Vision */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative h-40 sm:h-64 bg-gradient-to-br from-purple-600 to-purple-700 p-4 sm:p-8 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse-slow"></div>
                </div>
                <div className="relative text-center text-white">
                  <Eye className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4" />
                  <h2 className="text-xl sm:text-3xl font-bold">Vizyonumuz</h2>
                </div>
              </div>
              <div className="p-4 sm:p-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-lg">
                  Türkiye'nin en etkili ve yenilikçi yerel istihdam platformu
                  olmak, tüm paydaşlar için değer yaratan, örnek model bir
                  hizmet sunmaktır.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-10 sm:py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4">
              Değerlerimiz
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0">
              İstihdam hizmetlerimizin temelini oluşturan değerler
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div
                  className={`h-1.5 sm:h-2 bg-gradient-to-r ${value.gradient}`}
                ></div>
                <div className="p-3 sm:p-6">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${value.gradient} rounded-lg sm:rounded-xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform shadow-md`}
                  >
                    <value.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4">
              Yolculuğumuz
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
              Önemli kilometre taşlarımız
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

            <div className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-4 relative">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative">
                  <div className="hidden lg:flex absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-800 border-4 border-blue-600 dark:border-blue-500 rounded-full shadow-lg z-10"></div>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    <div className="p-3 sm:p-6 text-center">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="relative py-10 sm:py-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
          {/*Enhanced Animated Pattern*/}
          {/*           <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINHY0SDB2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-bg-scroll-medium"></div>
          </div> */}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 sm:left-20 w-40 sm:w-64 h-40 sm:h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 sm:right-20 w-48 sm:w-80 h-48 sm:h-80 bg-purple-400/20 rounded-full blur-3xl animate-bounce-slow"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Kariyer Yolculuğunuza Bugün Başlayın
            </h2>
            <p className="text-sm sm:text-lg text-blue-100 mb-6 sm:mb-8 px-2 sm:px-0">
              Binlerce iş fırsatı ve ücretsiz danışmanlık hizmeti sizi bekliyor
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/kayit">
                <Button
                  size="lg"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Hemen Kayıt Ol
                </Button>
              </Link>
              <Link to="/ilanlar">
                <Button
                  size="lg"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10"
                >
                  İş İlanlarını Gör
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
