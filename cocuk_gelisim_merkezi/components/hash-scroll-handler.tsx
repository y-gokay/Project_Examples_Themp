"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToMerkezlerIfNeeded() {
  if (window.location.pathname !== "/") return;
  if (window.location.hash !== "#merkezler") return;

  const element = document.getElementById("merkezler");
  if (!element) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  element.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const run = () => {
      // Layout / font / görsel yerleşimi sonrası bir karede çalıştır
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToMerkezlerIfNeeded);
      });
    };

    run();
    window.addEventListener("hashchange", scrollToMerkezlerIfNeeded);
    return () =>
      window.removeEventListener("hashchange", scrollToMerkezlerIfNeeded);
  }, [pathname]);

  return null;
}
