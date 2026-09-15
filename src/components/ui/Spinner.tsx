import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

type Size = 'sm' | 'md' | 'lg';

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

export function Spinner({ size = 'md', className }: { size?: Size; className?: string }) {
  return (
    <Loader2
      role="status"
      aria-label="Cargando"
      className={cn('animate-spin text-brand-500', SIZE_STYLES[size], className)}
    />
  );
}
