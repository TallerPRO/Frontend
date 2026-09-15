export enum Role {
  ADMIN = 'Admin',
  JEFE_TALLER = 'JefeTaller',
  MECANICO = 'Mecanico',
  CLIENTE = 'Cliente',
  AUDITOR = 'Auditor',
}

export type Section =
  | 'dashboard'
  | 'orders'
  | 'bays'
  | 'catalog'
  | 'reports'
  | 'audit'
  | 'users';

// Mapa de acceso a secciones por rol
export const ROLE_PERMISSIONS: Record<Role, Section[]> = {
  [Role.ADMIN]: ['dashboard', 'orders', 'bays', 'catalog', 'reports', 'audit', 'users'],
  [Role.JEFE_TALLER]: ['dashboard', 'orders', 'bays', 'catalog', 'reports'],
  [Role.MECANICO]: ['dashboard', 'orders', 'bays'],
  [Role.CLIENTE]: ['orders'],
  [Role.AUDITOR]: ['dashboard', 'audit', 'reports'],
};

export function hasAccess(roles: string[], section: Section): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role as Role]?.includes(section));
}
