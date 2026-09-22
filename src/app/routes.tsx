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

export interface RouteConfig {
  path: string;
  element: ReactNode;
}

// Sin roles ni guards: la parte visual solamente. El filtrado de secciones
// por rol y la protección de rutas se integran junto con el login.
export const routes: RouteConfig[] = [
  { path: '/dashboard', element: <DashboardView /> },
  { path: '/orders', element: <OrdersView /> },
  { path: '/orders/new', element: <CreateOrderView /> },
  { path: '/orders/:id', element: <OrderDetailView /> },
  { path: '/bays', element: <BaysView /> },
  { path: '/catalog/services', element: <ServicesView /> },
  { path: '/catalog/parts', element: <PartsView /> },
  { path: '/reports', element: <ReportsView /> },
  { path: '/audit', element: <AuditView /> },
  { path: '/settings', element: <SettingsView /> },
  { path: '/profile', element: <ProfileView /> },
];
