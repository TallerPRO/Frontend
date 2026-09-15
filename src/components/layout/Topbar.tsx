import { Menu, LogOut, User } from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';
import { Button } from '../ui/Button';

interface TopbarProps {
  userName?: string;
  onLogout?: () => void;
}

export function Topbar({ userName, onLogout }: TopbarProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-navy-900 px-4">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
        className="rounded p-2 text-gray-300 hover:bg-white/5 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {userName && (
          <div className="hidden items-center gap-2 text-sm text-gray-300 sm:flex">
            <User className="h-4 w-4" aria-hidden />
            <span>{userName}</span>
          </div>
        )}
        <Button variant="ghost" onClick={() => onLogout?.()} aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </header>
  );
}
