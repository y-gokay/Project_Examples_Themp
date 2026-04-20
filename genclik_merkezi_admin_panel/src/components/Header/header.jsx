
import { useLocation, useNavigate } from 'react-router-dom';
import logoLight from '../../../public/belediyelogo.png';
import ataturkDark from '../../../public/ataturk-darkmode.png';
import adminAvatar from '../../../public/hasanaliyucel.png';
import "./header.css"
import { useSelector, useDispatch } from 'react-redux';
import { setLoggedStatus } from '../../redux/features/authSlice';

function Header() {

    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { logged } = useSelector(state => state.auth);

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(setLoggedStatus(false));
        navigate("/admin");
    };

    return (
        <header className="admin-header">

            <div className="admin-header__brand">
                <img src={logoLight} className="admin-header__logo" alt="Atakum Belediyesi Logo" />
                <div className="admin-header__divider" />
                <img src={ataturkDark} className="admin-header__ataturk" alt="Atatürk" />
                <div className="admin-header__divider" />
                <div className="admin-header__titles">
                    <span className="admin-header__title-main">Atakum Belediyesi</span>
                    <span className="admin-header__title-sub">Hasan Ali Yücel Kültür Merkezi — Yönetim Paneli</span>
                </div>
            </div>

            {logged && location.pathname.startsWith("/admin") && (
                <div className="admin-header__right">
                    <div className="admin-header__badge">
                        <img src={adminAvatar} className="admin-header__avatar" alt="Admin" />
                        <span className="admin-header__badge-name">Admin</span>
                    </div>
                    <button onClick={handleLogout} className="admin-header__logout">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Çıkış Yap
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;
