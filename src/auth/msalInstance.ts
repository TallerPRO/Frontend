import { PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

// Lazy singleton — se crea en el primer uso, no en tiempo de build de Astro.
let _instance: PublicClientApplication | null = null;
let _initPromise: Promise<AuthenticationResult | null> | null = null;

export function getMsalInstance(): PublicClientApplication {
  if (!_instance) {
    _instance = new PublicClientApplication(msalConfig);
  }
  return _instance;
}

/**
 * Secuencia obligatoria desde MSAL Browser v3+:
 *   1. initialize()             — registra event listeners internos
 *   2. handleRedirectPromise()  — procesa el regreso desde Azure AD
 *
 * Devuelve AuthenticationResult en la página de callback (login exitoso)
 * o null en el resto de páginas. Es idempotente: llamadas repetidas
 * devuelven la misma Promise.
 */
export function initializeMsal(): Promise<AuthenticationResult | null> {
  if (!_initPromise) {
    const instance = getMsalInstance();
    _initPromise = instance
      .initialize()
      .then(() => instance.handleRedirectPromise());
  }
  return _initPromise;
}
