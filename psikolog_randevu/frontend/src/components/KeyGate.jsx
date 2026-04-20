import { useState } from 'react';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck } from 'lucide-react';
import { Button, Dialog, Input, EmptyState } from './ui';
import { useCryptoKeys } from '../context/KeyContext';

const KeyGate = ({ children }) => {
  const { status, setup, unlock } = useCryptoKeys();
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-500">
        Anahtar durumu kontrol ediliyor…
      </div>
    );
  }

  if (status === 'unlocked') return children;

  const handleSetup = async (e) => {
    e.preventDefault();
    if (passphrase.length < 8) return toast.error('En az 8 karakter girin');
    if (passphrase !== confirmPassphrase) return toast.error('Şifreler eşleşmiyor');
    setSubmitting(true);
    try {
      await setup(passphrase);
      toast.success('Anahtar oluşturuldu. Bu şifreyi güvenli bir yerde saklayın.');
      setPassphrase('');
      setConfirmPassphrase('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Anahtar oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await unlock(passphrase);
      setPassphrase('');
    } catch {
      toast.error('Şifre yanlış veya anahtar çözülemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'missing') {
    return (
      <EmptyState
        icon={<ShieldCheck className="w-7 h-7" />}
        title="Şifreleme anahtarınızı oluşturun"
        description="Hasta notlarınız uçtan uca şifrelenir. Bu şifre yalnızca sizde kalır; unutursanız eski notlar kurtarılamaz."
        action={
          <form onSubmit={handleSetup} className="flex flex-col gap-3 w-full max-w-sm">
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Güçlü bir şifre (min 8 karakter)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Şifreyi tekrar girin"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Oluşturuluyor…' : 'Anahtarı Oluştur'}
            </Button>
          </form>
        }
      />
    );
  }

  // locked
  return (
    <EmptyState
      icon={<Lock className="w-7 h-7" />}
      title="Notları açmak için şifrenizi girin"
      description="Şifreniz tarayıcıdan çıkmaz. Her oturumda bir kez sorulur."
      action={
        <form onSubmit={handleUnlock} className="flex flex-col gap-3 w-full max-w-sm">
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Şifreleme şifreniz"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Açılıyor…' : 'Aç'}
          </Button>
        </form>
      }
    />
  );
};

export default KeyGate;
