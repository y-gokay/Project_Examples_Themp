import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Lock,
  ShieldCheck,
  Heart,
} from "lucide-react";
import api from "../lib/api";
import { absoluteUrl } from "../lib/markdown";
import { useRevealClass } from "../hooks/useReveal";

const FAQS = [
  {
    q: "Hizmet ücretli mi?",
    a: "Hayır. Atakum Belediyesi PDR hizmeti tamamen ücretsizdir.",
  },
  {
    q: "Randevumu iptal edebilir miyim?",
    a: 'Evet. "Randevularım" üzerinden, görüşme saatinden en az 2 saat öncesine kadar iptal edebilirsiniz.',
  },
  {
    q: "Kimler yararlanabilir?",
    a: "Atakum ilçesinde yaşayan tüm vatandaşlar bu hizmetten ücretsiz olarak yararlanabilir.",
  },
  {
    q: "Görüşmeler nerede gerçekleşir?",
    a: "Görüşmeler Atakum Belediyesi bünyesindeki PDR merkezinde yüz yüze yapılır.",
  },
];

const STRIP_ITEMS = [
  { icon: "", t: "Gizlilik Güvencesi", s: "Tüm görüşmeler sır kapsamındadır" },
  { icon: "", t: "Uzman Kadro", s: "Klinik psikologlar ve danışmanlar" },
  { icon: "", t: "Kolay Randevu", s: "Birkaç adımda randevu alın" },
  { icon: "", t: "Atakum'da Hizmet", s: "T.C. Atakum Belediyesi bünyesinde" },
];

function initialsFromName(name) {
  if (!name) return "•";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Counter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const numTarget = parseInt(target.replace(/\D/g, ""), 10);
          const duration = 1200;
          const steps = 40;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * numTarget));
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
          obs.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const hasPlus = target.includes("+");
  const hasPercent = target.includes("%");

  return (
    <span ref={ref} className="tabular-nums">
      {hasPercent && "%"}
      {count.toLocaleString("tr-TR")}
      {hasPlus ? "+" : ""}
    </span>
  );
}

