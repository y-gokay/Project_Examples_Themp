import React from 'react';
import './ServicesSection.css';

const ServicesSection = () => {
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
            )
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
            )
        },
        {
            icon: "fa-solid fa-palette",
            title: "Sergi ve Konferans",
            content: (
                <ul>
                    <li>Her ay farklı sanatçılara ev sahipliği yapan sergi salonu.</li>
                    <li>Seminer, konferans ve eğitim etkinlikleri için ücretsiz kullanım.</li>
                    <li>Sanatın ve bilginin buluşma noktası.</li>
                </ul>
            )
        },
        {
            icon: "fa-solid fa-shirt",
            title: "Ücretsiz Çamaşırhane",
            content: (
                <p>Yurtlarda kalan üniversite öğrencileri için ücretsiz kuru temizleme ve çamaşır yıkama hizmeti sunulmaktadır.</p>
            )
        },
        {
            icon: "fa-solid fa-wifi",
            title: "Sınırsız Ücretsiz İnternet",
            content: (
                <div>
                    <p>Merkezin tüm alanlarında hızlı ve sınırsız WiFi.</p>
                    <small>1. "Atakum Belediyesi" ağına bağlanın.<br />2. Formu doldurun.<br />3. Doğrulama kodunu girin.</small>
                </div>
            )
        },
        {
            icon: "fa-solid fa-id-card",
            title: "Genç Atakart",
            content: (
                <ul>
                    <li>Öğrenciler için özel avantaj kartı.</li>
                    <li>Restoran ve sosyal tesislerde indirim.</li>
                    <li>Ortaokuldan doktora düzeyine kadar tüm öğrenciler başvurabilir.</li>
                </ul>
            )
        },
        {
            icon: "fa-solid fa-utensils",
            title: "Kent Lokantası",
            content: (
                <p>Belediyemizin sosyal projesi: Kaliteli, doyurucu ve bütçe dostu 3 çeşit yemek hizmeti.</p>
            )
        }
    ];

    return (
        <section className="services-section">
            <div className="services-header text-center">
                <h2 className="section-title">Hizmetlerimiz</h2>
                <p className="section-subtitle">Hasan Ali Yücel Kültür ve Bilim Merkezi'nde Neler Var?</p>
            </div>

            <div className="info-cards-container">
                {/* Address & Hours Card - Highlighted */}
                <div className="info-card highlight-card">
                    <div className="info-icon">
                        <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <h3>İletişim & Saatler</h3>
                    <div className="info-content">
                        <p><strong>Adres:</strong> Cumhuriyet, 37. Sk. No:5, 55200 Atakum/Samsun</p>
                        <hr className="divider" />
                        <p><strong>Hizmet Saatleri:</strong></p>
                        <p>Her gün <span className="highlight-time">08:30 - 22:00</span> saatleri arasında açıktır.</p>
                    </div>
                </div>

                {/* Other Services */}
                {services.map((service, index) => (
                    <div className="info-card" key={index}>
                        <div className="info-icon">
                            <i className={service.icon}></i>
                        </div>
                        <h3>{service.title}</h3>
                        <div className="info-content">
                            {service.content}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServicesSection;
