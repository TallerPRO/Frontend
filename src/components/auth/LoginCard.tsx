import { AlertCircle } from 'lucide-react';
import { MicrosoftButton } from './MicrosoftButton';

export type LoginStatus = 'idle' | 'redirecting' | 'error';

interface LoginCardProps {
  status?: LoginStatus;
  errorMessage?: string | null;
  onLogin?: () => void;
}

// Componente puramente visual: no conoce MSAL ni ningún proveedor de auth.
// `onLogin`, `status` y `errorMessage` los controla quien lo integre.
export function LoginCard({ status = 'idle', errorMessage = null, onLogin }: LoginCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-[420px] rounded-[14px] border border-[#242F45] bg-navy-800 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/logo-tallerpro.svg" alt="" width={48} height={48} />
          <h1 className="text-lg font-semibold text-gray-100">Bienvenido a TallerPro</h1>
          <p className="text-sm text-gray-400">Sistema de gestión de órdenes de servicio</p>
        </div>

        {status === 'error' && errorMessage && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6">
          <MicrosoftButton redirecting={status === 'redirecting'} onClick={() => onLogin?.()} />
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Accede con tu cuenta corporativa. Se te pedirá confirmar con tu
          autenticador de Microsoft.
        </p>
      </div>
    </div>
  );
}