const LandingPage = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  const [heroRef, heroClass] = useRevealClass("up", 0);
  const [psiRef, psiClass] = useRevealClass("up", 0);
  const [howRef, howClass] = useRevealClass("up", 0);
  const [darkRef, darkClass] = useRevealClass("up", 0);
  const [faqRef, faqClass] = useRevealClass("up", 0);

  useEffect(() => {
    api
      .get("/psychologists")
      .then((res) => setPsychologists(res.data.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col overflow-x-hidden relative z-[1]">
      {/* Hero Redesign */}
      <section className="relative min-h-[100vh] flex items-center pt-32 pb-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] rounded-full opacity-40 blur-[120px] bg-gradient-to-br from-[rgb(var(--accent))] to-transparent animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div className="absolute top-[10%] -right-[20%] w-[50%] h-[80%] rounded-full opacity-30 blur-[130px] bg-gradient-to-bl from-[rgb(var(--sage))] to-transparent animate-float-slow" />
          <div className="absolute -bottom-[30%] left-[20%] w-[70%] h-[60%] rounded-full opacity-20 blur-[100px] bg-gradient-to-t from-[rgb(var(--brand-blue))] to-transparent" />
        </div>

        <div className="max-w-[1400px] mx-auto w-full px-5 sm:px-8 lg:px-12 relative z-[3] grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div ref={heroRef} className={`max-w-2xl ${heroClass}`}>
            <div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border mb-8 glass"
              style={{ borderColor: "rgba(var(--border))" }}
            >
              <span
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{ color: "rgb(var(--text-2))" }}
              >
                Atakum Belediyesi Psikoloji ve Danışmanlık Hizmetleri
              </span>
            </div>

            <h1
              className="font-display font-semibold leading-[1.05] tracking-tight mb-6 text-[clamp(44px,6vw,84px)]"
              style={{ color: "rgb(var(--text-1))" }}
            >
              İçsel Huzurunuza <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-gradient">
                  Yolculuk Başlasın
                </span>
                <svg
                  className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-4 text-[rgb(var(--accent))] opacity-30 pointer-events-none"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="text-[17px] sm:text-[19px] font-light leading-[1.7] mb-10 max-w-[500px]"
              style={{ color: "rgb(var(--text-2))" }}
            >
              Zihinsel iyi oluşunuz için profesyonel destek bir tık uzağınızda.
              Uzman psikologlarımızla yargılanmadan, güvenli bir alanda
              kendinizi ifade edin.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-14">
              <Link
                to="/psikologlar"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-[16px] font-bold text-white transition-all overflow-hidden hover:shadow-lift hover:-translate-y-0.5"
                style={{ background: "rgb(var(--accent))" }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Randevu Al</span>
                <ArrowRight className="relative z-10 w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/kayit"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-[16px] font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(var(--bg-elev), 0.5)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(var(--border))",
                  color: "rgb(var(--text-1))",
                }}
              >
                Kayıt Ol
              </Link>
            </div>

            <div
              className="flex flex-wrap gap-10 pt-8 border-t"
              style={{ borderColor: "rgba(var(--border), 0.5)" }}
            >
              {[
                { label: "Uzman Kadro", val: "4", plus: false },
                { label: "Ücretsiz", val: "100", pre: "%", plus: false },
                { label: "Kayıtlı Danışan", val: "1.2", post: "K", plus: true },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <div
                    className="text-[36px] sm:text-[44px] font-display font-bold leading-none mb-1"
                    style={{ color: "rgb(var(--text-1))" }}
                  >
                    {stat.pre}
                    <Counter target={stat.val} />
                    {stat.post}
                    {stat.plus && "+"}
                  </div>
                  <div
                    className="text-[12px] font-semibold tracking-wide uppercase"
                    style={{ color: "rgb(var(--text-3))" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Abstract Visual */}
          <div className="relative hidden lg:flex items-center justify-center w-full h-[600px]">
            {/* Base 3D-like Shape */}
            <div className="absolute top-[10%] w-[380px] h-[380px] rounded-[40px] rotate-12 bg-gradient-to-tr from-[rgba(var(--accent),0.9)] to-[rgba(var(--accent-2),0.2)] shadow-2xl backdrop-blur-3xl animate-float-slow border border-white/20" />
            <div
              className="absolute top-[20%] right-[10%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-[rgba(var(--sage),0.8)] to-[rgba(var(--sage),0.1)] shadow-2xl backdrop-blur-3xl animate-float border border-white/20"
              style={{ animationDelay: "2s" }}
            />

            {/* Floating Info Cards */}
            <div
              className="absolute top-[15%] -left-[5%] w-[260px] p-5 rounded-2xl glass shadow-lift transform -rotate-3 animate-float"
              style={{ animationDelay: "0s" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "rgba(var(--sage), 0.15)",
                  color: "rgb(var(--sage))",
                }}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div
                className="text-[15px] font-bold mb-1.5"
                style={{ color: "rgb(var(--text-1))" }}
              >
                %100 Gizlilik
              </div>
              <div
                className="text-[13px] font-light leading-relaxed"
                style={{ color: "rgb(var(--text-2))" }}
              >
                Tüm görüşmeleriniz kurum sırrı kapsamında, uçtan uca şifreli
                kayıt altındadır.
              </div>
            </div>

            <div
              className="absolute bottom-[20%] -right-[5%] w-[280px] p-5 rounded-2xl glass shadow-lift transform rotate-2 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-full overflow-hidden shadow-sm flex items-center justify-center"
                  style={{
                    background: "rgb(var(--bg-muted))",
                    border: "2px solid rgb(var(--bg-elev))",
                  }}
                >
                  <div
                    className="font-display text-2xl font-bold"
                    style={{ color: "rgb(var(--accent))" }}
                  >
                    M
                  </div>
                </div>
                <div>
                  <div
                    className="text-[15px] font-bold"
                    style={{ color: "rgb(var(--text-1))" }}
                  >
                    Klinik Psikolog
                  </div>
                  <div
                    className="text-[11px] uppercase font-bold tracking-wider mt-0.5"
                    style={{ color: "rgb(var(--sage))" }}
                  >
                    Müsait
                  </div>
                </div>
              </div>
              <div
                className="h-2 w-full rounded-full mb-2.5 opacity-30"
                style={{ background: "rgb(var(--text-3))" }}
              />
              <div
                className="h-2 w-2/3 rounded-full opacity-30"
                style={{ background: "rgb(var(--text-3))" }}
              />
            </div>
          </div>
        </div>

        {/* Bottom edge transition curve */}
        <svg
          className="absolute bottom-0 left-0 right-0 h-[100px] w-full pointer-events-none z-[4]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z"
            fill="rgb(var(--bg-base))"
          />
        </svg>
      </section>

      {/* Bilgi şeridi */}
      <div className="strip-accent">
        {STRIP_ITEMS.map((item) => (
          <div key={item.t} className="strip-item relative z-[1]">
            <span className="text-2xl shrink-0" aria-hidden>
              {item.icon}
            </span>
            <div>
              <strong className="text-[13px] font-bold text-white block">
                {item.t}
              </strong>
              <span className="text-[11px] text-white/70">{item.s}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Psikologlar */}
      {psychologists.length > 0 && (
        <section className="relative z-[1] py-20 sm:py-24 px-5 sm:px-8 lg:px-12">
          <div className="max-w-[1200px] mx-auto">
            <div
              ref={psiRef}
              className={`flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 ${psiClass}`}
            >
              <div>
                <span className="section-tag">Psikologlarımız</span>
                <h2
                  className="font-display font-semibold text-[clamp(34px,4.5vw,56px)] leading-[1.05] tracking-tight"
                  style={{ color: "rgb(var(--text-1))" }}
                >
                  Uzman
                  <br />
                  kadromuz
                </h2>
              </div>
              <p
                className="text-[15px] font-light leading-[1.7] max-w-[520px] md:text-right"
                style={{ color: "rgb(var(--text-2))" }}
              >
                Alanında deneyimli uzmanlarımızdan birini seçin, randevunuzu
                oluşturun.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {psychologists.map((p, i) => {
                const ini = initialsFromName(p.user?.name);
                const specs = Array.isArray(p.specializations) ? p.specializations.filter(Boolean) : [];
                const bioExcerpt = (p.bio || "").trim().replace(/\s+/g, " ");
                const hasSlots = p.availabilities?.length > 0;
                return (
                  <Link
                    key={p.id}
                    to={`/psikologlar/${p.id}`}
                    className={`group block rounded-2xl border p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${psiClass.includes("visible") ? "visible" : ""}`}
                    style={{
                      background: "rgb(var(--bg-elev))",
                      borderColor: "rgba(var(--border))",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      {p.avatarUrl ? (
                        <img
                          src={absoluteUrl(p.avatarUrl)}
                          alt={p.user?.name}
                          className="w-20 h-20 rounded-full object-cover ring-[3px] ring-[rgb(var(--accent))] ring-offset-2 ring-offset-[rgb(var(--bg-elev))] mb-5"
                        />
                      ) : (
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-extrabold text-white ring-[3px] ring-[rgb(var(--accent))] ring-offset-2 ring-offset-[rgb(var(--bg-elev))] mb-5"
                          style={{
                            background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))",
                          }}
                        >
                          {ini}
                        </div>
                      )}
                      <h3
                        className="text-lg font-bold leading-tight mb-1"
                        style={{ color: "rgb(var(--text-1))" }}
                      >
                        {p.user?.name}
                      </h3>
                      {p.title && (
                        <p className="text-sm font-medium mb-3" style={{ color: "rgb(var(--text-2))" }}>
                          {p.title}
                        </p>
                      )}
                      {!p.title && specs.length === 0 && (
                        <p className="text-sm font-medium mb-3" style={{ color: "rgb(var(--text-3))" }}>
                          Klinik Psikolog
                        </p>
                      )}
                    </div>

                    {specs.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-1 mb-4">
                        {specs.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              background: "rgba(var(--accent), 0.10)",
                              color: "rgb(var(--accent))",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                        {specs.length > 2 && (
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              background: "rgba(var(--border))",
                              color: "rgb(var(--text-2))",
                            }}
                          >
                            +{specs.length - 2} alan
                          </span>
                        )}
                      </div>
                    )}

                    {bioExcerpt && (
                      <p
                        className="text-[13px] leading-relaxed line-clamp-2 mb-5 text-center"
                        style={{ color: "rgb(var(--text-2))" }}
                      >
                        {bioExcerpt}
                      </p>
                    )}

                    <div
                      className="flex items-center justify-center gap-1.5 text-[11px] font-semibold mb-4"
                      style={{ color: hasSlots ? "rgb(var(--sage))" : "rgb(var(--text-3))" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background: hasSlots ? "rgb(var(--sage))" : "rgb(var(--text-3))",
                          animation: hasSlots ? "pulse-dot 2s ease-in-out infinite" : "none",
                        }}
                      />
                      {hasSlots ? "Randevu açık" : "Müsaitlik için profili inceleyin"}
                    </div>

                    <div className="flex justify-center pt-2 border-t" style={{ borderColor: "rgba(var(--border))" }}>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-bold transition-all group-hover:gap-2"
                        style={{ color: "rgb(var(--accent))" }}
                      >
                        Profili gör
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/psikologlar"
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5 group"
                style={{ color: "rgb(var(--accent))" }}
              >
                Tüm psikologları gör{" "}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Nasıl çalışır */}
      <section
        className="relative z-[1] py-20 sm:py-24 px-5 sm:px-8 lg:px-12"
        style={{ background: "rgb(var(--bg-muted))" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div
            ref={howRef}
            className={`text-center mb-12 max-w-2xl mx-auto ${howClass}`}
          >
            <span className="section-tag justify-center">Süreç</span>
            <h2
              className="font-display font-semibold text-[clamp(34px,4.5vw,56px)] leading-[1.05] tracking-tight"
              style={{ color: "rgb(var(--text-1))" }}
            >
              Üç adımda görüşmeye başlayın
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                title: "Kayıt olun",
                desc: "E-posta ve şifrenizle saniyeler içinde hesap oluşturun.",
              },
              {
                num: "02",
                title: "Randevu seçin",
                desc: "Size uygun psikoloğu ve boş slotu seçin.",
              },
              {
                num: "03",
                title: "Görüşün",
                desc: "Uzmanınızla belirtilen saatte yüz yüze buluşun.",
              },
            ].map((s, i) => (
              <div
                key={s.num}
                className={`rounded-2xl border p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${howClass.includes("visible") ? "visible" : ""}`}
                style={{
                  background: "rgb(var(--bg-elev))",
                  borderColor: "rgba(var(--border))",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <span
                  className="absolute top-4 right-4 font-mono text-xs font-bold"
                  style={{ color: "rgb(var(--text-3))" }}
                >
                  {s.num}
                </span>
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-lg shadow-soft"
                  style={{ background: "rgb(var(--accent))" }}
                >
                  {s.num.replace(/^0/, "")}
                </div>
                <h3
                  className="text-base font-bold mb-1.5"
                  style={{ color: "rgb(var(--text-1))" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: "rgb(var(--text-2))" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Koyu kesit — güvence + CTA */}
      <section ref={darkRef} className={`sec-dark ${darkClass}`}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="section-tag">Güvence</span>
            <h2 className="font-display font-semibold text-[clamp(30px,4vw,48px)] leading-[1.08] mb-6 tracking-tight">
              Güvenli bir alan,
              <br />
              profesyonel bir ekip
            </h2>
            <ul className="space-y-5">
              {[
                {
                  icon: ShieldCheck,
                  title: "Uçtan uca şifreli notlar",
                  desc: "Klinik notlarınız tarayıcınızda şifrelenir; sunucu düz metni asla görmez.",
                },
                {
                  icon: Lock,
                  title: "Gizlilik taahhüdü",
                  desc: "Görüşme içerikleri hiçbir kurum veya kişiyle paylaşılmaz.",
                },
                {
                  icon: Heart,
                  title: "Empatik yaklaşım",
                  desc: "Psikologlarımız yargılamadan, anlayışla dinler.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(40,184,180,0.14)",
                      color: "rgb(var(--accent-2))",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-0.5 text-[#f5f0e8]">
                      {title}
                    </p>
                    <p className="text-sm font-light sec-subtle">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl border p-8 text-center relative overflow-hidden"
            style={{
              background: "#0b1f22",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,0.03) 14px,rgba(255,255,255,0.03) 15px)",
              }}
            />
            <div className="relative z-[1]">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] sec-subtle">
                  Hazır
                </span>
              </div>
              <h3 className="font-display font-semibold text-2xl mb-2 text-[#f5f0e8]">
                İlk randevunu al
              </h3>
              <p className="text-sm font-light mb-6 sec-subtle">
                Üye ol, uzmanını seç, saatini belirle. Hepsi bu kadar.
              </p>
              <Link
                to="/kayit"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "rgb(var(--accent))",
                  boxShadow: "0 8px 28px rgba(14,124,123,0.35)",
                }}
              >
                Hemen başla
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="relative z-[1] py-20 sm:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <div ref={faqRef} className={`text-center mb-10 ${faqClass}`}>
            <span className="section-tag justify-center">SSS</span>
            <h2
              className="font-display font-semibold text-[clamp(30px,4vw,48px)] leading-tight tracking-tight"
              style={{ color: "rgb(var(--text-1))" }}
            >
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border overflow-hidden transition-shadow ${open ? "shadow-lift" : ""}`}
                  style={{
                    background: "rgb(var(--bg-elev))",
                    borderColor: "rgba(var(--border))",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span
                      className="font-bold text-sm pr-3"
                      style={{ color: "rgb(var(--text-1))" }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      className="w-4 h-4 shrink-0 transition-transform duration-300"
                      style={{
                        color: open
                          ? "rgb(var(--accent))"
                          : "rgb(var(--text-3))",
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                  <div
                    className="px-4 overflow-hidden transition-[max-height,opacity] duration-300"
                    style={{
                      maxHeight: open ? "8rem" : 0,
                      opacity: open ? 1 : 0,
                      paddingBottom: open ? "1rem" : 0,
                    }}
                  >
                    <p
                      className="text-sm font-light"
                      style={{ color: "rgb(var(--text-2))" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
