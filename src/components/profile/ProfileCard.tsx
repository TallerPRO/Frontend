import { Building2, Mail, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ROLE_PERMISSIONS, type Role } from '../../auth/roles';
import type { SessionUser } from '../../stores/session.store';

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Órdenes',
  bays: 'Bahías',
  catalog: 'Catálogo',
  reports: 'Reportes',
  audit: 'Auditoría',
  users: 'Usuarios',
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ProfileCard({ user }: { user: SessionUser }) {
  const sections = Array.from(
    new Set(user.roles.flatMap((role) => ROLE_PERMISSIONS[role as Role] ?? [])),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/15 text-2xl font-semibold text-brand-500"
        >
          {initials(user.name)}
        </span>
        <div>
          <p className="text-base font-semibold text-gray-100">{user.name}</p>
          {user.jobTitle && <p className="text-sm text-gray-400">{user.jobTitle}</p>}
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {user.roles.map((role) => (
            <Badge key={role} tone="blue">
              {role}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold text-gray-100">Datos de la cuenta</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden />
            <div>
              <dt className="text-xs text-gray-500">Correo corporativo</dt>
              <dd className="text-sm text-gray-200">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden />
            <div>
              <dt className="text-xs text-gray-500">Taller</dt>
              <dd className="text-sm text-gray-200">{user.workshopName ?? 'Toda la red'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-gray-500" aria-hidden />
            <div>
              <dt className="text-xs text-gray-500">Secciones con acceso</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {sections.map((section) => (
                  <Badge key={section}>{SECTION_LABELS[section] ?? section}</Badge>
                ))}
              </dd>
            </div>
          </div>
        </dl>
        <p className="mt-5 text-xs text-gray-500">
          Los datos provienen de Azure AD y se administran desde el directorio corporativo.
        </p>
      </Card>
    </div>
  );
}
