import { apiClient } from './client';
import type {
  MechanicPerformance,
  OrdersSummaryReport,
  RepairTimeDatum,
  ReportPeriod,
  RevenueByWorkshop,
} from '../types/report.types';

export async function getOrdersSummary(workshopId?: string): Promise<OrdersSummaryReport> {
  const { data } = await apiClient.get<OrdersSummaryReport>('/api/reports/orders/summary', {
    params: { workshopId },
  });
  return data;
}

export async function getRevenueByWorkshop(period: ReportPeriod): Promise<RevenueByWorkshop[]> {
  const { data } = await apiClient.get<RevenueByWorkshop[]>('/api/reports/revenue', { params: period });
  return data;
}

export async function getRepairTime(period: ReportPeriod): Promise<RepairTimeDatum[]> {
  const { data } = await apiClient.get<RepairTimeDatum[]>('/api/reports/repair-time', { params: period });
  return data;
}

export async function getMechanicPerformance(period: ReportPeriod): Promise<MechanicPerformance[]> {
  const { data } = await apiClient.get<MechanicPerformance[]>('/api/reports/mechanics', { params: period });
  return data;
}
