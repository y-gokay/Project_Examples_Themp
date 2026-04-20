import { useState } from "react";
import "./login.css"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { errorToast, successToast } from "../../../helpers/toast";
import { login } from "../../../redux/actions/authActions";
import logoDark from '../../../../public/belediyelogo.png';

function LoginPage() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUsernameChange = (e) => setUsername(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(login({
            email: username,
            password: password
        })).then((res) => {
            setLoading(false);
            if (res.payload.success == 1) {
                successToast("Başarıyla giriş yapıldı.")
                navigate("/admin/anasayfa")
            } else {
                errorToast(res.payload.message)
            }
        }).catch(() => {
            setLoading(false);
        });
    };

    return (
        <div className="login-root">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logos">
                        <img src={logoDark} className="login-logo" alt="Atakum Belediyesi" />
                    </div>
                    <div className="login-title">Atakum Belediyesi</div>
                    <div className="login-subtitle">Hasan Ali Yücel Kültür Merkezi — Yönetim Paneli</div>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-input-group">
                        <span className="login-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </span>
                        <input
                            className="login-input"
                            placeholder="Admin E-posta"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            autoComplete="username"
                        />
                    </div>
                    <div className="login-input-group">
                        <span className="login-input-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </span>
                        <input
                            className="login-input"
                            placeholder="Şifre"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            autoComplete="current-password"
                        />
                    </div>
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>

                <div className="login-footer">
                    © {new Date().getFullYear()} Atakum Belediyesi — Tüm hakları saklıdır
                </div>
            </div>
        </div>
    );
}

export default LoginPage;