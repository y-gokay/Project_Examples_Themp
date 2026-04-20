import { useState } from "react";
import "./login.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { errorToast, successToast } from "../../../helpers/toast";
import { login, loginUser } from "../../../redux/actions/authActions";

import icon from "../../../../public/HasanAli/HasanAliYucelNoBg.png"; // Use new logo

function LoginPageUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      loginUser({
        tc: username,
        password: password,
      }),
    ).then((res) => {
      if (res.payload.success == 1) {
        successToast("Başarıyla giriş yapıldı.");
        navigate("/profil");
      } else {
        errorToast(res.payload.message);
      }
    });
  };

  return (
    <div className="auth-container backgroundroot">
      <div className="auth-card">
        <img src={icon} alt="Logo" className="auth-logo" />
        <h2 className="auth-title">Hoş Geldiniz</h2>
        <p className="auth-subtitle">
          Kütüphane hizmetlerine erişmek için giriş yapın
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="modern-input"
              placeholder="TC Kimlik Numarası"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="modern-input"
              placeholder="Şifre"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className="auth-btn">
            Giriş Yap
          </button>
        </form>

        <div className="auth-footer-link" style={{ cursor: "default" }}>
          <span style={{ fontWeight: 500 }}>
            Kayıt işlemleri Hasan Ali Yücel Kültür ve Bilim Merkezi'nde yapılmaktadır.
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPageUser;
