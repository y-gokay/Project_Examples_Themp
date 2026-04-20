import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAppStore } from '@/store/useAppStore';
import { getInitials } from '@/lib/utils';
import { VenueSwitcher } from './VenueSwitcher';
import { SidebarNav } from './SidebarNav';

export function Topbar() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          aria-label="Menüyü aç"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="flex w-[min(100%,280px)] flex-col p-0">
            <SheetHeader className="border-b border-border px-6 py-4 text-left">
              <SheetTitle className="text-base">Menü</SheetTitle>
            </SheetHeader>
            <SidebarNav
              layoutId="sidebar-active-mobile"
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 flex-1">
          <VenueSwitcher />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary">
              {getInitials(user?.name)}
            </div>
            <div className="hidden flex-col items-start text-left sm:flex">
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Hesap</DropdownMenuLabel>
          <DropdownMenuItem className="flex cursor-default items-start gap-2" disabled>
            <UserCircle2 className="mt-0.5 h-4 w-4" />
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{user?.name}</span>
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4" />
            Çıkış yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
