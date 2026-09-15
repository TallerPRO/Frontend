import {
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  Package,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { hasAccess, type Section } from '../../auth/roles';
import { useUiStore } from '../../stores/ui.store';
import { cn } from '../../lib/cn';

interface NavItem {
  section: Section;
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

// Rutas relativas: BrowserRouter usa basename="/app" en App.tsx.
const NAV_ITEMS: NavItem[] = [
  { section: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { section: 'orders', label: 'Órdenes', to: '/orders', icon: ClipboardList },
  { section: 'bays', label: 'Bahías', to: '/bays', icon: Warehouse },
  { section: 'catalog', label: 'Catálogo', to: '/catalog/services', icon: Package },
  { section: 'reports', label: 'Reportes', to: '/reports', icon: BarChart3 },
  { section: 'audit', label: 'Auditoría', to: '/audit', icon: ShieldCheck },
];

interface SidebarProps {
  roles?: string[];
}

// `roles` decide qué secciones se muestran; quien integre el login pasa los
// roles reales del usuario. Sin prop, se muestra todo (modo visual/demo).
export function Sidebar({ roles }: SidebarProps) {
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useUiStore();
  const items = roles ? NAV_ITEMS.filter((item) => hasAccess(roles, item.section)) : NAV_ITEMS;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
          role="presentation"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-navy-800',
          'transition-[transform,width] duration-200 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'md:w-[72px]' : 'w-60',
        )}
      >
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          aria-expanded={!sidebarCollapsed}
          className={cn(
            'absolute -right-3 top-8 z-50 hidden h-7 w-7 items-center justify-center rounded-full',
            'border border-white/15 bg-navy-900 text-gray-300 shadow-md',
            'hover:border-brand-500/50 hover:text-brand-500 md:flex',
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} aria-hidden />
        </button>

        <div
          className={cn(
            'flex items-center gap-2 px-4 py-4',
            sidebarCollapsed && 'md:justify-center md:px-2',
          )}
        >
          <img src="/logo-tallerpro.svg" alt="" width={28} height={28} className="shrink-0" />
          <span className={cn('text-sm font-semibold text-gray-100', sidebarCollapsed && 'md:hidden')}>
            TallerPro
          </span>
        </div>

        <nav
          className={cn('flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4', sidebarCollapsed && 'md:px-2')}
          aria-label="Navegación principal"
        >
          {items.map((item) => (
            <NavLink
              key={item.section}
              to={item.to}
              onClick={closeSidebar}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300',
                  'hover:bg-white/5 hover:text-gray-100',
                  isActive && 'bg-brand-500/10 text-brand-500',
                  sidebarCollapsed && 'md:justify-center md:px-0',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className={cn(sidebarCollapsed && 'md:hidden')}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
