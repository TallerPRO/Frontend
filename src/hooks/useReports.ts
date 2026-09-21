import { useCallback, useEffect, useState } from 'react';
import {
  getMechanicPerformance,
  getOrdersSummary,
  getRepairTime,
  getRevenueByWorkshop,
} from '../api/reports.api';
import { errorMessage } from '../api/client';
import type {
  MechanicPerformance,
  OrdersSummaryReport,
  RepairTimeDatum,
  ReportPeriod,
  RevenueByWorkshop,
} from '../types/report.types';

// Resumen operativo para el Dashboard (ms-tallerpro-report vía gateway).
export function useOrdersSummary(workshopId?: string) {
  const [summary, setSummary] = useState<OrdersSummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrdersSummary(workshopId)
      .then((result) => {
        if (cancelled) return;
        setSummary(result);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setSummary(null);
        setError(errorMessage(err, 'No pudimos cargar el resumen.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workshopId]);

  return { summary, loading, error, usingMock: false };
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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'No pudimos cargar los reportes.'));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { period, setPeriod, revenue, repairTime, mechanics, loading, error, usingMock: false, refetch: fetchAll };
}
