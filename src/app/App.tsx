import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { AuthProvider } from '../auth/AuthProvider';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { useAuth } from '../auth/useAuth';
import { routes } from './routes';
import { NotFoundView } from './views/NotFoundView';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/app">
        <Toaster theme="dark" richColors position="top-right" />
        <Rutas />
      </BrowserRouter>
    </AuthProvider>
  );
}

// Dentro de AuthProvider: aquí ya hay sesión y roles con los que decidir qué
// secciones se muestran y a cuáles se puede entrar.
function Rutas() {
  const { user, roles, logout } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <AppShell roles={roles} userName={user?.name} onLogout={logout}>
              <ProtectedRoute seccion={route.section}>{route.element}</ProtectedRoute>
            </AppShell>
          }
        />
      ))}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}
