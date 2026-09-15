import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from '../components/layout/AppShell';
import { routes } from './routes';
import { NotFoundView } from './views/NotFoundView';

// Solo la parte visual: sin auth provider ni protección de rutas todavía.
// Quien integre el login envuelve este árbol y pasa roles/userName/onLogout
// reales a <AppShell>.
export default function App() {
  return (
    <BrowserRouter basename="/app">
      <Toaster theme="dark" richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<AppShell>{route.element}</AppShell>}
          />
        ))}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </BrowserRouter>
  );
}
