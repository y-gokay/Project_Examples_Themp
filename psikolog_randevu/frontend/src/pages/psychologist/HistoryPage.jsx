import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarClock, Search } from 'lucide-react';
import { appointmentsApi } from '../../lib/endpoints';
import { Button, Card, Badge, EmptyState, Input } from '../../components/ui';
import { resolveAppointmentDisplay, isCompletedVirtual } from '../../lib/appointmentDisplay';

const STATUS_CHIPS = [
  { id: null, label: 'Tümü' },
  { id: 'pending', label: 'Bekleyen' },
  { id: 'approved', label: 'Onaylı' },
  { id: 'rejected', label: 'Red' },
  { id: 'cancelled', label: 'İptal' },
  { id: 'completed', label: 'Tamamlandı' },
];

const HistoryPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [statusChip, setStatusChip] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        scope: 'past',
        q: q.trim() || undefined,
        from: from || undefined,
        to: to || undefined,
      };
      if (statusChip && statusChip !== 'completed') {
        params.status = statusChip;
      }
      if (statusChip === 'completed') {
        params.status = 'approved';
      }
      const res = await appointmentsApi.history(params);
      setList(res.data.data);
    } catch {
      toast.error('Geçmiş randevular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusChip]);

  useEffect(() => {
    const t = setTimeout(() => fetchList(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, from, to]);

  const filtered = useMemo(() => {
    if (statusChip !== 'completed') return list;
    return list.filter((a) => isCompletedVirtual(a));
  }, [list, statusChip]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 tracking-wide uppercase mb-1">
          Arşiv
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
          Geçmiş randevular
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Durum, tarih aralığı ve hasta aramasına göre süzün.
        </p>
      </header>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setStatusChip(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-[opacity,transform] duration-150 border ${statusChip === c.id
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-violet-400/50'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Hasta adı veya e-posta"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div>
          <Button variant="secondary" size="sm" onClick={fetchList}>
            Yenile
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock className="w-7 h-7" />}
            title="Kayıt bulunamadı"
            description="Filtreleri değiştirerek tekrar deneyin."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const disp = resolveAppointmentDisplay(apt);
            return (
              <Card key={apt.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{apt.user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{apt.user?.email}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                      {new Date(apt.date).toLocaleDateString('tr-TR')} ·{' '}
                      {apt.startTime?.substring(0, 5)} – {apt.endTime?.substring(0, 5)}
                    </p>
                  </div>
                  <Badge tone={disp.tone}>{disp.label}</Badge>
                </div>
                {apt.status === 'rejected' && apt.rejectionReason && (
                  <p className="mt-3 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 rounded-lg px-3 py-2">
                    Ret sebebi: {apt.rejectionReason}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
