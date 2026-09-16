import { Menu, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiStore } from '../../stores/ui.store';
import { useSessionStore } from '../../stores/session.store';
import { Button } from '../ui/Button';

interface TopbarProps {
  userName?: string;
  onLogout?: () => void;
}

// `userName` explícito tiene prioridad; si no viene, se usa el usuario del
// session store (demo hasta integrar MSAL).
export function Topbar({ userName, onLogout }: TopbarProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const sessionName = useSessionStore((s) => s.user?.name);
  const displayName = userName ?? sessionName;

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
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-300 hover:bg-white/5 hover:text-gray-100"
          aria-label="Ver perfil"
        >
          <User className="h-4 w-4" aria-hidden />
          {displayName && <span className="hidden sm:inline">{displayName}</span>}
        </Link>
        <Button variant="ghost" onClick={() => onLogout?.()} aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </header>
  );
}
