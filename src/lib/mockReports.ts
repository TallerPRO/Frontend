// Datos de muestra para Reportes y el Dashboard mientras el BFF no expone
// /api/reports/*. Los hooks caen a estos datos si la llamada falla.
import type {
  MechanicPerformance,
  OrdersSummaryReport,
  RepairTimeDatum,
  RevenueByWorkshop,
} from '../types/report.types';
import { MOCK_ORDERS_BY_STATUS, MOCK_ORDERS_TREND, MOCK_WORKSHOP_LOAD } from './mockDashboard';

export const MOCK_ORDERS_SUMMARY: OrdersSummaryReport = {
  activeOrders: 58,
  activeOrdersChangePercent: 12,
  occupiedBays: 24,
  totalBays: 40,
  occupiedBaysChangePercent: -4,
  avgRepairDays: 2.3,
  avgRepairDaysChangePercent: -8,
  monthRevenue: 18420000,
  monthRevenueChangePercent: 6,
  ordersByStatus: MOCK_ORDERS_BY_STATUS,
  ordersTrend: MOCK_ORDERS_TREND,
  workshopLoad: MOCK_WORKSHOP_LOAD,
};

export const MOCK_REVENUE_BY_WORKSHOP: RevenueByWorkshop[] = [
  { workshopId: 'w1', workshopName: 'Providencia', revenue: 5120000, orders: 41, avgTicket: 124878 },
  { workshopId: 'w2', workshopName: 'Maipú', revenue: 3280000, orders: 29, avgTicket: 113103 },
  { workshopId: 'w3', workshopName: 'La Florida', revenue: 3940000, orders: 33, avgTicket: 119394 },
  { workshopId: 'w4', workshopName: 'Ñuñoa', revenue: 2150000, orders: 18, avgTicket: 119444 },
  { workshopId: 'w5', workshopName: 'Puente Alto', revenue: 3930000, orders: 37, avgTicket: 106216 },
];

export const MOCK_REPAIR_TIME: RepairTimeDatum[] = [
  { month: 'Abr', avgDays: 3.1, target: 2.5 },
  { month: 'May', avgDays: 2.8, target: 2.5 },
  { month: 'Jun', avgDays: 2.9, target: 2.5 },
  { month: 'Jul', avgDays: 2.6, target: 2.5 },
  { month: 'Ago', avgDays: 2.5, target: 2.5 },
  { month: 'Sep', avgDays: 2.3, target: 2.5 },
];

export const MOCK_MECHANIC_PERFORMANCE: MechanicPerformance[] = [
  { mechanicId: 'm1', mechanicName: 'Carlos Muñoz', workshopName: 'Providencia', completedOrders: 22, avgRepairDays: 2.1, reworkRate: 0.04 },
  { mechanicId: 'm2', mechanicName: 'Andrea Soto', workshopName: 'Providencia', completedOrders: 19, avgRepairDays: 2.4, reworkRate: 0.02 },
  { mechanicId: 'm3', mechanicName: 'Jorge Pizarro', workshopName: 'Maipú', completedOrders: 17, avgRepairDays: 2.9, reworkRate: 0.09 },
  { mechanicId: 'm4', mechanicName: 'Valentina Rojas', workshopName: 'La Florida', completedOrders: 21, avgRepairDays: 2.2, reworkRate: 0.03 },
  { mechanicId: 'm5', mechanicName: 'Pablo Fuentes', workshopName: 'Ñuñoa', completedOrders: 12, avgRepairDays: 3.3, reworkRate: 0.12 },
  { mechanicId: 'm6', mechanicName: 'Daniela Vera', workshopName: 'Puente Alto', completedOrders: 24, avgRepairDays: 2.0, reworkRate: 0.05 },
];
