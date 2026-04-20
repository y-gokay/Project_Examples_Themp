import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 *
 * Her route değişikliğinde sayfanın en üstüne scroll yapar.
 * React Router ile birlikte kullanılır.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Eğer URL'de hash (ör. /iletisim#sss) varsa ilgili bölüme scroll yap
    if (hash) {
      const targetId = hash.replace("#", "");

      // DOM'un yüklenmesi için küçük bir gecikme ile dene
      const scrollToHash = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Eleman henüz render edilmediyse çok kısa bir süre sonra tekrar dene
          setTimeout(() => {
            const retryElement = document.getElementById(targetId);
            if (retryElement) {
              retryElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 150);
        }
      };

      scrollToHash();
      return;
    }

    // Hash yoksa, normal davranış: sayfanın en üstüne scroll yap
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
