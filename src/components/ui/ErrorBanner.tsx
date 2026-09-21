import { AlertCircle } from 'lucide-react';

// Aviso de error de carga (el backend respondio con error o no esta disponible).
export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      {message}
    </div>
  );
}
