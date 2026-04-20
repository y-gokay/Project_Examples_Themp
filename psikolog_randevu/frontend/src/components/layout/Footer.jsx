import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';

const Footer = () => (
  <footer
    className="relative z-[1] border-t"
    style={{
      background: 'rgb(var(--bg-muted))',
      borderColor: 'rgba(var(--border))',
    }}
  >
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-10">
        <div>
          <Link to="/" className="flex items-center gap-3.5 mb-4">
            <div
              className="w-[42px] h-[42px] rounded-xl shadow-soft"
              style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
            />
            <div className="flex flex-col leading-[1.15]">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgb(var(--text-3))' }}>
                Atakum Belediyesi
              </span>
              <span className="text-sm font-bold tracking-wide" style={{ color: 'rgb(var(--text-1))' }}>
                PDR Danışmanlık
              </span>
            </div>
          </Link>
          <span className="for-line block w-10 h-[3px] rounded-sm mb-3 bg-[rgb(var(--accent))]" />
          <p className="text-[13px] font-light leading-[1.7] max-w-[240px]" style={{ color: 'rgb(var(--text-3))' }}>
            Vatandaşların ruh sağlığını desteklemek amacıyla kurulan ücretsiz psikolojik danışmanlık hizmeti.
          </p>
        </div>

        <div>
          <h5 className="text-[9px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgb(var(--text-3))' }}>
            Hizmetler
          </h5>
          {['Bireysel Danışmanlık', 'Çocuk & Ergen', 'Çift Terapisi', 'Grup Çalışmaları'].map((s) => (
            <span key={s} className="block text-[13px] font-normal mb-2.5" style={{ color: 'rgb(var(--text-3))' }}>
              {s}
            </span>
          ))}
        </div>

        <div>
          <h5 className="text-[9px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgb(var(--text-3))' }}>
            Kurumsal
          </h5>
          {[
            { label: 'Ana Sayfa', to: '/' },
            { label: 'Psikologlar', to: '/psikologlar' },
            { label: 'Kayıt Ol', to: '/kayit' },
            { label: 'Giriş Yap', to: '/giris' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="block text-[13px] font-normal mb-2.5 transition-colors hover:text-[rgb(var(--accent))]"
              style={{ color: 'rgb(var(--text-3))' }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div>
          <h5 className="text-[9px] font-extrabold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgb(var(--text-3))' }}>
            İletişim
          </h5>
          <ul className="space-y-3">
            {[
              { Icon: MapPin, text: 'Mimarsinan, İsmet İnönü Blv. No:114, Atakum/Samsun' },
              { Icon: Phone, text: '444 40 12' },
              { Icon: Mail, text: 'pdr@atakum.bel.tr' },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex gap-2.5 text-[13px] font-normal" style={{ color: 'rgb(var(--text-3))' }}>
                <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'rgb(var(--accent))' }} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-[11px] font-normal"
        style={{ borderTop: '1px solid rgba(var(--border))', color: 'rgb(var(--text-3))' }}
      >
        <span>© {new Date().getFullYear()} Atakum Belediyesi PDR Birimi. Tüm hakları saklıdır.</span>
        <span className="inline-flex items-center gap-1.5">
          Ruh sağlığınıza önem verin <Heart className="w-3 h-3" style={{ color: 'rgb(var(--accent))' }} />
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
