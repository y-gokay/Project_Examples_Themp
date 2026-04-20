import React from 'react';
import './QuoteSection.css';

const QuoteSection = () => {
    return (
        <section className="quote-section">
            <div className="quote-container">
                <div className="quote-content">
                    <div className="quote-icon">
                        <i className="fa-solid fa-quote-left"></i>
                    </div>
                    <blockquote className="quote-text">
                        "Ben çocukken yoksuldum. İki kuruş elime geçince bunun bir kuruşunu kitaba verirdim.
                        Eğer böyle olmasaydım, bu yaptıklarımın hiç birisini yapamazdım."
                    </blockquote>
                    <div className="quote-author">
                        <span className="author-name">Mustafa Kemal Atatürk</span>
                        <span className="author-title">Türkiye Cumhuriyeti Kurucusu</span>
                    </div>
                </div>
                <div className="quote-image-wrapper">
                    {/* Using the darkmode image as it likely fits better on a dark/premium section, or standard based on design */}
                    <img src="/ataturk.png" alt="Mustafa Kemal Atatürk" className="quote-image" />
                </div>
            </div>
        </section>
    );
};

export default QuoteSection;
