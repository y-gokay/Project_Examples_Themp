import { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Users, Calendar, UserPlus, Trash2 } from 'lucide-react';
import { Card, Button, Tabs, Badge, Input } from '../../components/ui';
import { STATUS_LABEL, STATUS_TONE } from '../../lib/appointmentStatus';

const ROLE_LABEL = { user: 'Vatandaş', psychologist: 'Psikolog', admin: 'Admin' };

const ROLE_BADGE = {
  user: { bg: 'rgba(26, 92, 154, 0.12)', color: 'rgb(var(--brand-blue))', border: 'rgba(26, 92, 154, 0.22)' },
  psychologist: {
    bg: 'rgba(var(--accent), 0.12)',
    color: 'rgb(var(--accent))',
    border: 'rgba(var(--accent), 0.25)',
  },
  admin: { bg: 'rgba(161, 98, 7, 0.12)', color: '#a16207', border: 'rgba(161, 98, 7, 0.25)' },
};

const TABS = [
  { value: 'users', label: 'Kullanıcılar' },
  { value: 'appointments', label: 'Randevular' },
  { value: 'addPsychologist', label: '+ Psikolog' },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', specialization: '' });
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([api.get('/admin/users'), api.get('/appointments')]);
      setUsers(u.data.data);
      setAppointments(a.data.data);
    } catch {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Kullanıcı silindi');
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Silinemedi');
    }
  };

  const handleAddPsychologist = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const { specialization, ...rest } = addForm;
      const specializations = specialization
        ? specialization.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 10)
        : [];
      await api.post('/psychologists', { ...rest, specializations });
      toast.success('Psikolog eklendi');
      setAddForm({ name: '', email: '', password: '', specialization: '' });
      fetchData();
      setTab('users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi');
    } finally {
      setAddLoading(false);
    }
  };

  const stats = [
    {
      label: 'Vatandaş',
      value: users.filter((u) => u.role === 'user').length,
      icon: Users,
      iconBg: 'rgba(var(--brand-blue), 0.12)',
      iconColor: 'rgb(var(--brand-blue))',
    },
    {
      label: 'Psikolog',
      value: users.filter((u) => u.role === 'psychologist').length,
      icon: Users,
      iconBg: 'rgba(var(--accent), 0.12)',
      iconColor: 'rgb(var(--accent))',
    },
    {
      label: 'Randevu',
      value: appointments.length,
      icon: Calendar,
      iconBg: 'rgba(var(--sage), 0.12)',
      iconColor: 'rgb(var(--sage))',
    },
    {
      label: 'Onay Bekleyen',
      value: appointments.filter((a) => a.status === 'pending').length,
      icon: Calendar,
      iconBg: 'rgba(var(--accent-2), 0.12)',
      iconColor: 'rgb(var(--accent-2))',
    },
  ];

  return (
    <div className="relative z-[1] max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-10 pb-16">
      <header className="mb-10">
        <span className="section-tag">Yönetim</span>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight" style={{ color: 'rgb(var(--text-1))' }}>
          Admin Paneli
        </h1>
        <p className="mt-2 text-[15px] font-light max-w-xl" style={{ color: 'rgb(var(--text-2))' }}>
          Kullanıcıları ve randevuları görüntüleyin, yeni psikolog hesabı oluşturun.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 sm:p-5 text-left hover:shadow-lift transition-shadow duration-300">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--text-3))' }}>
                  {s.label}
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.iconColor }} />
                </div>
              </div>
              <p className="font-display text-3xl sm:text-4xl font-bold tabular-nums leading-none" style={{ color: 'rgb(var(--text-1))' }}>
                {s.value}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mb-8">
        <Tabs tabs={TABS} value={tab} onChange={setTab} className="w-full sm:w-auto" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {tab === 'users' && (
            <div className="space-y-2">
              {users.length === 0 ? (
                <Card className="py-14 text-center text-sm font-light" style={{ color: 'rgb(var(--text-2))' }}>
                  Kayıtlı kullanıcı yok.
                </Card>
              ) : (
                users.map((u) => {
                  const rb = ROLE_BADGE[u.role] || ROLE_BADGE.user;
                  return (
                    <Card key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
                        >
                          {(u.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'rgb(var(--text-1))' }}>
                            {u.name}
                          </p>
                          <p className="text-xs truncate font-light" style={{ color: 'rgb(var(--text-3))' }}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full border"
                          style={{ background: rb.bg, color: rb.color, borderColor: rb.border }}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: '#dc2626' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Sil
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {tab === 'appointments' && (
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <Card className="py-14 text-center text-sm font-light" style={{ color: 'rgb(var(--text-2))' }}>
                  Henüz randevu yok.
                </Card>
              ) : (
                appointments.map((apt) => (
                  <Card key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-1))' }}>
                        <span className="truncate">{apt.user?.name}</span>
                        <span className="mx-2 font-normal" style={{ color: 'rgb(var(--text-3))' }}>
                          →
                        </span>
                        <span className="truncate">{apt.psychologist?.user?.name}</span>
                      </p>
                      <p className="text-xs mt-1 font-light" style={{ color: 'rgb(var(--text-2))' }}>
                        {apt.date} · {apt.startTime?.substring(0, 5)} – {apt.endTime?.substring(0, 5)}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[apt.status] || 'neutral'}>{STATUS_LABEL[apt.status] || apt.status}</Badge>
                  </Card>
                ))
              )}
            </div>
          )}

          {tab === 'addPsychologist' && (
            <Card className="p-6 sm:p-8 max-w-lg">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(var(--accent), 0.12)', color: 'rgb(var(--accent))' }}
                >
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-xl" style={{ color: 'rgb(var(--text-1))' }}>
                    Yeni Psikolog Ekle
                  </h2>
                  <p className="text-xs font-light mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>
                    Sistemde psikolog rolüyle kullanıcı oluşturulur.
                  </p>
                </div>
              </div>
              <form onSubmit={handleAddPsychologist} className="space-y-4">
                {[
                  { name: 'name', label: 'Ad Soyad', type: 'text', placeholder: 'Dr. Ad Soyad' },
                  { name: 'email', label: 'E-posta', type: 'email', placeholder: 'psikolog@ornek.com' },
                  { name: 'password', label: 'Şifre', type: 'password', placeholder: 'En az 6 karakter' },
                  { name: 'specialization', label: 'Çalışma Alanları (Opsiyonel)', type: 'text', placeholder: 'BDT, Aile Terapisi, virgülle ayırın' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="label" htmlFor={`add-${f.name}`}>
                      {f.label}
                    </label>
                    <Input
                      id={`add-${f.name}`}
                      type={f.type}
                      value={addForm[f.name]}
                      onChange={(e) => setAddForm({ ...addForm, [f.name]: e.target.value })}
                      placeholder={f.placeholder}
                      required={f.name !== 'specialization'}
                    />
                  </div>
                ))}
                <Button type="submit" variant="primary" className="w-full mt-2" size="lg" disabled={addLoading}>
                  {addLoading ? 'Ekleniyor...' : 'Psikolog Ekle'}
                </Button>
              </form>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
