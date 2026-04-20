import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  Building2,
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Loader2,
  RotateCw,
} from "lucide-react";
import { Button, Input, Textarea } from "../../components/ui";
import { SEOHead } from "../../components/common";
import { useAppStore } from "../../store";
import { showToast } from "../../components/ui/Toast";
import heroBackgroundImage from "../../assets/atakumun-essiz-sahili.webp";
import heroBackgroundImageNight from "../../assets/atakumun-essiz-sahili-gece.webp";

const Contact = () => {
  const { submitContactForm, getFAQs, theme } = useAppStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    content: "",
  });
  const [faqs, setFaqs] = useState([]);
  const [loadingFAQs, setLoadingFAQs] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Bot kontrolü için state'ler
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const MAX_FREE_REFRESHES = 5;
  const REFRESH_COOLDOWN_SECONDS = 30;
  const captchaCanvasRef = useRef(null);

  // Rastgele 7 haneli kod oluşturma fonksiyonu
  const generateCaptchaCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // I, O, 0, 1 gibi karıştırıcı karakterler çıkarıldı
    let code = "";
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Canvas'a captcha çizimi
  const drawCaptcha = useCallback((code) => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, width, height);

    // Rastgele arka plan rengi
    const bgColors = ["#f0f0f0", "#f5f5f5", "#fafafa", "#e8e8e8", "#e0e0e0"];
    ctx.fillStyle = bgColors[Math.floor(Math.random() * bgColors.length)];
    ctx.fillRect(0, 0, width, height);

    // Rastgele gürültü çizgileri (noise)
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Rastgele noktalar
    ctx.fillStyle = "#bbbbbb";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Karakterleri çiz
    const charWidth = width / (code.length + 1);
    const fontSize = 28;
    ctx.font = `bold ${fontSize}px Arial`;

    for (let i = 0; i < code.length; i++) {
      // Her karakter için rastgele renk
      const colors = ["#333333", "#444444", "#555555", "#666666", "#222222"];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

      // Karakter pozisyonunu biraz boz
      const x = charWidth * (i + 0.5) + (Math.random() - 0.5) * 8;
      const y = height / 2 + (Math.random() - 0.5) * 10;

      // Karakteri döndür (hafif)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3); // -15° ile +15° arası

      // Karakter boyutunu biraz değiştir
      const scale = 0.9 + Math.random() * 0.2; // 0.9 - 1.1 arası
      ctx.scale(scale, scale);

      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // Ek gürültü çizgileri (karakterlerin üzerine)
    ctx.strokeStyle = "#aaaaaa";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
  }, []);

  // İlk yüklemede ve form submit sonrası captcha oluştur
  useEffect(() => {
    loadFAQs();
    const code = generateCaptchaCode();
    setCaptchaCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Captcha kodu değiştiğinde canvas'a çiz
  useEffect(() => {
    if (captchaCode && captchaCanvasRef.current) {
      // Canvas'ın yüklenmesini bekle
      const timer = setTimeout(() => {
        drawCaptcha(captchaCode);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captchaCode]);

  // Form başarıyla gönderildiğinde captcha'yı sıfırla
  useEffect(() => {
    if (isSubmitted) {
      const code = generateCaptchaCode();
      setCaptchaCode(code);
      setCaptchaInput("");
      setLastRefreshTime(null);
      setRemainingSeconds(0);
      setRefreshCount(0);
    }
  }, [isSubmitted]);

  // Kalan süreyi hesapla ve göster (sadece 5. refresh'ten sonra aktif)
  useEffect(() => {
    // İlk 5 refresh'te limit yok
    if (refreshCount < MAX_FREE_REFRESHES) {
      setRemainingSeconds(0);
      return;
    }

    if (!lastRefreshTime) {
      setRemainingSeconds(0);
      return;
    }

    // İlk hesaplamayı hemen yap
    const calculateRemaining = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastRefreshTime) / 1000);
      const remaining = Math.max(0, REFRESH_COOLDOWN_SECONDS - elapsed);
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setLastRefreshTime(null);
      }
    };

    // İlk hesaplamayı hemen yap
    calculateRemaining();

    // Sonra her saniye güncelle
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [
    lastRefreshTime,
    REFRESH_COOLDOWN_SECONDS,
    refreshCount,
    MAX_FREE_REFRESHES,
  ]);

  const loadFAQs = async () => {
    setLoadingFAQs(true);
    const result = await getFAQs();
    setLoadingFAQs(false);
    if (result.success) {
      setFaqs(result.data?.items || result.data || []);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Captcha refresh fonksiyonu
  const handleRefreshCaptcha = () => {
    // 5. refresh'ten sonra saniye limiti kontrolü
    if (refreshCount >= MAX_FREE_REFRESHES) {
      // Anlık süre kontrolü yap (state gecikmesi olabilir)
      if (lastRefreshTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - lastRefreshTime) / 1000);
        const currentRemaining = Math.max(
          0,
          REFRESH_COOLDOWN_SECONDS - elapsed,
        );

        if (currentRemaining > 0) {
          showToast({
            type: "error",
            message: `Güvenlik kodu ${currentRemaining} saniye sonra yenilenebilir.`,
            duration: 3000,
          });
          return;
        }
      }
    }

    const code = generateCaptchaCode();
    setCaptchaCode(code);
    setCaptchaInput("");
    const newRefreshCount = refreshCount + 1;
    setRefreshCount(newRefreshCount);

    // 5. refresh'ten sonra saniye limitini aktif et
    if (newRefreshCount >= MAX_FREE_REFRESHES) {
      setLastRefreshTime(Date.now());
      setRemainingSeconds(REFRESH_COOLDOWN_SECONDS);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasyon
    if (!formData.email || !formData.title || !formData.content) {
      showToast({
        type: "error",
        message: "Lütfen zorunlu alanları (E-posta, Konu, Mesaj) doldurun",
        duration: 3000,
      });
      return;
    }

    if (formData.content.trim().length < 10) {
      showToast({
        type: "error",
        message: "Mesaj en az 10 karakter olmalıdır",
        duration: 3000,
      });
      return;
    }

    // Bot kontrolü - Captcha doğrulama
    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode) {
      showToast({
        type: "error",
        message: "Güvenlik kodu hatalı. Lütfen tekrar deneyin.",
        duration: 3000,
      });
      // Hatalı girişte captcha'yı yenile
      const code = generateCaptchaCode();
      setCaptchaCode(code);
      setCaptchaInput("");
      return;
    }

    const contactPayload = {
      email: formData.email.trim(),
      title: formData.title.trim(),
      content: formData.content.trim(),
    };

    // name is optional, only include if provided
    if (formData.name && formData.name.trim()) {
      contactPayload.name = formData.name.trim();
    }

    const result = await submitContactForm(contactPayload);

    if (result.success) {
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        title: "",
        content: "",
      });
      setCaptchaInput("");
      setLastRefreshTime(null);
      setRemainingSeconds(0);
      showToast({
        type: "success",
        message: "Mesajınız başarıyla gönderildi",
        duration: 3000,
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      // Handle API validation errors
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors
          .map((err) => err.message)
          .join(", ");
        showToast({
          type: "error",
          message: errorMessages || "Mesaj gönderilirken bir hata oluştu",
          duration: 3000,
        });
      } else {
        showToast({
          type: "error",
          message: result.error || "Mesaj gönderilirken bir hata oluştu",
          duration: 3000,
        });
      }
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      content: "444 4 055",
      detail: "Hafta içi 08:00 - 17:00",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
    },
    {
      icon: Mail,
      title: "E-posta",
      content: "istihdam@atakum.bel.tr",
      detail: "7/24 destek",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
    },
    {
      icon: MapPin,
      title: "Adres",
      content: "Atakum Belediyesi",
      detail: "Mimarsinan, İsmet İnönü Blv. No:114, 55200 Atakum / Samsun",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      content: "Pazartesi - Cuma",
      detail: "08:00 - 17:00",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEOHead
        title="İletişim"
        description="Atakum Belediyesi İstihdam Merkezi iletişim bilgileri. Adres: Mimarsinan, İsmet İnönü Blv. No:114, Atakum/Samsun. Telefon: 444 4 055."
        path="/iletisim"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20">
        <img
          src={
            theme === "dark" ? heroBackgroundImageNight : heroBackgroundImage
          }
          alt="Atakum sahili"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-indigo-900/70"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02eiIvPjwvZz48L2c+PC9zdmc+')]"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-6 animate-slide-down">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-semibold">Bize Ulaşın</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Size Nasıl Yardımcı Olabiliriz?
          </h1>

          <p
            className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Sorularınız, önerileriniz veya destek talepleriniz için bizimle
            iletişime geçin
          </p>
        </div>

        {/* Wave Separator Removed */}
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${info.bgColor} dark:from-gray-800 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${info.color} rounded-lg sm:rounded-xl mb-3 sm:mb-4 shadow-lg`}
              >
                <info.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                {info.title}
              </h3>
              <p className="text-xs sm:text-base text-gray-700 dark:text-gray-300 font-semibold mb-0.5 sm:mb-1">
                {info.content}
              </p>
              <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
                {info.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Mesaj Gönderin
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Formu doldurarak bize ulaşabilirsiniz. En kısa sürede size geri
                dönüş yapacağız.
              </p>
            </div>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl flex items-center gap-3 animate-slide-down">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">
                  Mesajınız başarıyla gönderildi! En kısa sürede size dönüş
                  yapacağız.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Ad Soyad"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız ve soyadınız"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                required
              />

              <Input
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                required
              />

              <Input
                label="Konu"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Mesajınızın konusu"
                leftIcon={<MessageSquare className="w-5 h-5 text-gray-400" />}
                required
              />

              <Textarea
                label="Mesajınız"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Mesajınızı buraya yazın... (En az 10 karakter)"
                rows={6}
                required
                minLength={10}
              />

              {/* Bot Kontrolü - Captcha */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Güvenlik Kodu <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex-1 flex items-center justify-center">
                    <canvas
                      ref={captchaCanvasRef}
                      width={200}
                      height={50}
                      className="border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                      style={{ imageRendering: "crisp-edges" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    disabled={
                      refreshCount >= MAX_FREE_REFRESHES && remainingSeconds > 0
                    }
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${refreshCount >= MAX_FREE_REFRESHES && remainingSeconds > 0
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      }`}
                    title={
                      refreshCount >= MAX_FREE_REFRESHES
                        ? remainingSeconds > 0
                          ? `${remainingSeconds} saniye sonra yenilenebilir`
                          : "Güvenlik kodunu yenile"
                        : "Güvenlik kodunu yenile"
                    }
                  >
                    <RotateCw
                      className={`w-5 h-5 ${remainingSeconds > 0
                          ? ""
                          : "hover:rotate-180 transition-transform duration-300"
                        }`}
                    />
                  </button>
                </div>
                <Input
                  type="text"
                  value={captchaInput}
                  onChange={(e) =>
                    setCaptchaInput(e.target.value.toUpperCase())
                  }
                  placeholder="Yukarıdaki kodu girin"
                  maxLength={7}
                  required
                />
                {refreshCount >= MAX_FREE_REFRESHES && remainingSeconds > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Yenileme için {remainingSeconds} saniye bekleyin
                  </p>
                )}
                {refreshCount >= MAX_FREE_REFRESHES &&
                  remainingSeconds === 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Artık her yenilemede 30 saniye bekleme süresi var
                    </p>
                  )}
                {refreshCount > 0 && refreshCount < MAX_FREE_REFRESHES && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Kalan yenileme: {MAX_FREE_REFRESHES - refreshCount}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                fullWidth
                leftIcon={<Send className="w-5 h-5" />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mesaj Gönder
              </Button>
            </form>
          </div>

          {/* Info & Social */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Atakum Belediyesi
                </h3>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Atakum Belediyesi İstihdam Merkezi olarak, bölgemizdeki istihdam
                sorunlarına çözüm üretmek ve insanlarımıza daha iyi kariyer
                fırsatları sunmak için çalışıyoruz.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
                  <MapPin className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Adres
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mimarsinan, İsmet İnönü Blv. No:114, 55200
                      <br />
                      Atakum / Samsun
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
                  <Phone className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Telefon
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      444 4 055
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl">
                  <Mail className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      E-posta
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      istihdam@atakum.bel.tr
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Sosyal Medyada Bizi Takip Edin
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/atakumbeltr/?locale=tr_TR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://x.com/atakumbeltr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/atakumbeltr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/atakumbeltr/?originalSubdomain=tr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.093406060684!2d36.284830899999996!3d41.32858219999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408879ac4fffd61b%3A0xfb0020069338890!2sAtakum%20Belediyesi!5e0!3m2!1str!2str!4v1765974871040!5m2!1str!2str"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Atakum Belediyesi Konumu"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="sss"
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            En çok merak edilen soruların cevapları
          </p>
        </div>

        <div className="space-y-4">
          {loadingFAQs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          ) : faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <details
                key={faq.id || index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 dark:text-gray-100">
                  <span>{faq.question || faq.title || faq.q}</span>
                  <span className="text-purple-600 dark:text-purple-400 group-open:rotate-45 transition-transform duration-300">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer || faq.content || faq.a}
                </p>
              </details>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Henüz soru bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;
