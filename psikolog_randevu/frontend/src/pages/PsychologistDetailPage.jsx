import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, ShieldCheck, AlertCircle, Loader2, GraduationCap, FileText, BookOpen, Sparkles } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button, Card, Textarea } from '../components/ui';
import { absoluteUrl } from '../lib/markdown';

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getNext14Days() {
  const today = new Date();
  const days = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0=Sun
    const idx = dow === 0 ? 6 : dow - 1;
    days.push({ date: d, dayLabel: DAYS_SHORT[idx], num: d.getDate(), iso: d.toISOString().split('T')[0] });
  }
  return days;
}

function StepIndicator({ step }) {
  const labels = ['Tarih & Saat', 'Onay'];
  return (
    <div className="flex mb-7">
      {labels.map((lbl, i) => (
        <div key={lbl} className="flex-1 flex flex-col items-center relative">
          {i < labels.length - 1 && (
            <div
              className="absolute top-3.5 left-1/2 w-full h-0.5"
              style={{ background: step > i ? 'rgb(var(--accent))' : 'rgba(var(--border-subtle))' }}
            />
          )}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold z-10 border-2 transition"
            style={
              step > i
                ? { background: '#3baf6a', borderColor: '#3baf6a', color: 'white' }
                : step === i
                ? { background: 'rgb(var(--accent))', borderColor: 'rgb(var(--accent))', color: 'white' }
                : { background: 'rgb(var(--bg-elev))', borderColor: 'rgba(var(--border-subtle))', color: 'rgb(var(--text-muted))' }
            }
          >
            {step > i ? '✓' : i + 1}
          </div>
          <div
            className="text-[10px] font-extrabold mt-1.5 uppercase tracking-wide"
            style={{ color: step === i ? 'rgb(var(--accent))' : 'rgb(var(--text-muted))' }}
          >
            {lbl}
          </div>
        </div>
      ))}
    </div>
  );
}

const PsychologistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [psychologist, setPsychologist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selDay, setSelDay] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selTime, setSelTime] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const weekDays = getNext14Days();

  useEffect(() => {
    api.get(`/psychologists/${id}`)
      .then((res) => setPsychologist(res.data.data))
      .catch(() => { toast.error('Psikolog bulunamadı'); navigate('/psikologlar'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDaySelect = async (day) => {
    setSelDay(day);
    setSelTime(null);
    setSlots([]);
    setLoadingSlots(true);
    try {
      const res = await api.get(`/psychologists/${id}/slots?date=${day.iso}`);
      setSlots(res.data.data);
    } catch {
      toast.error('Saatler yüklenemedi');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!user) { navigate('/giris'); return; }
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        psychologistId: parseInt(id),
        date: selDay.iso,
        startTime: selTime.startTime,
        userNotes: userNotes.trim() || undefined,
      });
      toast.success('Randevu talebiniz gönderildi');
      navigate('/randevularim');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Randevu oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = selDay
    ? `${selDay.num} ${MONTHS[selDay.date.getMonth()]} ${selDay.date.getFullYear()}`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgb(var(--accent))' }} />
      </div>
    );
  }
  if (!psychologist) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Link
        to="/psikologlar"
        className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition"
        style={{ color: 'rgb(var(--text-secondary))' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tüm psikologlar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            {psychologist.avatarUrl ? (
              <img
                src={absoluteUrl(psychologist.avatarUrl)}
                alt={psychologist.user?.name}
                className="w-24 h-24 rounded-2xl object-cover mb-5"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-extrabold text-white mb-5"
                style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
              >
                {psychologist.user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <h1
              className="text-2xl font-extrabold leading-tight mb-2"
              style={{ color: 'rgb(var(--text-1))' }}
            >
              {psychologist.user?.name}
            </h1>
            {psychologist.title && (
              <p
                className="text-lg sm:text-xl font-extrabold leading-snug mb-3"
                style={{ color: 'rgb(var(--accent))' }}
              >
                {psychologist.title}
              </p>
            )}
            {Array.isArray(psychologist.specializations) && psychologist.specializations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {psychologist.specializations.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-extrabold"
                    style={{
                      background: 'rgba(var(--accent), 0.10)',
                      color: 'rgb(var(--accent))',
                    }}
                  >
                    {s}
                  </span>
                ))}
                {psychologist.specializations.length > 3 && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-extrabold"
                    style={{ background: 'rgba(var(--border))', color: 'rgb(var(--text-2))' }}
                  >
                    +{psychologist.specializations.length - 3} alan
                  </span>
                )}
              </div>
            ) : (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold mb-4"
                style={{
                  background: 'rgba(var(--accent), 0.10)',
                  color: 'rgb(var(--accent))',
                }}
              >
                Klinik Psikolog
              </span>
            )}
            <div
              className="flex items-center gap-2 text-xs font-bold pt-3 border-t"
              style={{ color: 'rgb(var(--text-2))', borderColor: 'rgba(var(--border))' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Onaylı uzman · Yüz yüze görüşme
            </div>
          </Card>

          {psychologist.bio && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(var(--accent), 0.10)',
                    color: 'rgb(var(--accent))',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h2
                  className="text-base font-extrabold"
                  style={{ color: 'rgb(var(--text-1))' }}
                >
                  Hakkımda
                </h2>
              </div>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'rgb(var(--text-2))' }}
              >
                {psychologist.bio}
              </p>
            </Card>
          )}

          {psychologist.educations?.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-muted))' }} />
                <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>
                  Eğitim
                </p>
              </div>
              <ul className="space-y-3">
                {psychologist.educations.map((e, idx) => (
                  <li key={idx} className="text-sm">
                    <div className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                      {e.school}
                    </div>
                    <div className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {[e.degree, e.field, e.year].filter(Boolean).join(' · ')}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {psychologist.documents?.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-muted))' }} />
                <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>
                  Belgeler
                </p>
              </div>
              <ul className="space-y-2">
                {psychologist.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={absoluteUrl(doc.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold hover:underline"
                      style={{ color: 'rgb(var(--accent))' }}
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {psychologist.recentPosts?.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-muted))' }} />
                <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>
                  Son yazıları
                </p>
              </div>
              <ul className="space-y-3">
                {psychologist.recentPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="text-sm font-bold hover:underline line-clamp-2"
                      style={{ color: 'rgb(var(--text-primary))' }}
                    >
                      {p.title}
                    </Link>
                    {p.excerpt && (
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {p.excerpt}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {psychologist.availabilities?.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5" style={{ color: 'rgb(var(--text-muted))' }} />
                <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>
                  Çalışma saatleri
                </p>
              </div>
              <ul className="space-y-2.5">
                {psychologist.availabilities.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                      {DAY_NAMES[a.dayOfWeek]}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {a.startTime?.substring(0, 5)}–{a.endTime?.substring(0, 5)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Booking */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>
                Randevu oluştur
              </h2>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                Tarih ve saat seçerek talebinizi gönderin. Psikolog onayından sonra randevunuz kesinleşir.
              </p>
            </div>

            {!user && (
              <div
                className="flex gap-2.5 p-3.5 mb-6 rounded-xl border"
                style={{
                  background: 'rgba(232,118,42,0.08)',
                  borderColor: 'rgba(232,118,42,0.25)',
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgb(var(--accent))' }} />
                <p className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                  Randevu almak için{' '}
                  <Link to="/giris" className="underline" style={{ color: 'rgb(var(--accent))' }}>giriş yapın</Link> veya{' '}
                  <Link to="/kayit" className="underline" style={{ color: 'rgb(var(--accent))' }}>kayıt olun</Link>.
                </p>
              </div>
            )}

            <StepIndicator step={step} />

            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <p
                    className="text-xs font-extrabold uppercase tracking-widest mb-3"
                    style={{ color: 'rgb(var(--text-muted))' }}
                  >
                    Tarih seçin
                  </p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((d) => (
                      <button
                        key={d.iso}
                        onClick={() => handleDaySelect(d)}
                        className="flex flex-col items-center justify-center aspect-square rounded-xl border-[1.5px] transition text-center"
                        style={
                          selDay?.iso === d.iso
                            ? { background: 'rgb(var(--accent))', borderColor: 'rgb(var(--accent))', color: 'white' }
                            : {
                                background: 'rgba(var(--bg-muted))',
                                borderColor: 'transparent',
                                color: 'rgb(var(--text-primary))',
                              }
                        }
                      >
                        <span className="text-[9px] font-extrabold uppercase" style={selDay?.iso === d.iso ? { color: 'rgba(255,255,255,0.75)' } : { color: 'rgb(var(--text-muted))' }}>
                          {d.dayLabel}
                        </span>
                        <span className="text-sm font-extrabold">{d.num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selDay && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>
                        Saat seçin
                      </p>
                      {loadingSlots && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'rgb(var(--text-muted))' }} />}
                    </div>
                    {!loadingSlots && slots.length === 0 ? (
                      <div
                        className="rounded-xl border border-dashed p-5 text-center text-sm font-bold"
                        style={{ borderColor: 'rgba(var(--border-subtle))', color: 'rgb(var(--text-muted))' }}
                      >
                        Bu tarihte uygun saat bulunmuyor.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.startTime}
                            onClick={() => setSelTime(slot)}
                            className="py-2.5 rounded-xl text-sm font-extrabold border-[1.5px] transition text-center"
                            style={
                              selTime?.startTime === slot.startTime
                                ? { background: 'rgb(var(--blue))', borderColor: 'rgb(var(--blue))', color: 'white' }
                                : {
                                    background: 'rgba(var(--bg-muted))',
                                    borderColor: 'transparent',
                                    color: 'rgb(var(--text-primary))',
                                  }
                            }
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    disabled={!selDay || !selTime}
                    onClick={() => setStep(1)}
                  >
                    Devam →
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Ön bilgi (opsiyonel)</label>
                  <Textarea
                    rows={4}
                    maxLength={2000}
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="İsteğe bağlı: başvuru nedeni, kısa özet veya psikoloğun bilmesini istediğiniz notlar (şifreli saklanmaz; yalnızca randevu kaydında tutulur)."
                    className="text-sm"
                  />
                  <p className="text-[10px] mt-1" style={{ color: 'rgb(var(--text-3))' }}>
                    {userNotes.length}/2000 — Gizli sağlık verisi içeriyorsa dikkatli yazın; detayları yüz yüze paylaşabilirsiniz.
                  </p>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(var(--bg-muted))' }}
                >
                  {[
                    ['Psikolog', psychologist.user?.name],
                    ['Tarih', formattedDate],
                    ['Saat', `${selTime?.startTime} – ${selTime?.endTime}`],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between items-center py-2 text-sm border-b last:border-0"
                      style={{ borderColor: 'rgba(var(--border-subtle))' }}
                    >
                      <span className="font-bold" style={{ color: 'rgb(var(--text-secondary))' }}>{k}</span>
                      <span className="font-extrabold" style={{ color: 'rgb(var(--text-primary))' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <p
                  className="text-xs leading-relaxed p-3.5 rounded-xl"
                  style={{
                    background: 'rgba(var(--bg-muted))',
                    color: 'rgb(var(--text-secondary))',
                  }}
                >
                  Randevunuz ücretsizdir; psikolog onayından sonra kesinleşir. İptal için görüşme saatinden en az 2 saat
                  öncesine kadar &quot;Randevularım&quot; üzerinden iptal edebilirsiniz.
                </p>

                <div className="flex justify-between pt-1">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    ← Geri
                  </Button>
                  <Button onClick={handleBook} disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Gönderiliyor' : !user ? 'Giriş yap' : 'Randevuyu Onayla ✓'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PsychologistDetailPage;
