import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Card, Input } from "../../components/ui";

const DASHBOARD = {
  user: "/randevularim",
  psychologist: "/psikolog/panel",
  admin: "/admin",
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.identifier, form.password);
      toast.success("Giriş başarılı");
      navigate(DASHBOARD[user.role] || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden">
      {/* bg blob */}
      <div
        className="blob w-96 h-96 -top-20 -right-20 animate-float-slow pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(42,168,165,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <h1
            className="font-display font-bold text-3xl mb-1"
            style={{ color: "rgb(var(--text-1))" }}
          >
            Hoş Geldiniz
          </h1>
          <p className="text-sm" style={{ color: "rgb(var(--text-2))" }}>
            Hesabınıza giriş yaparak randevularınızı yönetin.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-posta veya Telefon</label>
              <Input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="ornek@mail.com"
                required
                autoFocus
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="label !mb-0">Şifre</label>
                <Link
                  to="/sifremi-unuttum"
                  className="text-[11px] font-bold hover:underline"
                  style={{ color: "rgb(var(--accent))" }}
                >
                  Şifremi unuttum
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Button>
          </form>
        </Card>

        <p
          className="text-center text-sm mt-5"
          style={{ color: "rgb(var(--text-2))" }}
        >
          Hesabın yok mu?{" "}
          <Link
            to="/kayit"
            className="font-extrabold hover:underline"
            style={{ color: "rgb(var(--accent))" }}
          >
            Ücretsiz kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
