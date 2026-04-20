import { useAppStore } from "@/store/useAppStore";
import { SidebarNav } from "./SidebarNav";

export function Sidebar() {
  const user = useAppStore((s) => s.user);

  return (
    <aside className="hidden h-full min-h-0 w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg text-primary-foreground">
          <img
            src="/assets/belediyelogo.webp"
            alt="Atakum Belediyesi"
            className="h-16 w-16 object-contain"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">
            Atakum Belediyesi QR Menü
          </span>
          <span className="text-xs text-muted-foreground">Yönetim Paneli</span>
        </div>
      </div>

      <SidebarNav />

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{user?.name ?? "—"}</p>
        <p>{user?.email ?? ""}</p>
      </div>
    </aside>
  );
}
