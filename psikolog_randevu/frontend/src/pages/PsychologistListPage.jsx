import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarDays } from 'lucide-react';
import api from '../lib/api';
import { Card, Input, EmptyState } from '../components/ui';
import { useReveal } from '../hooks/useReveal';
import { absoluteUrl } from '../lib/markdown';

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const AVATAR_GRADS = [
  'linear-gradient(135deg,#0e7c7b,#14a098)',
  'linear-gradient(135deg,#2aa8a5,#5dc9c8)',
  'linear-gradient(135deg,#3b7561,#4a9e6f)',
  'linear-gradient(135deg,#1a4a6e,#2e7d8a)',
  'linear-gradient(135deg,#0a6463,#33bfbb)',
  'linear-gradient(135deg,#084f4e,#7b6dab)',
];

function PsiCard({ p, index, visible }) {
  const delay = Math.min(index * 80, 400);
  return (
    <Link
      to={`/psikologlar/${p.id}`}
      className="block group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <Card className="p-6 h-full group-hover:-translate-y-1.5 group-hover:shadow-lift cursor-pointer">
        {/* Avatar with availability dot */}
        <div className="relative mb-5 w-fit">
          {p.avatarUrl ? (
            <img
              src={absoluteUrl(p.avatarUrl)}
              alt={p.user?.name}
              className="w-[68px] h-[68px] rounded-2xl object-cover"
            />
          ) : (
            <div
              className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white"
              style={{ background: AVATAR_GRADS[index % AVATAR_GRADS.length] }}
            >
              {p.user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 animate-pulse-dot"
            style={{
              background: 'rgb(var(--sage))',
              borderColor: 'rgb(var(--bg-elev))',
            }}
          />
        </div>

        <p className="font-extrabold text-base leading-tight mb-1" style={{ color: 'rgb(var(--text-1))' }}>
          {p.user?.name}
        </p>
        {p.title && (
          <p className="text-[11px] font-bold mb-0.5" style={{ color: 'rgb(var(--text-3))' }}>
            {p.title}
          </p>
        )}
        {Array.isArray(p.specializations) && p.specializations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.specializations.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                style={{
                  background: 'rgba(var(--accent), 0.10)',
                  color: 'rgb(var(--accent))',
                }}
              >
                {s}
              </span>
            ))}
            {p.specializations.length > 3 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(var(--border))', color: 'rgb(var(--text-2))' }}
              >
                +{p.specializations.length - 3}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm font-bold mb-4" style={{ color: 'rgb(var(--accent))' }}>
            Klinik Psikolog
          </p>
        )}

        {p.availabilities?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.availabilities.slice(0, 5).map((a) => (
              <span
                key={a.id}
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                style={{
                  background: 'rgba(var(--accent), 0.08)',
                  color: 'rgb(var(--accent))',
                }}
              >
                {DAYS[a.dayOfWeek]}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-4">
            <CalendarDays className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-3))' }} />
            <span className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>Müsaitlik belirtilmemiş</span>
          </div>
        )}

        <div
          className="text-xs font-extrabold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(var(--sage), 0.10)',
            color: 'rgb(var(--sage))',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgb(var(--sage))' }} />
          Bu hafta müsait
        </div>
      </Card>
    </Link>
  );
}

const PsychologistListPage = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gridRef, gridVisible] = useReveal(0.05);

  useEffect(() => {
    api.get('/psychologists')
      .then((res) => setPsychologists(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = psychologists.filter((p) => {
    const q = search.toLowerCase();
    const inName = p.user?.name?.toLowerCase().includes(q);
    const inSpecs = (p.specializations || []).some((s) => String(s).toLowerCase().includes(q));
    return inName || inSpecs;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      {/* Header */}
      <div className="mb-10 reveal visible">
        <span className="section-tag">Ekibimiz</span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: 'rgb(var(--text-1))' }}>
          Uzman Psikologlarımız
        </h1>
        <p className="max-w-xl text-sm leading-relaxed" style={{ color: 'rgb(var(--text-2))' }}>
          Alanında deneyimli, empatik psikologlarımızdan birini seçerek güvenli bir ortamda destek alın.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-10 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgb(var(--text-3))' }} />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İsim veya uzmanlık alanı ara…"
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="w-[68px] h-[68px] rounded-2xl mb-4" style={{ background: 'rgba(var(--border))' }} />
              <div className="h-3 rounded w-3/4 mb-2" style={{ background: 'rgba(var(--border))' }} />
              <div className="h-3 rounded w-1/2" style={{ background: 'rgba(var(--border))' }} />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Sonuç bulunamadı' : 'Henüz psikolog yok'}
          description={
            search
              ? `"${search}" ile eşleşen uzman bulunamadı.`
              : 'Sistemde henüz kayıtlı uzman bulunmuyor.'
          }
        />
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <PsiCard key={p.id} p={p} index={i} visible={gridVisible} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PsychologistListPage;
