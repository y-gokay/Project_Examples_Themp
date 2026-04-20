import { useState, useEffect } from "react";

export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breakpoints = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  };

  const isXs = screenSize.width < breakpoints.sm;
  const isSm =
    screenSize.width >= breakpoints.sm && screenSize.width < breakpoints.md;
  const isMd =
    screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
  const isLg =
    screenSize.width >= breakpoints.lg && screenSize.width < breakpoints.xl;
  const isXl =
    screenSize.width >= breakpoints.xl && screenSize.width < breakpoints["2xl"];
  const is2Xl = screenSize.width >= breakpoints["2xl"];

  const isMobile = screenSize.width < breakpoints.md;
  const isTablet =
    screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
  const isDesktop = screenSize.width >= breakpoints.lg;

  return {
    ...screenSize,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
}

