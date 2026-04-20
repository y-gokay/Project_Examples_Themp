import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Mail, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui';

const FAQS = [
  {
    q: 'Hizmet ücretli mi?',
    a: 'Hayır. Atakum Belediyesi tarafından sağlanan PDR Danışmanlık hizmeti tamamen ücretsizdir. Vatandaşlarımız hiçbir ücret ödemeden uzman psikologlarımızdan destek alabilir.',
  },
  {
    q: 'Randevumu iptal edebilir miyim?',
    a: 'Evet. "Randevularım" sayfanızdan onay bekleyen veya onaylanmış randevularınızı en geç görüşme saatinden 2 saat öncesine kadar iptal edebilirsiniz. Mümkünse iptalinizi erken yapmanız diğer vatandaşlarımız için müsaitlik açar.',
  },
  {
    q: 'Kimler bu hizmetten yararlanabilir?',
    a: 'Atakum sınırları içinde ikamet eden tüm vatandaşlar, yaş ve sosyal statü farkı gözetmeksizin başvurabilir. Çocuklar için randevular ebeveyn/vasi onayıyla alınmaktadır.',
  },
  {
    q: 'Görüşmeler nerede gerçekleşir?',
    a: 'Görüşmeler, Atakum Belediyesi PDR Merkezi\'nin özel ve sessiz danışma odalarında yüz yüze yapılır. Talebe ve uygunluğa göre online görüşme seçeneği de planlanmaktadır.',
  },
  {
    q: 'Bir görüşme ne kadar sürer?',
    a: 'Standart bir danışmanlık seansı 45 dakika sürer. Çocuklar ve ergenler için seans süresi yaşa göre 30–45 dakika arasında değişebilir.',
  },
  {
    q: 'Hangi konularda destek alabilirim?',
    a: 'Stres ve kaygı yönetimi, depresyon, ilişki sorunları, yas süreçleri, ebeveynlik, sınav kaygısı, motivasyon, özgüven, travma sonrası destek ve daha pek çok konuda uzman psikologlarımızdan yardım alabilirsiniz.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Evet. Tüm hassas notlarınız uçtan uca şifrelenir; sadece sizin ve sizinle çalışan psikoloğun erişimi vardır. Sistem yöneticileri dahi bu içerikleri okuyamaz. KVKK ve etik kurallar çerçevesinde verileriniz titizlikle korunur.',
  },
  {
    q: 'Psikoloğumu değiştirebilir miyim?',
    a: 'Tabii. Görüştüğünüz psikolog ile uyumun terapinin başarısı için kritik olduğunu biliyoruz. Yeni bir randevu açarken farklı bir uzmanı seçmeniz yeterli; geçmiş notlarınız mahremdir ve yeni psikoloğa otomatik açılmaz.',
  },
  {
    q: 'Acil durumda ne yapmalıyım?',
    a: 'Bu platform acil müdahale hizmeti vermez. Kendinize veya bir başkasına zarar verme düşüncesi varsa lütfen 112 Acil Çağrı Merkezi\'ni veya 182 İntiharı Önleme Hattı\'nı arayın. En yakın acil servise başvurun.',
  },
  {
    q: 'Randevum onaylanmazsa ne olur?',
    a: 'Psikoloğunuz size uygun olmayan bir saat için onay vermeyebilir. Bu durumda size bir bildirim gönderilir ve yeni bir randevu için sistemden başka bir saat seçebilirsiniz.',
  },
];

const FAQItem = ({ item, open, onToggle }) => (
  <div
    className="rounded-2xl border overflow-hidden transition-all duration-300"
    style={{
      borderColor: open ? 'rgba(var(--accent), 0.30)' : 'rgba(var(--border))',
      background: 'rgb(var(--bg-elev))',
      boxShadow: open ? '0 8px 28px rgba(14,124,123,0.10)' : 'none',
    }}
  >
    <button
      onClick={onToggle}
      className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left transition-colors"
      style={{ color: 'rgb(var(--text-1))' }}
    >
      <span className="text-[15px] sm:text-base font-bold leading-snug">{item.q}</span>
      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: open ? 'rgb(var(--accent))' : 'rgba(var(--accent), 0.10)',
          color: open ? 'white' : 'rgb(var(--accent))',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <ChevronDown className="w-4 h-4" />
      </span>
    </button>
    <div
      className="overflow-hidden transition-all duration-400"
      style={{ maxHeight: open ? '480px' : '0' }}
    >
      <p
        className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line"
        style={{ color: 'rgb(var(--text-2))' }}
      >
        {item.a}
      </p>
    </div>
  </div>
);

const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div
          className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-5"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))',
            color: 'white',
            boxShadow: '0 12px 30px rgba(14,124,123,0.28)',
          }}
        >
          <HelpCircle className="w-7 h-7" />
        </div>
        <span className="section-tag justify-center">Yardım Merkezi</span>
        <h1
          className="font-display font-bold text-3xl sm:text-4xl mb-3"
          style={{ color: 'rgb(var(--text-1))' }}
        >
          Sıkça Sorulan Sorular
        </h1>
        <p
          className="max-w-xl mx-auto text-sm sm:text-[15px] leading-relaxed"
          style={{ color: 'rgb(var(--text-2))' }}
        >
          Hizmetimiz, randevu süreciniz ve gizliliğiniz hakkında merak ettiğiniz her şeyi
          burada bulabilirsiniz.
        </p>
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-3 mb-12">
        {FAQS.map((item, i) => (
          <FAQItem
            key={i}
            item={item}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>

      {/* CTA */}
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(var(--accent), 0.10)',
            color: 'rgb(var(--accent))',
          }}
        >
          <Mail className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3
            className="text-base font-bold mb-1"
            style={{ color: 'rgb(var(--text-1))' }}
          >
            Sorunuz cevaplanmadı mı?
          </h3>
          <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
            Aklınıza takılan başka bir konu varsa bize ulaşın; en kısa sürede dönüş yapalım.
          </p>
        </div>
        <Link
          to="/psikologlar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px"
          style={{
            background: 'rgb(var(--accent))',
            boxShadow: '0 6px 20px rgba(240,100,32,0.30)',
          }}
        >
          Randevu Al
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Card>
    </div>
  );
};

export default FAQPage;
