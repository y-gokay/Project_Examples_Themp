import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text-content">
          <div className="hero-badge">Rehberiniz Kitaplar Olsun</div>
          <h1 className="hero-title">
            Hasan Ali Yücel <br />
            <span className="highlight-text">Kültür Merkezi</span>
          </h1>
          <p className="hero-description">
            Binlerce kitap, sessiz çalışma alanları ve kültürel etkinliklerle
            bilgiye ulaşmanın en keyifli yolu.
          </p>
          <div className="hero-buttons">
            <button
              className="btn-hero-primary"
              onClick={() => navigate("/kitaplar")}
            >
              Kütüphaneyi Keşfet
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => navigate("/duyurular")}
            >
              Etkinlikler
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-container">
            {/* <video
              ref={bgVideoRef}
              className="hero-main-video"
              src="/HasanAli/haytanıtımreeelsi_lq.mp4"
              autoPlay
              muted
              loop
              playsInline
            /> */}
            <img
              src="/hasanaliyucel.jpg"
              alt="Hasan Ali Yücel Kültür ve Bilim Merkezi"
              className="hero-main-img"
            />
          </div>
          {/*           <div className="hero-overlay-card">
            <i className="fa-solid fa-book-open"></i>
            <span>Her gün yeni kitaplar</span>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
