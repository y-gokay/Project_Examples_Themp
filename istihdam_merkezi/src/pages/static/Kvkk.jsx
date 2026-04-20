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

const Kvkk = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <SEOHead
        title="KVKK Aydınlatma Metni"
        description="ATİM - Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni. Verilerinizin nasıl işlendiğini öğrenin."
        path="/kvkk"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <header className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Kişisel Verilerin Korunması ve İşlenmesine İlişkin Aydınlatma Metni
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
            Son Güncelleme: 16 Mart 2026 • Versiyon: 1.0
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Atakum Belediyesi İstihdam Merkezi (ATİM) olarak, 6698 sayılı
            Kişisel Verilerin Korunması Kanunu (“KVKK”) başta olmak üzere ilgili
            tüm mevzuata uygun şekilde kişisel verilerinizi işliyor, saklıyor ve
            koruyoruz. Bu aydınlatma metni, ATİM portalını kullanan iş arayan,
            işveren / işveren temsilcisi ve diğer gerçek kişilere ait kişisel
            verilerin hangi amaçlarla, hangi hukuki sebeplere dayanılarak, hangi
            yöntemlerle işlendiğini ve KVKK kapsamındaki haklarınızı
            açıklamaktadır.
          </p>
        </header>

        <div className="space-y-8 sm:space-y-10">
          {/* Veri Sorumlusu ve İletişim Bilgileri */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                1. Veri Sorumlusu ve İletişim Bilgileri
              </SectionTitle>
              <Paragraph>
                6698 sayılı KVKK uyarınca, kişisel verilerinizin veri sorumlusu
                Atakum Belediyesi’dir. Atakum Belediyesi İstihdam Merkezi
                (ATİM), belediye bünyesinde faaliyet gösteren bir istihdam
                destek birimi olup, kişisel verileriniz belediye adına ATİM
                tarafından işlenmektedir.
              </Paragraph>
              <Paragraph>
                ATİM’e ve Atakum Belediyesi’ne ilişkin güncel iletişim
                bilgileri, fiziki hizmet noktalarımızda, Atakum Belediyesi resmi
                internet sitesinde ve ATİM portalı üzerinde yer almaktadır. KVKK
                kapsamındaki haklarınıza (özellikle hesap ve kişisel
                verilerinizin silinmesi talepleriniz dâhil) ilişkin
                başvurularınızı yazılı olarak veya elektronik iletişim
                kanallarımız üzerinden veri sorumlusuna iletebilirsiniz.
              </Paragraph>
            </div>
          </Card>

          {/* İşlenen Kişisel Veri Kategorileri */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>2. İşlenen Kişisel Veri Kategorileri</SectionTitle>
              <Paragraph>
                ATİM portalı ve fiziki başvuru kanalları üzerinden, durumunuza
                göre aşağıdaki kişisel veri kategorileriniz işlenebilmektedir:
              </Paragraph>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                <li>
                  Kimlik bilgileri (ad, soyad, T.C. kimlik numarası, doğum
                  tarihi vb.)
                </li>
                <li>
                  İletişim bilgileri (telefon numarası, e-posta adresi, ikamet
                  adresi vb.)
                </li>
                <li>
                  Eğitim ve mesleki deneyim bilgileri (öğrenim durumu, mezun
                  olunan okul, sertifika ve kurs bilgileriniz, önceki iş
                  deneyimleriniz, referans bilgileriniz vb.)
                </li>
                <li>
                  Çalışma tercihi ve ilgi alanı bilgileri (çalışmak istediğiniz
                  sektör ve pozisyonlar, çalışma şekli, lokasyon tercihleri vb.)
                </li>
                <li>
                  Portal kullanım ve işlem güvenliği verileri (giriş–çıkış
                  kayıtları, log kayıtları, IP bilgisi, cihaz ve tarayıcı
                  bilgileri vb.)
                </li>
                <li>
                  İşveren / işveren temsilcisi için unvan, görev, şirket
                  bilgileri ve yetki durumunuza ilişkin veriler
                </li>
                <li>
                  Gerekli olması hâlinde ve yalnızca açık rızanızla; iş
                  başvurunuzla bağlantılı özel nitelikli kişisel veriler
                  (engellilik durumunuz, sağlık raporu bilgileri, adli sicil
                  kaydı gibi)
                </li>
              </ul>
            </div>
          </Card>

          {/* Kişisel Verilerin İşlenme Amaçları */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>3. Kişisel Verilerin İşlenme Amaçları</SectionTitle>
              <Paragraph>
                Kişisel verileriniz, KVKK’nın 4. maddesinde belirtilen genel
                ilkelere uygun olarak ve aşağıdaki amaçlarla işlenmektedir:
              </Paragraph>
              <Paragraph>
                - İstihdamı desteklemek, iş arayanlarla işverenleri bir araya
                getirmek, iş ve staj ilanlarının yayınlanmasını ve aday–ilan
                eşleştirmesini sağlamak
                <br />
                - Portal üzerinden üyelik oluşturulması, profil ve özgeçmiş
                bilgilerinizin yönetilmesi, başvurularınızın alınması ve ilgili
                işverenlere iletilmesi
                <br />
                - ATİM tarafından yürütülen istihdam projeleri, etkinlikleri ve
                eğitim programlarına ilişkin bilgilendirme yapılması
                <br />
                - Belediyenin ve ATİM’in mevzuattan doğan yükümlülüklerini
                yerine getirmesi, resmî kurumlara yapılması gereken bildirim ve
                raporlamaların yapılması
                <br />
                - Sistem ve işlem güvenliğinin sağlanması, suistimal ve kötü
                kullanımın tespiti ve önlenmesi
                <br />- Hizmet kalitesinin ölçülmesi, iyileştirilmesi ve
                istatistiki raporlamaların yapılması (bu kapsamda mümkün
                olduğunda verileriniz anonim hâle getirilmektedir)
                <br />
                - Üyelik hesabınızın oluşturulması ve yönetilmesi
                <br />- E-posta adresiniz ve telefon numaranızın; kimlik
                doğrulama, hesap güvenliğinin sağlanması, zorunlu
                bilgilendirmelerin iletilmesi ve başvurularınıza ilişkin
                iletişim süreçlerinin yürütülmesi amaçlarıyla kullanılması
              </Paragraph>
            </div>
          </Card>

          {/* Kişisel Verilerin İşlenme Yöntemi ve Hukuki Sebepler */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebepler
              </SectionTitle>
              <Paragraph>
                Kişisel verileriniz; ATİM portalındaki üyelik ve başvuru
                formları, fiziki başvuru formları, çağrı merkezi ve elektronik
                iletişim kanalları, eğitim ve etkinlik katılım listeleri, resmî
                yazışmalar ve benzeri yöntemlerle, tamamen veya kısmen otomatik
                yollarla ya da veri kayıt sisteminin parçası olmak kaydıyla
                otomatik olmayan yollarla toplanmaktadır.
              </Paragraph>
              <Paragraph>
                Bu süreçte kişisel verileriniz; KVKK’nın 5. ve 6. maddelerinde
                belirtilen hukuki sebeplere dayanılarak işlenmektedir. Bunlar
                arasında; kanunlarda açıkça öngörülmesi, bir sözleşmenin
                kurulması veya ifasıyla doğrudan doğruya ilgili olması, veri
                sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için
                zorunlu olması, bir hakkın tesisi, kullanılması veya korunması
                için veri işlemenin zorunlu olması ve temel hak ve
                özgürlüklerinize zarar vermemek kaydıyla ATİM’in meşru
                menfaatleri için veri işlemenin zorunlu olması sayılabilir. Özel
                nitelikli kişisel verileriniz ise ancak KVKK’da öngörülen
                istisnalar veya açık rızanız bulunması hâlinde işlenmektedir.
              </Paragraph>
              <Paragraph>
                Açık rızanızı gerektiren durumlarda, rızanızı dilediğiniz zaman
                geri çekme hakkınız bulunmaktadır; ancak rızanın geri alınması,
                geri alma tarihinden önce rızaya dayalı olarak gerçekleştirilen
                işlemenin hukuka uygunluğunu ortadan kaldırmaz.
              </Paragraph>
            </div>
          </Card>

          {/* Kişisel Verilerin Aktarılması */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>5. Kişisel Verilerin Aktarılması</SectionTitle>
              <Paragraph>
                Kişisel verileriniz, KVKK’nın 8. ve 9. maddelerinde belirtilen
                şartlara uygun olarak ve yalnızca gerekli olduğu ölçüde,
                aşağıdaki alıcı gruplarına aktarılabilmektedir:
              </Paragraph>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                <li>
                  İş arayan olarak bir ilana başvurmanız hâlinde, başvuru
                  yaptığınız ilgili işveren ve/veya işveren temsilcileri
                </li>
                <li>
                  Atakum Belediyesi’nin ilgili birimleri ve belediye iştirakleri
                </li>
                <li>
                  Proje ve program iş birlikleri kapsamında yetkili kamu kurum
                  ve kuruluşları ile iş birliği yapılan kurum ve kuruluşlar
                </li>
                <li>
                  Bilgi işlem altyapısı, yazılım, bakım ve destek hizmeti
                  aldığımız tedarikçiler ve danışmanlık firmaları
                </li>
                <li>
                  Mevzuat gereği talep yetkisi bulunan yargı mercileri ve
                  yetkili kamu kurumları
                </li>
              </ul>
              <Paragraph>
                Yurt dışına veri aktarımı söz konusu olduğunda, KVKK’da
                öngörülen ilkelere, Kurul kararlarına ve gerekli güvenlik
                tedbirlerine riayet edilmektedir. Böyle bir aktarım
                gerçekleştirildiğinde, mümkün olduğu ölçüde verileriniz
                anonimleştirilmekte veya sadece zorunlu veriler aktarılmaktadır.
              </Paragraph>
            </div>
          </Card>

          {/* KVKK Kapsamındaki Haklarınız */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>6. KVKK Kapsamındaki Haklarınız</SectionTitle>
              <Paragraph>
                KVKK’nın 11. maddesi uyarınca, veri sahibi olarak ATİM’e
                başvurarak aşağıdaki haklara sahipsiniz:
              </Paragraph>
              <ul className="list-disc pl-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>
                  Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
                </li>
                <li>
                  Kişisel verilerinizin işlenme amacını ve bunların amacına
                  uygun kullanılıp kullanılmadığını öğrenme
                </li>
                <li>
                  Yurt içinde veya yurt dışında kişisel verilerinizin
                  aktarıldığı üçüncü kişileri bilme
                </li>
                <li>
                  Eksik veya yanlış işlenmiş kişisel verilerinizin
                  düzeltilmesini isteme
                </li>
                <li>
                  Kişisel verilerinizin işlenmesini gerektiren sebeplerin
                  ortadan kalkması hâlinde silinmesini veya yok edilmesini
                  isteme
                </li>
                <li>
                  Düzeltme, silme veya yok etme işlemlerinin, kişisel
                  verilerinizin aktarıldığı üçüncü kişilere bildirilmesini
                  isteme
                </li>
                <li>
                  İşlenen verilerinizin münhasıran otomatik sistemler
                  vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun
                  ortaya çıkmasına itiraz etme
                </li>
                <li>
                  Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle
                  zarara uğramanız hâlinde zararın giderilmesini talep etme
                </li>
              </ul>
              <Paragraph>
                Söz konusu haklarınıza ilişkin taleplerinizi; yazılı olarak,
                kayıtlı elektronik posta (KEP) adresi, güvenli elektronik imza
                veya ATİM tarafından ilan edilen diğer usullerle veri
                sorumlusuna iletebilirsiniz. Başvurularınız, KVKK ve ilgili
                mevzuat kapsamında en kısa sürede ve en geç otuz gün içinde
                sonuçlandırılacaktır.
              </Paragraph>
            </div>
          </Card>

          {/* Saklama Süreleri ve Güvenlik Tedbirleri */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                7. Saklama Süreleri ve Güvenlik Tedbirleri
              </SectionTitle>
              <Paragraph>
                Kişisel verileriniz, ilgili mevzuatta öngörülen veya işleme
                amaçları için gerekli olan süreler boyunca saklanmakta; bu
                sürelerin sona ermesi hâlinde mevzuata uygun yöntemlerle
                silinmekte, yok edilmekte veya anonim hâle getirilmektedir.
              </Paragraph>
              <Paragraph>
                ATİM, kişisel verilerinizi yetkisiz erişim, kayıp, tahrip veya
                değişikliğe karşı korumak için gerekli idari ve teknik
                tedbirleri almaktadır. Bu kapsamda; erişim yetkilerinin
                sınırlandırılması, şifreleme, loglama, fizikî ve dijital
                güvenlik önlemleri, personel farkındalık eğitimleri gibi
                uygulamalar yürütülmektedir.
              </Paragraph>
            </div>
          </Card>

          {/* Güncellemeler */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 sm:p-6">
              <SectionTitle>
                8. Metinde Yapılabilecek Değişiklikler
              </SectionTitle>
              <Paragraph>
                Bu aydınlatma metni, güncel mevzuat ve ATİM uygulamalarındaki
                değişikliklere paralel olarak belirli aralıklarla
                güncellenebilir. Güncel sürüme her zaman ATİM portalı ve ilgili
                alanlardan ulaşabilirsiniz. Metnin güncellenmiş hâlini
                incelemeniz, haklarınız ve veri işleme faaliyetleri hakkında
                bilgi sahibi olmanız açısından önemlidir.
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Kvkk;
