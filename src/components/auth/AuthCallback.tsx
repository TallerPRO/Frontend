import { AlertCircle } from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';

interface AuthCallbackProps {
  status?: 'loading' | 'error';
  errorMessage?: string | null;
  onRetry?: () => void;
}

// Componente puramente visual para /auth/callback. Quien integre MSAL decide
// cuándo pasa a 'error' y qué hace onRetry (normalmente volver a /login).
export function AuthCallback({ status = 'loading', errorMessage, onRetry }: AuthCallbackProps) {
  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-900 px-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" aria-hidden />
        <p className="max-w-sm text-sm text-gray-300">
          {errorMessage ?? 'No pudimos conectar con Microsoft. Intenta nuevamente.'}
        </p>
        <Button onClick={() => onRetry?.()}>Volver a intentar</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-900">
      <Spinner size="lg" />
      <p className="text-sm text-gray-300">Verificando acceso…</p>
    </div>
  );
}
