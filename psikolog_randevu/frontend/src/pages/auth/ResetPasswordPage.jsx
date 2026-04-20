import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Button, Card, Input } from '../../components/ui';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('Şifre en az bir harf ve bir rakam içermelidir.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Şifreniz güncellendi');
      navigate('/giris');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bağlantı geçersiz veya süresi dolmuş');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'rgb(var(--text-1))' }}>
            Yeni şifre
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
            Hesabınız için yeni bir şifre belirleyin.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Yeni şifre</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 8 karakter (harf + rakam)"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={loading || !token} className="w-full">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Kaydediliyor…' : 'Şifreyi kaydet'}
            </Button>
          </form>
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

export default ResetPasswordPage;
