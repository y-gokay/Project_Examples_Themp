import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, visible].
 * Once the element enters the viewport, visible=true and stays true.
 * @param {number} threshold  - 0..1, portion of element that must be visible
 * @param {number} rootMargin - px offset before triggering (negative = trigger earlier)
 */
export function useReveal(threshold = 0.12, rootMargin = '0px 0px -40px 0px') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}

/**
 * Convenience: returns a className string.
 * mode: 'up' | 'left' | 'scale'
 */
export function useRevealClass(mode = 'up', delay = 0, threshold = 0.12) {
  const [ref, visible] = useReveal(threshold);
  const base = mode === 'left' ? 'reveal-left' : mode === 'scale' ? 'reveal-scale' : 'reveal';
  const delayClass = delay ? `delay-${delay}` : '';
  return [ref, `${base} ${delayClass} ${visible ? 'visible' : ''}`.trim()];
}
