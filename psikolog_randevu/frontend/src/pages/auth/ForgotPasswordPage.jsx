import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Button, Card, Input } from '../../components/ui';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setDone(true);
      toast.success('İşlem tamamlandı. E-postanızı kontrol edin (geliştirmede bağlantı sunucu logunda).');
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'rgb(var(--text-1))' }}>
            Şifremi unuttum
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
            E-posta adresinize sıfırlama bağlantısı gönderilir.
          </p>
        </div>

        <Card className="p-6">
          {done ? (
            <p className="text-sm text-center" style={{ color: 'rgb(var(--text-2))' }}>
              Talebiniz alındı. Gelen kutunuzu ve spam klasörünü kontrol edin. Geliştirme ortamında bağlantı
              sunucu terminalinde loglanır.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">E-posta</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Gönderiliyor…' : 'Bağlantı gönder'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm mt-5" style={{ color: 'rgb(var(--text-2))' }}>
          <Link to="/giris" className="font-extrabold hover:underline" style={{ color: 'rgb(var(--accent))' }}>
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
