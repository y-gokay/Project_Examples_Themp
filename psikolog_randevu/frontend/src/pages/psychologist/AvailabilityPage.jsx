import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Save, Trash2, CalendarDays } from 'lucide-react';
import { Button, Card } from '../../components/ui';

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
/** Backend dayOfWeek = Date.getDay(); liste Pazartesi’den başlar */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
/** 08:00–09:00 … 16:00–17:00 (backend ile aynı) */
const HOUR_BLOCKS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

const hourLabel = (h) => `${String(h).padStart(2, '0')}:00 – ${String(h + 1).padStart(2, '0')}:00`;

const AvailabilityPage = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [psychologistId, setPsychologistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [draftHours, setDraftHours] = useState([]);
  const [savingDay, setSavingDay] = useState(null);

  const hoursByDay = useMemo(() => {
    const m = new Map();
    for (const a of availabilities) {
      m.set(a.dayOfWeek, Array.isArray(a.selectedHours) ? [...a.selectedHours] : []);
    }
    return m;
  }, [availabilities]);

  const fetchProfile = useCallback(async () => {
    try {
      const [meRes, psyRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/psychologists'),
      ]);
      const myPsy = psyRes.data.data.find((p) => p.userId === meRes.data.data.id);
      if (myPsy) {
        setPsychologistId(myPsy.id);
        const avRes = await api.get(`/availability/${myPsy.id}`);
        setAvailabilities(avRes.data.data);
      }
    } catch {
      toast.error('Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const openDay = (dow) => {
    if (expandedDay === dow) {
      setExpandedDay(null);
      return;
    }
    setExpandedDay(dow);
    setDraftHours(hoursByDay.get(dow) || []);
  };

  const toggleHour = (h) => {
    setDraftHours((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h].sort((a, b) => a - b)));
  };

  const saveDay = async (dow) => {
    setSavingDay(dow);
    try {
      await api.put('/availability', { dayOfWeek: dow, selectedHours: draftHours });
      toast.success(`${DAY_NAMES[dow]} kaydedildi`);
      await fetchProfile();
      setExpandedDay(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kaydedilemedi');
    } finally {
      setSavingDay(null);
    }
  };

  const clearDay = async (dow) => {
    if (!confirm(`${DAY_NAMES[dow]} için tüm müsaitlikleri silmek istiyor musunuz?`)) return;
    try {
      await api.delete(`/availability/day/${dow}`);
      toast.success(`${DAY_NAMES[dow]} temizlendi`);
      setDraftHours([]);
      if (expandedDay === dow) setExpandedDay(null);
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Silinemedi');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          Müsaitlik
        </h1>
      </div>

      <Card className="p-5 mb-6">
        <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
          Haftanın her gününü açıp <strong style={{ color: 'rgb(var(--text-1))' }}>08:00–17:00</strong> arası
          saat bloklarından müsait olduklarınızı işaretleyin.
        </p>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="h-14 animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {DAY_ORDER.map((dow) => {
            const name = DAY_NAMES[dow];
            const count = hoursByDay.get(dow)?.length || 0;
            const isOpen = expandedDay === dow;
            return (
              <li key={dow}>
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => openDay(dow)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-400" />
                      )}
                      <span className="font-medium text-slate-900 dark:text-white">{name}</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                      {count > 0 ? `${count} blok seçili` : 'Kapalı'}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-0 border-t border-slate-200/80 dark:border-slate-700/80"
                      style={{ borderColor: 'rgba(var(--border))' }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                        {HOUR_BLOCKS.map((h) => {
                          const on = draftHours.includes(h);
                          return (
                            <label
                              key={h}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-[opacity,transform] duration-150 ${on
                                ? 'border-violet-500/50 bg-violet-500/10 dark:bg-violet-500/15'
                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggleHour(h)}
                                className="rounded border-slate-400 text-violet-600 focus:ring-violet-500"
                              />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {hourLabel(h)}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveDay(dow)}
                          disabled={savingDay === dow}
                        >
                          <Save className="w-4 h-4" />
                          {savingDay === dow ? 'Kaydediliyor…' : 'Kaydet'}
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => clearDay(dow)}>
                          <Trash2 className="w-4 h-4" />
                          Günü temizle
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !psychologistId && (
        <p className="text-sm text-rose-600 dark:text-rose-400 mt-4">Psikolog profili bulunamadı.</p>
      )}
    </div>
  );
};

export default AvailabilityPage;
