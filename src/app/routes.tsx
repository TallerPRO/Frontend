import type { ReactNode } from 'react';
import { DashboardView } from './views/DashboardView';
import { OrdersView } from './views/OrdersView';
import { CreateOrderView } from './views/CreateOrderView';
import { OrderDetailView } from './views/OrderDetailView';
import { BaysView } from './views/BaysView';
import { PlaceholderView } from './views/PlaceholderView';

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
  {
    path: '/catalog/services',
    element: <PlaceholderView title="Servicios" description="Catálogo de servicios" phase="la Fase 6" />,
  },
  {
    path: '/catalog/parts',
    element: <PlaceholderView title="Repuestos" description="Catálogo de repuestos" phase="la Fase 6" />,
  },
  {
    path: '/reports',
    element: <PlaceholderView title="Reportes" description="Reportería operativa" phase="la Fase 7" />,
  },
  {
    path: '/audit',
    element: <PlaceholderView title="Auditoría" description="Log de eventos del sistema" phase="la Fase 8" />,
  },
  {
    path: '/profile',
    element: <PlaceholderView title="Perfil" description="Datos de la cuenta" phase="una fase futura" />,
  },
];
