import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../../components/ui';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      toast.error('Şifre en az bir harf ve bir rakam içermelidir.');
      return;
    }
    if (!kvkkAccepted) {
      toast.error('KVKK Aydınlatma Metni ve açık rıza onayını işaretlemeniz gerekir.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password, kvkkAccepted);
      toast.success('Hesabın oluşturuldu');
      navigate('/randevularim');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden">
      {/* bg blob */}
      <div
        className="blob w-96 h-96 -bottom-20 -left-20 animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,109,171,0.12) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-widest mb-4"
            style={{
              background: 'rgba(var(--accent-2), 0.08)',
              borderColor: 'rgba(var(--accent-2), 0.20)',
              color: 'rgb(var(--accent-2))',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'rgb(var(--sage))' }} />
            Ücretsiz Kayıt
          </div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'rgb(var(--text-1))' }}>
            Hesap Oluştur
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
            Saniyeler içinde randevu almaya başlayın.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ad Soyad</label>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Adınız Soyadınız"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">E-posta</label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ornek@mail.com"
                required
              />
            </div>
            <div>
              <label className="label">
                Telefon <span className="normal-case font-normal text-[10px]">(opsiyonel)</span>
              </label>
              <Input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="05XX XXX XX XX"
              />
            </div>
            <div>
              <label className="label">Şifre</label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="En az 8 karakter (harf + rakam)"
                required
                minLength="8"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-sm leading-snug">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                className="mt-1 rounded border shrink-0"
                style={{ accentColor: 'rgb(var(--accent))' }}
              />
              <span style={{ color: 'rgb(var(--text-2))' }}>
                <Link to="/kvkk" className="font-bold underline" style={{ color: 'rgb(var(--accent))' }} target="_blank" rel="noopener noreferrer">
                  Aydınlatma Metni ve Açık Rıza Beyanı
                </Link>
                &apos;nı okudum, kişisel verilerimin belirtilen amaçlarla işlenmesini kabul ediyorum.
              </span>
            </label>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Oluşturuluyor…' : 'Ücretsiz Kayıt Ol'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm mt-5" style={{ color: 'rgb(var(--text-2))' }}>
          Zaten hesabın var mı?{' '}
          <Link
            to="/giris"
            className="font-extrabold hover:underline"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
