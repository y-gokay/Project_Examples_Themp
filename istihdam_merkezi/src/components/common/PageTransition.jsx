import React, { useEffect, useState } from "react";
import { useAppStore } from "../../store";
import logo from "../../assets/atim.webp";
import logoDark from "../../assets/atim_darkmode.webp";
import bgLight from "../../assets/atakumun-essiz-sahili.webp";
import bgDark from "../../assets/atakumun-essiz-sahili-gece.webp";

// Sadece ilk sayfa yüklemesinde gösterilir, route değişimlerinde tetiklenmez
const PageTransition = () => {
  const { theme } = useAppStore();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-white/70 dark:before:bg-gray-900/70 before:-z-10`}
      style={{
        backgroundImage: `url(${theme === "dark" ? bgDark : bgLight})`
      }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-md px-12 py-8 rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/50">
        <img
          src={theme === "dark" ? logoDark : logo}
          alt="Atakum İstihdam Merkezi"
          className="h-24 md:h-28 object-contain drop-shadow-md pb-2"
          fetchpriority="high"
        />
        <div className="mt-4 w-36 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[pulse_1.5s_ease-in-out_infinite] rounded-full w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default PageTransition;
