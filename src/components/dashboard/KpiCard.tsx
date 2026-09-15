import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  changePercent?: number;
  icon: LucideIcon;
}

export function KpiCard({ label, value, changePercent, icon: Icon }: KpiCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="rounded-lg bg-brand-500/10 p-2 text-brand-500">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-gray-100">{value}</span>
        {changePercent !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden />
            )}
            {Math.abs(changePercent)}%
          </span>
        )}
      </div>
    </Card>
  );
}
