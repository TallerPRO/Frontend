import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import type { AuthenticationResult } from '@azure/msal-browser';
import { getMsalInstance, initializeMsal } from '../../auth/msalInstance';
import { Spinner } from '../ui/Spinner';

interface AuthContextValue {
  redirectResult: AuthenticationResult | null;
  initError: Error | null;
}

const AuthContext = createContext<AuthContextValue>({ redirectResult: null, initError: null });
export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [redirectResult, setRedirectResult] = useState<AuthenticationResult | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    initializeMsal()
      .then((result) => {
        setRedirectResult(result);
        setReady(true);
      })
      .catch((err) => {
        setInitError(err instanceof Error ? err : new Error(String(err)));
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ redirectResult, initError }}>
      <MsalProvider instance={getMsalInstance()}>
        {children}
      </MsalProvider>
    </AuthContext.Provider>
  );
}
