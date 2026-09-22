import { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { AuthProvider } from './AuthProvider';
import { LoginCard, type LoginStatus } from './LoginCard';
import { loginRequest } from '../../auth/authConfig';

function LoginContent() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/app/dashboard';
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setStatus('redirecting');
    try {
      await instance.loginRedirect(loginRequest);
    } catch {
      setStatus('error');
      setErrorMessage('Error al iniciar sesión. Por favor intenta nuevamente.');
    }
  };

  return (
    <LoginCard status={status} errorMessage={errorMessage} onLogin={handleLogin} />
  );
}

export function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
