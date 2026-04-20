import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
import hasanAliLogo from "../../../public/HasanAli/HasanAliYucelNoBg.png";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logos">
            <img
              src="/belediyelogo_darkmode.png"
              alt="Atakum Belediyesi"
              className="footer-logo footer-logo-belediye"
            />
            <img
              src={hasanAliLogo}
              alt="Hasan Ali Yücel Kültür ve Bilim Merkezi"
              className="footer-logo footer-logo-hasanali"
            />
          </div>
          <div className="footer-brand-text">
            <h3>Atakum Belediyesi</h3>
            <h3>Hasan Ali Yücel</h3>
            <p>Kültür ve Bilim Merkezi</p>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Hızlı Erişim</h4>
          <ul>
            <li onClick={() => navigate("/")}>Ana Sayfa</li>
            <li onClick={() => navigate("/kitaplar")}>Kitaplar</li>
            <li onClick={() => navigate("/duyurular")}>Duyurular</li>
            <li onClick={() => navigate("/giris")}>Giriş Yap</li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Atakum Belediyesi İletişim</h4>
          <ul>
            <li>
              <i className="fa-solid fa-location-dot"></i> Mimarsinan Mah. İsmet
              İnönü Blv. No:114 Atakum/Samsun
            </li>
            <li>
              <i className="fa-solid fa-phone"></i> 444 40 55
            </li>
            <li>
              <i className="fa-solid fa-envelope"></i> bilgi@atakum.bel.tr
            </li>
          </ul>
        </div>

        <div className="footer-social">
          <h4>Bizi Takip Edin</h4>
          <div className="social-icons">
            <a href="https://www.atakum.bel.tr" className="social-icon">
              <i className="fa-solid fa-globe"></i>
            </a>
            <a
              href="https://www.facebook.com/atakumbeltr/?locale=tr_TR"
              className="social-icon"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://x.com/atakumbeltr" className="social-icon">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a
              href="https://www.instagram.com/atakumbeltr/"
              className="social-icon"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Atakum Belediyesi Bilgi İşlem
          Müdürlüğü tarafından hazırlanmıştır.
        </p>
        {/*                 <div className="footer-bottom-links">
                    <span>Gizlilik Politikası</span>
                    <span>Kullanım Şartları</span>
                </div> */}
      </div>
    </footer>
  );
};

export default Footer;
