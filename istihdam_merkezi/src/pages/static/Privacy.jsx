import React from "react";
import { Card } from "../../components/ui";
import { SEOHead } from "../../components/common";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
    {children}
  </h2>
);

const Paragraph = ({ children }) => (
  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
    {children}
  </p>
);

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <SEOHead
        title="Gizlilik Politikası"
        description="ATİM gizlilik politikası. Kişisel verilerinizin nasıl korunduğunu ve platform kullanımınıza ilişkin bilgileri öğrenin."
        path="/gizlilik-politikasi"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <header className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Gizlilik Politikası ve Çerez Kullanımı
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
            Son Güncelleme: 16 Mart 2026 • Versiyon: 1.0
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Atakum Belediyesi İstihdam Merkezi (ATİM) olarak, kişisel
            verilerinizin ve platform kullanımınıza ilişkin bilgilerin gizliliği
            ve güvenliği bizim için önemli. Bu metin, ATİM portalını kullanırken
            hangi verilerinizi nasıl topladığımızı, sakladığımızı,
            kullandığımızı ve korunmasına yönelik benimsediğimiz ilkeleri
            açıklamaktadır.
          </p>
        </header>

        <div className="space-y-8 sm:space-y-10">
          {/* Genel İlkeler */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>1. Gizlilik İlkemiz</SectionTitle>
              <Paragraph>
                ATİM, kişisel verilerinizi yalnızca hukuka ve dürüstlük
                kurallarına uygun, belirli, açık ve meşru amaçlar için, bu
                amaçlarla bağlantılı, sınırlı ve ölçülü olacak şekilde işler.
                Verilerinizin güvenliğini sağlamak üzere idari ve teknik
                tedbirler alır, verilerinizi üçüncü kişilerle yalnızca ilgili
                mevzuata uygun ve gerekli olduğu ölçüde paylaşır.
              </Paragraph>
              <Paragraph>
                Gizlilik politikamız; ATİM portalı, mobil erişim, fiziki hizmet
                noktalarımız ve bu kanallarla bağlantılı tüm dijital altyapı
                üzerinde toplanan kişisel verileri kapsar.
              </Paragraph>
            </div>
          </Card>

          {/* Toplanan Veriler ve Kullanım Amaçları */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                2. Toplanan Veriler ve Kullanım Amaçları
              </SectionTitle>
              <Paragraph>
                ATİM portalından yararlanırken; üyelik, profil oluşturma, iş
                başvurusu, ilan yayınlama ve benzeri işlemler kapsamında
                paylaştığınız kişisel verileriniz, KVKK’ya uygun olarak
                işlenmektedir. Ayrıca, portalı kullanım şeklinize ilişkin bazı
                teknik veriler de sistemlerimiz tarafından otomatik olarak
                kaydedilebilir. Bu kapsamda, tarafınızca sağlanan e-posta adresi
                ve telefon numarası; hesabınızın oluşturulması ve yönetilmesi,
                hesap doğrulama ve güvenlik doğrulama işlemleri, güvenlik amaçlı
                bildirimler, başvurularınızla ilgili zorunlu bilgilendirmeler ve
                sizinle iletişim kurulması amacıyla kullanılmaktadır. Pazarlama
                amaçlı iletişimler için ayrıca açık rızanız alınmadıkça bu
                kanallar bu amaçla kullanılmaz.
              </Paragraph>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                <li>
                  Üyelik ve profil bilgileri (ad, soyad, iletişim bilgileri,
                  profil fotoğrafı vb.)
                </li>
                <li>
                  Özgeçmiş içeriği (eğitim, deneyim, beceriler, sertifikalar,
                  referanslar vb.)
                </li>
                <li>
                  Portal kullanımına ilişkin teknik veriler (IP adresi, tarayıcı
                  türü, oturum süresi, görüntülenen sayfalar vb.)
                </li>
                <li>İşveren hesabı için şirket ve yetkili kişi bilgileri</li>
              </ul>
              <Paragraph>
                Bu veriler; istihdam hizmeti sunmak, başvurularınızı ilgili
                işverenlere yönlendirmek, size uygun ilan ve adayları
                listelemek, sistem güvenliğini sağlamak, hizmet kalitemizi
                ölçmek ve mevzuattan doğan yükümlülüklerimizi yerine getirmek
                için kullanılmaktadır.
              </Paragraph>
            </div>
          </Card>

          {/* Çerezler (Cookies) ve Benzeri Teknolojiler */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                3. Çerezler (Cookies) ve Benzeri Teknolojiler
              </SectionTitle>
              <Paragraph>
                ATİM portalını ziyaret ettiğinizde, cihazınıza çerezler
                yerleştirilebilir. Çerezler; portalın düzgün çalışmasını
                sağlamak, oturumunuzu hatırlamak, tercihlerinizi kaydetmek ve
                site trafiğini analiz ederek hizmetlerimizi geliştirmek için
                kullanılan küçük metin dosyalarıdır.
              </Paragraph>
              <Paragraph>
                Kullanılan çerez türleri arasında; zorunlu çerezler (oturum
                yönetimi ve güvenlik için), işlevsel çerezler (tercihleri
                hatırlama), performans ve analiz çerezleri (trafik ve kullanım
                istatistikleri) yer alabilir. Tarayıcı ayarlarınızdan çerezleri
                kısıtlama veya silme imkânınız bulunmaktadır; ancak bu durumda
                portalın bazı işlevleri kısmen veya tamamen çalışmayabilir.
              </Paragraph>
            </div>
          </Card>

          {/* Üçüncü Taraflarla Paylaşım ve Aktarımlar */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>4. Üçüncü Taraflarla Paylaşım</SectionTitle>
              <Paragraph>
                Kişisel verileriniz; yasal yükümlülüklerimizi yerine getirmek,
                istihdam hizmetini sunmak ve sistem altyapısını sürdürebilmek
                için, KVKK’da öngörülen şartlar dâhilinde sınırlı sayıda üçüncü
                tarafla paylaşılabilir.
              </Paragraph>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                <li>
                  Başvuru yaptığınız ilanların işverenleri ve bu işverenlerin
                  yetkilendirdiği kişiler
                </li>
                <li>
                  Atakum Belediyesi’nin ilgili birimleri ve bağlı kurumları
                </li>
                <li>
                  Bilişim altyapısı, barındırma (hosting), bakım ve destek
                  hizmeti aldığımız tedarikçiler
                </li>
                <li>
                  Mevzuat gereği bilgi talep etme yetkisine sahip yargı
                  mercileri ve resmî kurumlar
                </li>
              </ul>
              <Paragraph>
                Her durumda, veri paylaşımı yapılırken sadece amacın
                gerektirdiği asgari veriler aktarılır ve gerekli güvenlik
                önlemlerinin alınmasına azami özen gösterilir.
              </Paragraph>
            </div>
          </Card>

          {/* Veri Güvenliği, Saklama Süreleri ve Haklarınız */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                5. Veri Güvenliği, Saklama Süreleri ve Haklarınız
              </SectionTitle>
              <Paragraph>
                ATİM, kişisel verilerinizi; yetkisiz erişim, kayıp, kötü amaçlı
                kullanım veya ifşaya karşı korumak amacıyla gerekli idari ve
                teknik tedbirleri almaktadır. Verileriniz, ilgili mevzuatta
                öngörülen veya işleme amaçları için gerekli olan süre boyunca
                saklanır; bu süreler dolduğunda anonimleştirilir, silinir veya
                yok edilir.
              </Paragraph>
              <Paragraph>
                KVKK’nın 11. maddesi uyarınca, kişisel verilerinizin işlenip
                işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
                düzeltilmesini veya silinmesini isteme, aktarıldığı üçüncü
                kişileri bilme ve kanuna aykırı işleme nedeniyle zarara
                uğramanız hâlinde zararın giderilmesini talep etme gibi haklara
                sahipsiniz. Haklarınızı kullanmak için ATİM’e yazılı veya
                elektronik yollardan başvurabilirsiniz.
              </Paragraph>
            </div>
          </Card>

          {/* Politika Değişiklikleri */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>6. Politika Değişiklikleri</SectionTitle>
              <Paragraph>
                Bu gizlilik politikası, yasal düzenlemelerdeki ve ATİM
                uygulamalarındaki değişikliklere bağlı olarak zaman zaman
                güncellenebilir. Güncellenmiş sürüm, portal üzerinde
                yayımlandığı andan itibaren geçerlilik kazanır. Portalı
                kullanmaya devam etmeniz, güncellenmiş politikayı kabul
                ettiğiniz anlamına gelir; bu nedenle metni belirli aralıklarla
                gözden geçirmeniz önerilir.
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
