import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

const KVKKPage = () => (
  <div className="relative z-[1] max-w-3xl mx-auto px-5 sm:px-8 py-12 pb-20">
    <Link
      to="/kayit"
      className="text-sm font-bold mb-6 inline-block hover:underline"
      style={{ color: 'rgb(var(--accent))' }}
    >
      ← Kayıt sayfasına dön
    </Link>
    <h1 className="font-display font-semibold text-3xl mb-2" style={{ color: 'rgb(var(--text-1))' }}>
      Kişisel Verilerin Korunması — Aydınlatma Metni
    </h1>
    <p className="text-sm font-light mb-8" style={{ color: 'rgb(var(--text-2))' }}>
      Son güncelleme: Bu metin bilgilendirme amaçlıdır; kesin hukuki metin için kurumunuzun veri koruma
      sorumlusu ile uyum sağlanmalıdır.
    </p>

    <Card className="p-6 sm:p-8 space-y-6 text-sm font-light leading-relaxed" style={{ color: 'rgb(var(--text-2))' }}>
      <section>
        <h2 className="font-bold text-base mb-2" style={{ color: 'rgb(var(--text-1))' }}>
          1. Veri sorumlusu
        </h2>
        <p>
          Bu dijital hizmet kapsamında kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu
          (&quot;KVKK&quot;) uyarınca veri sorumlusu sıfatıyla Atakum Belediyesi tarafından işlenebilir.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-base mb-2" style={{ color: 'rgb(var(--text-1))' }}>
          2. İşlenen veriler ve amaçlar
        </h2>
        <p>
          Kimlik ve iletişim bilgileriniz (ad-soyad, e-posta, telefon), randevu bilgileriniz ve tarayıcıda
          şifrelenen klinik notlar (yalnızca yetkili psikolog erişimi) hizmetin sunulması, randevu
          yönetimi, yasal yükümlülükler ve güvenlik amaçlarıyla işlenebilir.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-base mb-2" style={{ color: 'rgb(var(--text-1))' }}>
          3. Aktarım
        </h2>
        <p>
          Verileriniz, kanunda öngörülen haller dışında üçüncü kişilere satılmaz veya ticari amaçla
          paylaşılmaz. Hizmet altyapısı (barındırma, e-posta) için sınırlı teknik erişim gerekebilir.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-base mb-2" style={{ color: 'rgb(var(--text-1))' }}>
          4. Haklarınız
        </h2>
        <p>
          KVKK&apos;nın 11. maddesi kapsamında verilerinize erişim, düzeltme, silme, itiraz ve şikâyet
          hakkına sahipsiniz. Başvurularınızı kurumun resmi kanalları üzerinden iletebilirsiniz.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-base mb-2" style={{ color: 'rgb(var(--text-1))' }}>
          5. Açık rıza
        </h2>
        <p>
          Kayıt sırasında onay kutusunu işaretlemeniz; bu aydınlatma metnini okuduğunuzu ve kişisel
          verilerinizin belirtilen amaçlarla işlenmesine onay verdiğinizi gösterir. Onayı dilediğiniz
          zaman geri çekme hakkınız saklıdır; bu durumda hizmetin bir kısmı sunulamayabilir.
        </p>
      </section>
    </Card>
  </div>
);

export default KVKKPage;
