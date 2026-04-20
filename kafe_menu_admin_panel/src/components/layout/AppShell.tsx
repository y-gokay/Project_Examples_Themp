import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const FOOTER_ATTRIBUTION =
  'Atakum Belediyesi Bilgi İşlem Müdürlüğü tarafından yapılmıştır';

export function AppShell() {
  const location = useLocation();
  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4 sm:px-6 sm:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mx-auto max-w-7xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="shrink-0 border-t border-border bg-card/80 px-4 py-3 text-center text-[11px] leading-relaxed text-muted-foreground backdrop-blur sm:px-6 sm:text-xs">
          <p>{FOOTER_ATTRIBUTION}</p>
          <p className="mt-1 text-[10px] text-muted-foreground/80 sm:text-[11px]">
            © {new Date().getFullYear()} Atakum Belediyesi · QR Menü
          </p>
        </footer>
      </div>
    </div>
  );
}
