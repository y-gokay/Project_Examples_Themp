import React from "react";
import { Card } from "../../components/ui";
import { SEOHead } from "../../components/common";

const Paragraph = ({ children }) => (
  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
    {children}
  </p>
);

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <SEOHead
        title="Kullanım Koşulları"
        description="ATİM portal kullanım koşulları. İş arayan ve işveren kullanıcıların hak ve yükümlülükleri."
        path="/kullanim-sartlari"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <header className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Üyelik ve Portal Kullanım Koşulları
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
            Son Güncelleme: 16 Mart 2026 • Versiyon: 1.0
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Bu metin, Atakum Belediyesi İstihdam Merkezi (ATİM) portalının iş
            arayan ve işveren kullanıcılar tarafından hangi hak ve yükümlülükler
            çerçevesinde kullanılacağını düzenler. Portalı kullanmaya devam
            etmeniz, aşağıdaki koşulları okuduğunuz ve kabul ettiğiniz anlamına
            gelir.
          </p>
        </header>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-4 sm:p-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              I. Taraflar ve Tanımlar
            </h2>
            <Paragraph>
              Bu kullanım koşulları; bir tarafta Atakum Belediyesi İstihdam
              Merkezi (“ATİM”), diğer tarafta ise ATİM portalına üye olan
              ve/veya portalı ziyaret eden gerçek kişi kullanıcılar (iş
              arayanlar, işverenler ve işveren temsilcileri) arasında
              akdedilmiştir. Metin içinde “kullanıcı” ifadesi, portalı ziyaret
              eden veya üye olan tüm gerçek kişileri kapsar.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              II. Portal Hizmetlerinin Kapsamı
            </h2>
            <Paragraph>
              ATİM; iş arayan vatandaşlar ile çalışan arayan işverenleri bir
              araya getirmek, istihdamı desteklemek ve danışmanlık sağlamak
              amacıyla dijital bir platform ve fizikî hizmet noktaları sunar.
              Portal üzerinden özgeçmiş oluşturabilir, iş ilanlarına
              başvurabilir, işveren olarak ilan yayınlayabilir, başvuruları
              değerlendirebilir ve ATİM tarafından sunulan faaliyetler hakkında
              bilgilendirmeler alabilirsiniz.
            </Paragraph>
            <Paragraph>
              ATİM; ilan içeriklerinin, işverenlerin veya adayların beyan ettiği
              bilgilerin doğruluğunu garanti etmez, işe alım süreçlerinde taraf
              olmaz ve bu süreçlere ilişkin herhangi bir taahhütte bulunmaz.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              III. Üyelik, Hesap ve Güvenlik
            </h2>
            <Paragraph>
              Portalın belirli bölümlerinden yararlanmak için üyelik hesabı
              oluşturmanız gerekebilir. Üyelik hesabınız şahsınıza özeldir,
              üçüncü kişilere devredilemez veya kullandırılamaz. Kayıt sırasında
              ve üyelik süresince verdiğiniz bilgilerin doğru, güncel ve
              eksiksiz olmasından siz sorumlusunuz.
            </Paragraph>
            <Paragraph>
              Kullanıcı adı ve şifrenizin gizliliğini korumakla yükümlüsünüz.
              Hesabınız üzerinden gerçekleştirilen tüm işlemlerden, elinizde
              olmayan teknik sebepler hariç, öncelikle siz sorumlu kabul
              edilirsiniz. Şifrenizin yetkisiz kişilerce ele geçirildiğini
              düşünmeniz hâlinde, derhal şifrenizi değiştirmeli ve mümkünse ATİM
              ile iletişime geçmelisiniz.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              IV. Kullanıcı Yükümlülükleri
            </h2>
            <Paragraph>
              Portalı kullanırken yürürlükteki mevzuata, kamu düzenine, genel
              ahlâka ve üçüncü kişilerin haklarına uygun davranmayı taahhüt
              edersiniz. Özellikle;
            </Paragraph>
            <Paragraph>
              - Yanıltıcı, yanlış, eksik veya gerçeğe aykırı bilgi
              paylaşmayacağınızı,
              <br />
              - Üçüncü kişilerin kişisel verilerini hukuka aykırı şekilde
              paylaşmayacağınızı,
              <br />
              - Hakaret, iftira, tehdit, ayrımcılık içeren veya suça teşvik eden
              içerik yayınlamayacağınızı,
              <br />- Portalı zararlı yazılımlar yaymak, sistemlere yetkisiz
              erişim sağlamaya çalışmak gibi kötü niyetli amaçlarla
              kullanmayacağınızı kabul ve taahhüt edersiniz.
            </Paragraph>
            <Paragraph>
              İşveren kullanıcılar, adaylardan elde ettikleri kişisel verileri
              yalnızca ilgili ilan ve pozisyonla sınırlı olarak ve KVKK’ya uygun
              şekilde işleyeceklerini; bu verileri ilgisiz kişilerle ve
              amaçlarla paylaşmayacaklarını taahhüt ederler.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              V. Başvuru, İlan ve İçerik Sorumluluğu
            </h2>
            <Paragraph>
              İş arayan olarak bir ilana başvurduğunuzda, özgeçmiş ve başvuru
              bilgileriniz ilgili işverene aktarılır ve bu aşamadan sonra
              verilerinizin işlenmesi bakımından işveren veri sorumlusu sıfatını
              kazanır. İşe alım sürecine ilişkin tüm karar ve sorumluluk
              işverene aittir.
            </Paragraph>
            <Paragraph>
              İşverenler; ilan içeriklerinin doğruluğundan, mevzuata
              uygunluğundan ve adaylara karşı eşitlik ile ayrımcılık yasağına
              uymaktan sorumludur. ATİM, ilan içerikleri, işveren uygulamaları
              veya işe alım süreçleri nedeniyle doğabilecek ihtilaflardan
              sorumlu tutulamaz.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              VI. Fikri Mülkiyet Hakları
            </h2>
            <Paragraph>
              Portalda yer alan tüm marka, logo, tasarım, yazılım, metin, görsel
              ve içerikler, aksi belirtilmedikçe Atakum Belediyesi’ne veya
              ilgili hak sahiplerine aittir. Bu içerikler; ATİM’in önceden
              yazılı izni olmaksızın kopyalanamaz, çoğaltılamaz, değiştirilerek
              yeniden yayımlanamaz veya ticari amaçlarla kullanılamaz.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              VII. Gizlilik, KVKK ve Çerezler
            </h2>
            <Paragraph>
              Kişisel verilerinizin işlenmesine, saklanmasına ve korunmasına
              ilişkin detaylı açıklamalar “KVKK Aydınlatma Metni” ve “Gizlilik
              Politikası” sayfalarında yer almaktadır. Portalı kullanmakla, bu
              metinleri okuduğunuzu ve anladığınızı beyan etmiş sayılırsınız.
              Çerez kullanımına ilişkin bilgiler de Gizlilik Politikası
              kapsamında kamuoyuna duyurulmaktadır.
            </Paragraph>
            <Paragraph>
              Hesabınızla ilgili önemli bilgilendirmeler, güvenlik uyarıları,
              doğrulama işlemleri ve başvuru süreçlerine ilişkin zorunlu
              bildirimler için tarafınızca bildirilen e-posta adresi ve telefon
              numarası üzerinden sizinle iletişime geçilebilir. Tanıtım ve
              pazarlama amaçlı iletiler ise ilgili mevzuat kapsamında gerekli
              olması hâlinde ayrıca onayınıza tabi olarak gönderilir.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              VIII. Sözleşmenin Sona Ermesi ve Hesabın Kapatılması
            </h2>
            <Paragraph>
              Kullanıcı, dilediği zaman üyelik hesabını sonlandırabilir ve
              portalı kullanmayı bırakabilir. ATİM, mevzuata aykırı kullanım,
              kötü niyet, sahte hesap oluşturma veya sistem güvenliğini
              tehlikeye sokan hallerde kullanıcı hesabını askıya alma veya
              sonlandırma hakkını saklı tutar.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              IX. Sorumluluğun Sınırlandırılması
            </h2>
            <Paragraph>
              ATİM; makul güvenlik tedbirlerini almakla birlikte, internet
              altyapısından, sistem kesintilerinden veya üçüncü taraf hizmet
              sağlayıcılarından kaynaklanan kesinti ve hatalardan sorumlu
              tutulamaz. Kullanıcılar, portalı kendi teknik imkânları ve
              riskleri dâhilinde kullanır.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              X. Uygulanacak Hukuk ve Yetkili Mercii
            </h2>
            <Paragraph>
              İşbu kullanım koşulları, Türkiye Cumhuriyeti hukukuna tabidir.
              Portal kullanımından doğabilecek uyuşmazlıklarda, öncelikle
              taraflar iyi niyet çerçevesinde uzlaşma yoluna gitmeyi kabul
              ederler; çözülemeyen uyuşmazlıklarda ise yetkili yargı mercileri
              Türkiye Cumhuriyeti mahkemeleri ve icra daireleridir.
            </Paragraph>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
              XI. Değişiklikler ve Yürürlük
            </h2>
            <Paragraph>
              ATİM, yasal düzenlemelerdeki ve hizmet ihtiyaçlarındaki
              değişikliklere bağlı olarak, işbu kullanım koşullarını tek taraflı
              olarak güncelleyebilir. Güncellenen metin, portalda yayımlandığı
              andan itibaren yürürlüğe girer. Portalı kullanmaya devam etmeniz,
              güncellenen koşulları kabul ettiğiniz anlamına gelir.
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
