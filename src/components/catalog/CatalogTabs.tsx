import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

const TABS = [
  { to: '/catalog/services', label: 'Servicios' },
  { to: '/catalog/parts', label: 'Repuestos' },
];

export function CatalogTabs() {
  return (
    <nav className="mb-4 flex gap-1 border-b border-white/10" aria-label="Secciones del catálogo">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-400 hover:text-gray-200',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
