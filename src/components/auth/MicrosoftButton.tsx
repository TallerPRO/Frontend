import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

interface MicrosoftButtonProps {
  onClick: () => void;
  redirecting: boolean;
}

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden focusable="false">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function MicrosoftButton({ onClick, redirecting }: MicrosoftButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={redirecting}
      className={cn(
        'flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/10',
        'bg-white text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100',
        'disabled:cursor-not-allowed disabled:opacity-70',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
      )}
    >
      {redirecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Redirigiendo a Microsoft…
        </>
      ) : (
        <>
          <MicrosoftLogo />
          Iniciar sesión
        </>
      )}
    </button>
  );
}
