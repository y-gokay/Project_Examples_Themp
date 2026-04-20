import { useState, useEffect } from "react";

export function useAccessibility() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    setPrefersReducedMotion(reducedMotionQuery.matches);

    const handleReducedMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    setPrefersHighContrast(highContrastQuery.matches);

    const handleHighContrastChange = (e) => {
      setPrefersHighContrast(e.matches);
    };

    highContrastQuery.addEventListener("change", handleHighContrastChange);

    // Check for dark mode preference
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDarkMode(darkModeQuery.matches);

    const handleDarkModeChange = (e) => {
      setPrefersDarkMode(e.matches);
    };

    darkModeQuery.addEventListener("change", handleDarkModeChange);

    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
      darkModeQuery.removeEventListener("change", handleDarkModeChange);
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
  };
}

