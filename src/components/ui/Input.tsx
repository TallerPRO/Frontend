import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          'h-10 rounded-lg border border-white/10 bg-navy-800 px-3 text-sm text-gray-100',
          'placeholder:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error && (
        <span id={inputId ? `${inputId}-error` : undefined} className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
});
