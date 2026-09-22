import { apiClient } from './client';
import type {
  MechanicPerformance,
  OrdersSummaryReport,
  RepairTimeDatum,
  ReportPeriod,
  RevenueByWorkshop,
} from '../types/report.types';
import type { OrderStatus } from '../types/order.types';
import { workshopName } from '../lib/workshops';
import { getBaysSummary } from './bays.api';

// Adaptador hacia ms-tallerpro-report (vía gateway): /api/report/kpis.
// El backend calcula órdenes por hora, tiempo de permanencia y órdenes activas por
// estado (alimentado por Kafka). Lo que el backend NO calcula (ingresos, desempeño
// por mecánico) se devuelve vacío/0 y las vistas muestran su estado vacío.

interface OrdersPerHour { tallerId: string; orders: number; windowStart: string; windowEnd: string }
interface DwellTime { tallerId: string; avgMinutes: number; completedOrders: number }
interface ActiveOrdersByStatus { tallerId: string; countByStatus: Record<string, number>; totalActive: number }
interface OperationsPanel {
  generatedAt: string;
  ordersPerHour: OrdersPerHour[];
  dwellTime: DwellTime[];
  activeOrders: ActiveOrdersByStatus[];
}

const KPIS = '/api/report/kpis';
const ALL_STATUSES: OrderStatus[] = ['RECEPCIONADA', 'DIAGNOSTICADA', 'EN_REPARACION', 'LISTA_RETIRO', 'ENTREGADA', 'ANULADA'];

function avg(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/**
 * Ingresos: suma de los totales de las órdenes ENTREGADAS, que es cuando el
 * trabajo se cobra. El monto sale de jobs (única fuente del total, calculado
 * con los precios del catálogo); report todavía no lo propaga por Kafka.
 */
async function revenueFromDeliveredOrders(workshopId?: string): Promise<{ month: number; previousMonth: number }> {
  const { data } = await apiClient.get<{ total: number | null; fechaEntrega: string | null }[]>('/api/v1/ordenes', {
    params: { tallerId: workshopId, estado: 'ENTREGADA' },
  });

  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const thisMonth = monthKey(now);
  const prevMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  let month = 0;
  let previousMonth = 0;
  for (const orden of data) {
    if (!orden.fechaEntrega) continue;
    const key = monthKey(new Date(orden.fechaEntrega));
    if (key === thisMonth) month += orden.total ?? 0;
    else if (key === prevMonth) previousMonth += orden.total ?? 0;
  }
  return { month, previousMonth };
}

export async function getOrdersSummary(workshopId?: string): Promise<OrdersSummaryReport> {
  const [{ data: panel }, bays, revenue] = await Promise.all([
    apiClient.get<OperationsPanel>(KPIS, { params: { tallerId: workshopId } }),
    workshopId ? getBaysSummary(workshopId).catch(() => null) : Promise.resolve(null),
    revenueFromDeliveredOrders(workshopId).catch(() => ({ month: 0, previousMonth: 0 })),
  ]);

  const byStatus: Record<string, number> = {};
  for (const t of panel.activeOrders) {
    for (const [status, count] of Object.entries(t.countByStatus)) {
      byStatus[status] = (byStatus[status] ?? 0) + count;
    }
  }

  const dwellDays = avg(panel.dwellTime.filter((d) => d.completedOrders > 0).map((d) => d.avgMinutes / 1440));

  return {
    activeOrders: panel.activeOrders.reduce((sum, t) => sum + t.totalActive, 0),
    activeOrdersChangePercent: 0,
    occupiedBays: bays?.ocupadas ?? 0,
    totalBays: bays?.total ?? 0,
    occupiedBaysChangePercent: 0,
    avgRepairDays: Math.round(dwellDays * 10) / 10,
    avgRepairDaysChangePercent: 0,
    monthRevenue: revenue.month,
    monthRevenueChangePercent: revenue.previousMonth
      ? Math.round(((revenue.month - revenue.previousMonth) / revenue.previousMonth) * 100)
      : 0,
    ordersByStatus: ALL_STATUSES.map((status) => ({ status, count: byStatus[status] ?? 0 })),
    ordersTrend: panel.ordersPerHour.map((w) => ({
      date: new Date(w.windowEnd).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }),
      count: w.orders,
    })),
    workshopLoad: panel.activeOrders.map((t) => ({ workshopName: workshopName(t.tallerId), activeOrders: t.totalActive })),
  };
}

/** Ingresos por taller: sin fuente en el backend todavía (jobs no lleva montos). */
export async function getRevenueByWorkshop(_period: ReportPeriod): Promise<RevenueByWorkshop[]> {
  return [];
}

/** Tiempo de permanencia promedio por taller (desde `from`), en días. */
export async function getRepairTime(period: ReportPeriod): Promise<RepairTimeDatum[]> {
  const { data } = await apiClient.get<DwellTime[]>(`${KPIS}/dwell-time`, {
    params: { tallerId: period.workshopId, since: `${period.from}T00:00:00Z` },
  });
  return data.map((d) => ({
    month: workshopName(d.tallerId),
    avgDays: Math.round((d.avgMinutes / 1440) * 10) / 10,
    target: 3,
  }));
}

/** Desempeño por mecánico: sin fuente en el backend todavía. */
export async function getMechanicPerformance(_period: ReportPeriod): Promise<MechanicPerformance[]> {
  return [];
}
