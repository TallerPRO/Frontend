import { useEffect, useState } from 'react';
import { AuthProvider, useAuthContext } from './AuthProvider';
import { AuthCallback } from './AuthCallback';

function CallbackContent() {
  const { redirectResult, initError } = useAuthContext();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initError) {
      setStatus('error');
      setErrorMessage(initError.message);
      return;
    }
    if (redirectResult) {
      // Login exitoso — llevar al usuario a la app
      window.location.href = '/app/dashboard';
      return;
    }
    // handleRedirectPromise() resolvió null: no hay código de auth en la URL.
    // Redirigir al login en lugar de quedarse colgado en el spinner.
    window.location.href = '/login';
  }, [redirectResult, initError]);

  const handleRetry = () => {
    window.location.href = '/login';
  };

  return (
    <AuthCallback status={status} errorMessage={errorMessage} onRetry={handleRetry} />
  );
}

export function CallbackPage() {
  return (
    <AuthProvider>
      <CallbackContent />
    </AuthProvider>
  );
}
