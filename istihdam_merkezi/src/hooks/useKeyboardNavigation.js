import { useEffect, useRef } from "react";

/**
 * Keyboard Navigation Hook
 * Dropdown, menu ve diğer interaktif component'ler için keyboard navigation sağlar
 * 
 * @param {Object} options
 * @param {boolean} options.isOpen - Component açık mı?
 * @param {Function} options.onClose - Kapatma fonksiyonu
 * @param {Function} options.onSelect - Seçim fonksiyonu (opsiyonel)
 * @param {number} options.itemCount - Item sayısı (opsiyonel)
 * @returns {Object} { itemRefs, handleKeyDown }
 */
export const useKeyboardNavigation = ({
  isOpen,
  onClose,
  onSelect,
  itemCount = 0,
}) => {
  const itemRefs = useRef([]);
  const currentIndexRef = useRef(-1);

  useEffect(() => {
    if (!isOpen) {
      currentIndexRef.current = -1;
      return;
    }

    // Reset focus when opened
    if (itemRefs.current.length > 0) {
      currentIndexRef.current = 0;
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, index) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        currentIndexRef.current = Math.min(
          currentIndexRef.current + 1,
          itemCount - 1
        );
        itemRefs.current[currentIndexRef.current]?.focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        currentIndexRef.current = Math.max(currentIndexRef.current - 1, 0);
        itemRefs.current[currentIndexRef.current]?.focus();
        break;

      case "Home":
        e.preventDefault();
        currentIndexRef.current = 0;
        itemRefs.current[0]?.focus();
        break;

      case "End":
        e.preventDefault();
        currentIndexRef.current = itemCount - 1;
        itemRefs.current[itemCount - 1]?.focus();
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (onSelect && currentIndexRef.current >= 0) {
          onSelect(currentIndexRef.current);
        }
        break;

      case "Escape":
        e.preventDefault();
        if (onClose) {
          onClose();
        }
        break;

      case "Tab":
        // Allow Tab to work normally, but close on Tab out
        if (onClose) {
          // Close when Tab moves focus outside
          setTimeout(() => {
            if (!itemRefs.current.some((ref) => ref === document.activeElement)) {
              onClose();
            }
          }, 0);
        }
        break;

      default:
        // Character search (first letter matching)
        const char = e.key.toLowerCase();
        const matchingIndex = itemRefs.current.findIndex((ref, idx) => {
          if (!ref || idx <= currentIndexRef.current) return false;
          const text = ref.textContent?.toLowerCase() || "";
          return text.startsWith(char);
        });

        if (matchingIndex >= 0) {
          currentIndexRef.current = matchingIndex;
          itemRefs.current[matchingIndex]?.focus();
        }
        break;
    }
  };

  return {
    itemRefs,
    handleKeyDown,
    currentIndex: currentIndexRef.current,
  };
};

/**
 * Focus Trap Hook
 * Modal ve dialog'larda focus'u içeride tutar
 * 
 * @param {Object} options
 * @param {boolean} options.isActive - Focus trap aktif mi?
 * @param {React.RefObject} options.containerRef - Container ref
 * @param {React.RefObject} options.initialFocusRef - İlk focus edilecek element (opsiyonel)
 */
export const useFocusTrap = ({ isActive, containerRef, initialFocusRef }) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    // Focus initial element or first focusable element
    const firstElement = initialFocusRef?.current || focusableElements[0];
    firstElement?.focus();

    const handleTab = (e) => {
      if (e.key !== "Tab") return;

      const elements = Array.from(focusableElements);
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTab);

    return () => {
      container.removeEventListener("keydown", handleTab);
    };
  }, [isActive, containerRef, initialFocusRef]);
};

export default useKeyboardNavigation;

