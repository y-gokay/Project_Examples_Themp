import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const getScrollContainer = () =>
  document.getElementById('main-scroll-container');

const useScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.key || 'default';

  useEffect(() => {
    const container = getScrollContainer();
    if (!container) return;

    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${key}`, container.scrollTop.toString());
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [key]);

  useEffect(() => {
    if (navigationType !== 'POP') return;

    const saved = sessionStorage.getItem(`scroll_${key}`);
    if (saved == null) return;

    const target = parseInt(saved, 10);

    const timers = [100, 300, 600].map((delay) =>
      setTimeout(() => {
        const container = getScrollContainer();
        if (container && Math.abs(container.scrollTop - target) > 5) {
          container.scrollTo(0, target);
        }
      }, delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [key, navigationType]);
};

export default useScrollRestoration;
