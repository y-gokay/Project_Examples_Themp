import { useEffect, useCallback } from "react";

export function useKeyboardNavigation() {
  const handleKeyDown = useCallback((event) => {
    // ESC key to close modals
    if (event.key === "Escape") {
      const modals = document.querySelectorAll('[role="dialog"]');
      if (modals.length > 0) {
        const lastModal = modals[modals.length - 1];
        const closeButton = lastModal.querySelector(
          '[aria-label*="close"], [aria-label*="kapat"]'
        );
        if (closeButton) {
          closeButton.click();
        }
      }
    }

    // Enter key to submit forms
    if (event.key === "Enter" && event.ctrlKey) {
      const form = event.target.closest("form");
      if (form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }
    }

    // Arrow keys for navigation
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const focusedElement = document.activeElement;
      const selectableElements = document.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );

      const currentIndex =
        Array.from(selectableElements).indexOf(focusedElement);

      if (
        event.key === "ArrowDown" &&
        currentIndex < selectableElements.length - 1
      ) {
        selectableElements[currentIndex + 1].focus();
        event.preventDefault();
      } else if (event.key === "ArrowUp" && currentIndex > 0) {
        selectableElements[currentIndex - 1].focus();
        event.preventDefault();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    handleKeyDown,
  };
}

