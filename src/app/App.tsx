import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { AppShell } from '../components/layout/AppShell';
import { AuthProvider } from '../components/auth/AuthProvider';
import { Spinner } from '../components/ui/Spinner';
import { routes } from './routes';
import { NotFoundView } from './views/NotFoundView';

function AppContent() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [inProgress, isAuthenticated]);

  if (inProgress !== InteractionStatus.None || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <Spinner size="lg" />
      </div>
    );
  }

  const account = accounts[0];
  const userName = account?.name ?? account?.username;
  const roles = (account?.idTokenClaims?.roles as string[] | undefined) ?? [];

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: '/login' });
  };

  return (
    <BrowserRouter basename="/app">
      <Toaster theme="dark" richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AppShell roles={roles} userName={userName} onLogout={handleLogout}>
                {route.element}
              </AppShell>
            }
          />
        ))}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
