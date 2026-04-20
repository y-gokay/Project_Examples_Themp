import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, X, CalendarDays, Plus } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, Card, EmptyState } from '../../components/ui';
import { resolveAppointmentDisplay, isCompletedVirtual } from '../../lib/appointmentDisplay';
import { canCitizenCancelAppointment } from '../../lib/appointmentPolicy';

const UserDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/me');
      setAppointments(res.data.data);
    } catch {
      toast.error('Randevular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Randevu iptal edildi');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'İptal başarısız');
    }
  };

  const active = appointments.filter(
    (a) =>
      ['pending', 'approved'].includes(a.status) && !isCompletedVirtual(a)
  );
  const past = appointments.filter(
    (a) =>
      ['rejected', 'cancelled'].includes(a.status) || isCompletedVirtual(a)
  );

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Card className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold flex items-center justify-center text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                Randevularım
              </p>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                Hoş geldin, {user?.name}
              </h1>
            </div>
          </div>
          <Link to="/psikologlar">
            <Button>
              <Plus className="w-4 h-4" /> Yeni Randevu
            </Button>
          </Link>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-24 animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <EmptyState
              icon={<CalendarDays className="w-7 h-7" />}
              title="Henüz randevunuz yok"
              description="Uzman psikologlardan birini seçerek ilk randevunuzu oluşturabilirsiniz."
              action={
                <Link to="/psikologlar">
                  <Button>Psikologları İncele</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Aktif / Bekleyen
                </h2>
                <div className="space-y-3">
                  {active.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      apt={apt}
                      onCancel={handleCancel}
                      cancellable={canCitizenCancelAppointment(apt)}
                    />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Geçmiş
                </h2>
                <div className="space-y-3 opacity-80">
                  {past.map((apt) => (
                    <AppointmentCard key={apt.id} apt={apt} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AppointmentCard = ({ apt, onCancel, cancellable }) => {
  const disp = resolveAppointmentDisplay(apt);
  const showLateCancel =
    !cancellable && onCancel && (apt.status === 'pending' || apt.status === 'approved');
  return (
  <Card className="p-4 sm:p-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center flex-shrink-0">
          {apt.psychologist?.user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
            {apt.psychologist?.user?.name}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(apt.date).toLocaleDateString('tr-TR')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {apt.startTime?.substring(0, 5)} – {apt.endTime?.substring(0, 5)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={disp.tone}>{disp.label}</Badge>
        {cancellable && (apt.status === 'pending' || apt.status === 'approved') && (
          <Button size="sm" variant="ghost" onClick={() => onCancel(apt.id)}>
            <X className="w-4 h-4" /> İptal
          </Button>
        )}
      </div>
    </div>
    {showLateCancel && (
      <p className="mt-2 text-[11px]" style={{ color: 'rgb(var(--text-3))' }}>
        Görüşme saatine 2 saatten az kaldığı için iptal buradan yapılamaz; acil durumda{' '}
        <span style={{ color: 'rgb(var(--accent))' }}>444 40 12</span> hattını arayabilirsiniz.
      </p>
    )}
    {apt.status === 'rejected' && apt.rejectionReason && (
      <p className="mt-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 rounded-lg px-3 py-2">
        Ret sebebi: {apt.rejectionReason}
      </p>
    )}
  </Card>
  );
};

export default UserDashboard;
