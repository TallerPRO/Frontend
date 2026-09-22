import { useEffect, useState } from 'react';
import { AuthCallback } from './AuthCallback';
import { azureConfigurado, getMsalInstance } from '../../auth/msalConfig';

/**
 * Procesa la vuelta del redirect de Microsoft.
 *
 * Azure manda al usuario a /auth/callback con el código en la URL; aquí se
 * canjea por los tokens (`handleRedirectPromise`), se fija la cuenta activa y
 * recién entonces se entra a la aplicación. Sin este paso el usuario se queda
 * mirando el spinner para siempre.
 */
export function AuthCallbackHandler() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (!azureConfigurado) {
      window.location.assign('/login');
      return;
    }

    (async () => {
      try {
        const msal = getMsalInstance();
        await msal.initialize();
        const resultado = await msal.handleRedirectPromise();

        // Tras el redirect la cuenta viene en el resultado; si alguien entra a
        // esta URL a mano, se cae a la cuenta que ya estuviera en caché.
        const cuenta = resultado?.account ?? msal.getAllAccounts()[0];
        if (!cuenta) {
          setStatus('error');
          setMensaje('No recibimos una sesión de Microsoft. Vuelve a iniciar sesión.');
          return;
        }

        msal.setActiveAccount(cuenta);
        window.location.assign('/app/dashboard');
      } catch (error) {
        // El mensaje de MSAL es el que sirve para diagnosticar (redirect URI mal
        // registrado, consentimiento faltante, etc.), así que se muestra tal cual.
        setStatus('error');
        setMensaje(error instanceof Error ? error.message : 'No pudimos completar el inicio de sesión.');
      }
    })();
  }, []);

  return (
    <AuthCallback
      status={status}
      errorMessage={mensaje}
      onRetry={() => window.location.assign('/login')}
    />
  );
}
