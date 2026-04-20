import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components/ui';

const AccountPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pw, setPw] = useState({ current: '', next: '', next2: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (profile.name !== user.name) payload.name = profile.name.trim();
      if ((profile.phone || '') !== (user.phone || '')) {
        payload.phone = profile.phone.replace(/\s/g, '') || '';
      }
      if (Object.keys(payload).length === 0) {
        toast('Değişiklik yok');
        return;
      }
      await updateProfile(payload);
      toast.success('Profil güncellendi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Güncellenemedi');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.next2) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    if (pw.next.length < 8) {
      toast.error('Yeni şifre en az 8 karakter olmalıdır');
      return;
    }
    if (!/[a-zA-Z]/.test(pw.next) || !/[0-9]/.test(pw.next)) {
      toast.error('Yeni şifre en az bir harf ve bir rakam içermelidir');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pw.current, pw.next);
      toast.success('Şifre değiştirildi');
      setPw({ current: '', next: '', next2: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Şifre değiştirilemedi');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="relative z-[1] max-w-lg mx-auto px-5 py-10 pb-16">
      <span className="section-tag">Hesap</span>
      <h1 className="font-display font-semibold text-3xl mb-2" style={{ color: 'rgb(var(--text-1))' }}>
        Hesabım
      </h1>
      <p className="text-sm font-light mb-8" style={{ color: 'rgb(var(--text-2))' }}>
        Profil bilgilerinizi ve şifrenizi güncelleyin.
      </p>

      <Card className="p-6 mb-6">
        <h2 className="font-bold text-sm mb-4" style={{ color: 'rgb(var(--text-1))' }}>
          Profil
        </h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">E-posta</label>
            <Input value={user?.email || ''} disabled className="opacity-70 cursor-not-allowed" />
            <p className="text-[11px] mt-1" style={{ color: 'rgb(var(--text-3))' }}>
              E-posta değişikliği için kurum ile iletişime geçin.
            </p>
          </div>
          <div>
            <label className="label">Ad Soyad</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Telefon</label>
            <Input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="05XX XXX XX XX"
            />
          </div>
          <Button type="submit" disabled={savingProfile} className="w-full">
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            {savingProfile ? 'Kaydediliyor…' : 'Profili kaydet'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-sm mb-4" style={{ color: 'rgb(var(--text-1))' }}>
          Şifre değiştir
        </h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="label">Mevcut şifre</label>
            <Input
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Yeni şifre</label>
            <Input
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="label">Yeni şifre (tekrar)</label>
            <Input
              type="password"
              value={pw.next2}
              onChange={(e) => setPw((p) => ({ ...p, next2: e.target.value }))}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" disabled={savingPw} className="w-full">
            {savingPw && <Loader2 className="w-4 h-4 animate-spin" />}
            {savingPw ? 'Kaydediliyor…' : 'Şifreyi güncelle'}
          </Button>
        </form>
      </Card>

      <p className="text-center mt-8">
        <Link to="/randevularim" className="text-sm font-bold hover:underline" style={{ color: 'rgb(var(--accent))' }}>
          ← Randevularıma dön
        </Link>
      </p>
    </div>
  );
};

export default AccountPage;
