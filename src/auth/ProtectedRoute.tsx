import type { ReactNode } from 'react';
import { ShieldAlert, ShieldOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from './useAuth';
import type { Section } from './roles';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Sección que protege esta ruta; si se omite, basta con estar autenticado. */
  seccion?: Section;
}

/**
 * Tres respuestas posibles, y conviene no confundirlas:
 *
 *  - Sin sesión            -> al login.
 *  - Con sesión y sin roles -> "tu cuenta no tiene permisos en TallerPro".
 *    No es un error: es alguien de la organización que no usa esta aplicación.
 *  - Con roles insuficientes -> "no tienes acceso a esta sección".
 */
export function ProtectedRoute({ children, seccion }: ProtectedRouteProps) {
  const { autenticado, tienePermisos, puedeVer, logout } = useAuth();

  if (!autenticado) {
    window.location.assign('/login');
    return null;
  }

  if (!tienePermisos) {
    return (
      <Aviso
        icono={<ShieldOff className="h-10 w-10 text-yellow-400" aria-hidden />}
        titulo="Tu cuenta no tiene permisos en TallerPro"
        detalle="Iniciaste sesión correctamente con tu cuenta corporativa, pero un administrador todavía no te asignó un rol en esta aplicación."
        accion={<Button variant="secondary" onClick={logout}>Cerrar sesión</Button>}
      />
    );
  }

  if (seccion && !puedeVer(seccion)) {
    return (
      <Aviso
        icono={<ShieldAlert className="h-10 w-10 text-red-400" aria-hidden />}
        titulo="No tienes acceso a esta sección"
        detalle="Tu rol no incluye esta parte del sistema. Si crees que deberías verla, pídele al administrador que revise tu rol."
      />
    );
  }

  return <>{children}</>;
}

function Aviso({
  icono,
  titulo,
  detalle,
  accion,
}: {
  icono: ReactNode;
  titulo: string;
  detalle: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      {icono}
      <h2 className="text-lg font-semibold text-gray-100">{titulo}</h2>
      <p className="max-w-md text-sm text-gray-400">{detalle}</p>
      {accion}
    </div>
  );
}
