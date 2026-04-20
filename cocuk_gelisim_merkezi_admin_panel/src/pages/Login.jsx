import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { setToken, isAuthenticated } from '../services/auth';
import logo from '../assets/atakum-logo_darkmode.png';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setUsername('');
                setPassword('');
                setError('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await adminAPI.login(username, password);
            setToken(data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Giriş başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-8 flex flex-col items-center">
                    <img src={logo} alt="Atakum Logo" className="h-24 w-auto object-contain mb-4" />
                    <h1 className="text-2xl font-bold text-white tracking-tight">Çocuk Gelişim Merkezi Admin Paneli</h1>
                    <p className="text-slate-400 text-sm mt-1">Lütfen giriş yapınız</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Kullanıcı adınızı giriniz"
                                autoComplete="username"
                                aria-invalid={!!error}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Şifre
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Şifrenizi giriniz"
                                autoComplete="current-password"
                                aria-invalid={!!error}
                                aria-describedby={error ? 'login-error' : undefined}
                            />
                        </div>

                        {error && (
                            <div
                                id="login-error"
                                className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2"
                                role="alert"
                                aria-live="assertive"
                            >
                                <span className="font-bold">Hata:</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
