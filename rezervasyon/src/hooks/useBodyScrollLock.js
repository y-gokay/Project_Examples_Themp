import { useEffect } from "react";

export const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      document.documentElement.style.overflow = "hidden";

      document.body.style.touchAction = "none";

      const preventScroll = (e) => {
        // Modal içindeki scroll'u engelleme
        if (e.target.closest(".overflow-y-auto")) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const preventKeyScroll = (e) => {
        // Modal içindeki scroll'u engelleme
        if (e.target.closest(".overflow-y-auto")) {
          return;
        }
        // Input, textarea, contenteditable elementlerde klavye olaylarını engelleme
        if (
          e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.contentEditable === "true"
        ) {
          return;
        }
        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
          e.preventDefault();
        }
      };

      document.addEventListener("wheel", preventScroll, { passive: false });
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("keydown", preventKeyScroll);

      return () => {
        document.removeEventListener("wheel", preventScroll);
        document.removeEventListener("touchmove", preventScroll);
        document.removeEventListener("keydown", preventKeyScroll);

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.body.style.touchAction = "";

        document.documentElement.style.overflow = "";

        if (scrollY) {
          window.scrollTo(0, scrollY);
        }
      };
    } else {
      const scrollY = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";

      document.documentElement.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [isLocked]);
};
