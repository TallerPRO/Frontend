import type { OrderStatus } from './order.types';

export interface ReportPeriod {
  from: string; // ISO date "YYYY-MM-DD"
  to: string;
  workshopId?: string;
}

// /api/reports/orders/summary — alimenta el Dashboard y la cabecera de Reportes.
export interface OrdersSummaryReport {
  activeOrders: number;
  activeOrdersChangePercent: number;
  occupiedBays: number;
  totalBays: number;
  occupiedBaysChangePercent: number;
  avgRepairDays: number;
  avgRepairDaysChangePercent: number;
  monthRevenue: number;
  monthRevenueChangePercent: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  ordersTrend: { date: string; count: number }[]; // date "dd/MM"
  workshopLoad: { workshopName: string; activeOrders: number }[];
}

// /api/reports/revenue
export interface RevenueByWorkshop {
  workshopId: string;
  workshopName: string;
  revenue: number;
  orders: number;
  avgTicket: number;
}

// /api/reports/repair-time
export interface RepairTimeDatum {
  month: string; // "Ene", "Feb"…
  avgDays: number;
  target: number;
}

// /api/reports/mechanics
export interface MechanicPerformance {
  mechanicId: string;
  mechanicName: string;
  workshopName: string;
  completedOrders: number;
  avgRepairDays: number;
  reworkRate: number; // 0..1
}
