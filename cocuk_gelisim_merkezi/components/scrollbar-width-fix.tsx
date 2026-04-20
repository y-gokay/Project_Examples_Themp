"use client";

import { useEffect } from "react";

export function ScrollbarWidthFix() {
  useEffect(() => {
    function setScrollbarWidth() {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        "--scrollbar-width",
        scrollbarWidth + "px"
      );
    }

    setScrollbarWidth();
    window.addEventListener("resize", setScrollbarWidth);

    return () => {
      window.removeEventListener("resize", setScrollbarWidth);
    };
  }, []);

  return null;
}
