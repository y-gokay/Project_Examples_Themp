import React, { useEffect, useState } from "react";
import "./ServicesPage.css";

const ServicesPage = () => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalImages = 7;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImgIndex === null) return;
      if (e.key === "Escape") setSelectedImgIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImgIndex]);

  const handleNext = () => {
    setSelectedImgIndex((prev) => (prev + 1) % totalImages);
  };

  const handlePrev = () => {
    setSelectedImgIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const services = [
    {
      icon: "fa-solid fa-book-open-reader",
      title: "Kütüphane",
      content: (
        <ul>
          <li>135 kişilik konforlu oturma alanı ve zengin kitap arşivi.</li>
          <li>30 gün süreyle 2 kitap ödünç alma imkanı.</li>
          <li>Günlük 20 sayfa ücretsiz siyah-beyaz fotokopi.</li>
          <li>Sınava hazırlananlara ücretsiz kaynak desteği.</li>
        </ul>
      ),
    },
    {
      icon: "fa-solid fa-certificate",
      title: "Meslek Kursları",
      content: (
        <ul>
          <li>Ücretsiz MEB onaylı sertifikalı meslek kursları.</li>
          <li>İstihdama yönelik farklı yaş gruplarına uygun eğitimler.</li>
          <li>E-Devlet üzerinden sertifika görüntüleme imkanı.</li>
        </ul>
      ),
    },
    {
      icon: "fa-solid fa-palette",
      title: "Sergi ve Konferans",
      content: (
        <ul>
          <li>Her ay farklı sanatçılara ev sahipliği yapan sergi salonu.</li>
          <li>
            Seminer, konferans ve eğitim etkinlikleri için ücretsiz kullanım.
          </li>
          <li>Sanatın ve bilginin buluşma noktası.</li>
        </ul>
      ),
    },
    {
      icon: "fa-solid fa-shirt",
      title: "Ücretsiz Çamaşırhane",
      content: (
        <p>
          Yurtlarda kalan üniversite öğrencileri için ücretsiz kuru temizleme ve
          çamaşır yıkama hizmeti sunulmaktadır.
        </p>
      ),
    },
    {
      icon: "fa-solid fa-wifi",
      title: "Sınırsız Ücretsiz İnternet",
      content: (
        <div>
          <p>Merkezin tüm alanlarında hızlı ve sınırsız WiFi.</p>
          <small>
            1. "Atakum Belediyesi" ağına bağlanın.
            <br />
            2. Formu doldurun.
            <br />
            3. Doğrulama kodunu girin.
          </small>
        </div>
      ),
    },
    {
      icon: "fa-solid fa-id-card",
      title: "Genç Atakart",
      content: (
        <ul>
          <li>Öğrenciler için özel avantaj kartı.</li>
          <li>Restoran ve sosyal tesislerde indirim.</li>
          <li>
            Ortaokuldan doktora düzeyine kadar tüm öğrenciler başvurabilir.
          </li>
        </ul>
      ),
    },
    {
      icon: "fa-solid fa-utensils",
      title: "Kent Lokantası",
      content: (
        <p>
          Belediyemizin sosyal projesi: Kaliteli, doyurucu ve bütçe dostu 3
          çeşit yemek hizmeti.
        </p>
      ),
    },
  ];

  return (
    <div className="services-page">
      <div className="page-header">
        <h1 className="page-title">Hizmetlerimiz</h1>
        <p className="page-subtitle">
          Hasan Ali Yücel Kültür ve Bilim Merkezi olarak sunduğumuz tüm
          imkanlar.
        </p>
      </div>

      <div className="services-container">
        {/* Address & Hours Card - Highlighted */}
        <div className="info-card highlight-card">
          <div className="info-icon">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          <h3>İletişim & Saatler</h3>
          <div className="info-content">
            <p>
              <strong>Adres:</strong> Cumhuriyet, 37. Sk. No:5, 55200
              Atakum/Samsun
            </p>
            <hr className="divider" />
            <p>
              <strong>Hizmet Saatleri:</strong>
            </p>
            <p>
              Her gün <span className="highlight-time">08:30 - 22:00</span>{" "}
              saatleri arasında açıktır.
            </p>
          </div>
        </div>

        {/* Other Services */}
        {services.map((service, index) => (
          <div className="info-card" key={index}>
            <div className="info-icon">
              <i className={service.icon}></i>
            </div>
            <h3>{service.title}</h3>
            <div className="info-content">{service.content}</div>
          </div>
        ))}
      </div>

      {/* Gallery Section */}
      <div className="gallery-section">
        <h2
          className="section-title"
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            marginTop: "3rem",
          }}
        >
          Görseller
        </h2>
        <div className="gallery-grid">
          {Array.from({ length: totalImages }, (_, i) => (
            <div
              className="gallery-item"
              key={i}
              onClick={() => setSelectedImgIndex(i)}
            >
              <img
                src={`/HasanAli/img_${i + 1}.jpeg`}
                alt={`Görsel ${i + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImgIndex !== null && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImgIndex(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setSelectedImgIndex(null)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/HasanAli/img_${selectedImgIndex + 1}.jpeg`}
              alt={`Görsel ${selectedImgIndex + 1}`}
            />
            <div className="lightbox-counter">
              {selectedImgIndex + 1} / {totalImages}
            </div>
          </div>

          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Padding bottom for footer */}
      <div style={{ height: "4rem" }}></div>
    </div>
  );
};

export default ServicesPage;
