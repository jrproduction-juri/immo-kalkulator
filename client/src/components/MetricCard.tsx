import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KennzahlInfoButton } from './KennzahlenLegende';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tooltip?: string;
  /** Kürzel für automatischen Info-Button (z.B. 'BMR', 'CF', 'EKR') */
  infoKuerzel?: string;
}

const colorMap = {
  default: 'text-foreground',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  blue: 'text-blue-700',
};

const bgColorMap = {
  default: 'bg-card',
  success: 'bg-emerald-50',
  warning: 'bg-amber-50',
  danger: 'bg-red-50',
  blue: 'bg-blue-50',
};

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  highlight = false,
  color = 'default',
  size = 'md',
  className,
  infoKuerzel,
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'metric-card animate-count-up',
        highlight && 'border-blue-200 shadow-md shadow-blue-100/50',
        bgColorMap[color],
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-0.5 min-w-0">
          <p className="text-xs font-medium text-muted-foreground leading-tight truncate">{label}</p>
          {infoKuerzel && <KennzahlInfoButton kuerzel={infoKuerzel} />}
        </div>
        {trend && (
          <TrendIcon className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', trendColor)} />
        )}
      </div>
      <p
        className={cn(
          'num-display font-bold mt-1.5 leading-none',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
          colorMap[color]
        )}
      >
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
}

export function MetricGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {children}
    </div>
  );
}
