import { useCallback, useEffect, useState } from 'react';
import {
  getMechanicPerformance,
  getOrdersSummary,
  getRepairTime,
  getRevenueByWorkshop,
} from '../api/reports.api';
import type {
  MechanicPerformance,
  OrdersSummaryReport,
  RepairTimeDatum,
  ReportPeriod,
  RevenueByWorkshop,
} from '../types/report.types';
import {
  MOCK_MECHANIC_PERFORMANCE,
  MOCK_ORDERS_SUMMARY,
  MOCK_REPAIR_TIME,
  MOCK_REVENUE_BY_WORKSHOP,
} from '../lib/mockReports';

// Resumen operativo para el Dashboard. Cae a datos de muestra si el BFF no
// responde (misma estrategia que useBays).
export function useOrdersSummary(workshopId?: string) {
  const [summary, setSummary] = useState<OrdersSummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrdersSummary(workshopId)
      .then((result) => {
        if (cancelled) return;
        setSummary(result);
        setUsingMock(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSummary(MOCK_ORDERS_SUMMARY);
        setUsingMock(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workshopId]);

  return { summary, loading, usingMock };
}

function defaultPeriod(): ReportPeriod {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function useReports(initialPeriod: ReportPeriod = defaultPeriod()) {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod);
  const [revenue, setRevenue] = useState<RevenueByWorkshop[]>([]);
  const [repairTime, setRepairTime] = useState<RepairTimeDatum[]>([]);
  const [mechanics, setMechanics] = useState<MechanicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueResult, repairResult, mechanicsResult] = await Promise.all([
        getRevenueByWorkshop(period),
        getRepairTime(period),
        getMechanicPerformance(period),
      ]);
      setRevenue(revenueResult);
      setRepairTime(repairResult);
      setMechanics(mechanicsResult);
      setUsingMock(false);
    } catch {
      setRevenue(MOCK_REVENUE_BY_WORKSHOP);
      setRepairTime(MOCK_REPAIR_TIME);
      setMechanics(MOCK_MECHANIC_PERFORMANCE);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { period, setPeriod, revenue, repairTime, mechanics, loading, usingMock, refetch: fetchAll };
}
