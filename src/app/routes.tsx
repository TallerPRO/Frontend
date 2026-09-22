import type { ReactNode } from 'react';
import { DashboardView } from './views/DashboardView';
import { OrdersView } from './views/OrdersView';
import { CreateOrderView } from './views/CreateOrderView';
import { OrderDetailView } from './views/OrderDetailView';
import { BaysView } from './views/BaysView';
import { ServicesView } from './views/ServicesView';
import { PartsView } from './views/PartsView';
import { ReportsView } from './views/ReportsView';
import { AuditView } from './views/AuditView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import type { Section } from '../auth/roles';

export interface RouteConfig {
  path: string;
  element: ReactNode;
  /**
   * Sección a la que pertenece la ruta. `ProtectedRoute` la contrasta con los
   * roles del token; sin sección, basta con tener sesión (caso de Perfil).
   */
  section?: Section;
}

export const routes: RouteConfig[] = [
  { path: '/dashboard', element: <DashboardView />, section: 'dashboard' },
  { path: '/orders', element: <OrdersView />, section: 'orders' },
  { path: '/orders/new', element: <CreateOrderView />, section: 'orders' },
  { path: '/orders/:id', element: <OrderDetailView />, section: 'orders' },
  { path: '/bays', element: <BaysView />, section: 'bays' },
  { path: '/catalog/services', element: <ServicesView />, section: 'catalog' },
  { path: '/catalog/parts', element: <PartsView />, section: 'catalog' },
  { path: '/reports', element: <ReportsView />, section: 'reports' },
  { path: '/audit', element: <AuditView />, section: 'audit' },
  { path: '/settings', element: <SettingsView />, section: 'settings' },
  { path: '/profile', element: <ProfileView /> },
];
