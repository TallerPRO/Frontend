import { Button } from '../ui/Button';

interface NoPermissionsScreenProps {
  onLogout?: () => void;
}

export function NoPermissionsScreen({ onLogout }: NoPermissionsScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-900 px-6 text-center">
      <h1 className="text-lg font-semibold text-gray-100">
        Tu cuenta no tiene permisos asignados en TallerPro
      </h1>
      <p className="max-w-sm text-sm text-gray-400">
        Tu correo institucional es válido, pero no tiene un rol asignado en la
        aplicación. Contacta a un administrador para que te asigne uno.
      </p>
      <Button variant="secondary" onClick={() => onLogout?.()}>
        Cerrar sesión
      </Button>
    </div>
  );
}
