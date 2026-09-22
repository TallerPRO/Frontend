import { LogLevel, PublicClientApplication, type Configuration } from '@azure/msal-browser';

// Configuración de MSAL contra el tenant corporativo. Los valores vienen del
// App Registration (ver Claude outputs/CONFIGURACION_MSAL_TENANT.md).

const clientId = import.meta.env.PUBLIC_AZURE_CLIENT_ID;
const tenantId = import.meta.env.PUBLIC_AZURE_TENANT_ID;
const apiScope = import.meta.env.PUBLIC_API_SCOPE;

/**
 * Mientras el tenant no esté configurado (los `.env` traen "pendiente"), la
 * aplicación funciona en modo demo: sin login real y con un rol elegible en
 * pantalla. Así el sistema sigue siendo usable y demostrable sin Azure, y
 * pasa a autenticación real con solo completar las variables.
 */
export const azureConfigurado =
  !!clientId && clientId !== 'pendiente' && !!tenantId && tenantId !== 'pendiente';

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? '',
    // Tenant único: no `common`, que aceptaría cuentas de cualquier organización.
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: import.meta.env.PUBLIC_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.PUBLIC_AZURE_POST_LOGOUT_URI,
  },
  cache: {
    // sessionStorage y no localStorage: la sesión muere al cerrar la pestaña,
    // que es lo correcto en equipos compartidos del taller.
    //
    // (La guía CONFIGURACION_MSAL_TENANT.md menciona `storeAuthStateInCookie` y
    // `navigateToLoginRequestUrl`; msal-browser 5 las eliminó y el flujo
    // redirect ya no las necesita.)
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Error,
      loggerCallback: (_level, message, containsPii) => {
        if (!containsPii) console.error(`[msal] ${message}`);
      },
    },
  },
};

/** Login: identidad + el scope de nuestra API, para que el token sirva de una. */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', apiScope].filter(Boolean) as string[],
};

/** Renovación silenciosa del access token que viaja al gateway. */
export const apiRequest = {
  scopes: [apiScope].filter(Boolean) as string[],
};

/**
 * Instancia única, creada de forma perezosa.
 *
 * No se construye al importar el módulo porque el build de Astro prerenderiza
 * las páginas en Node, donde no hay `window` y MSAL falla al instanciarse.
 * Solo se crea cuando alguien la pide, que siempre es en el navegador.
 */
let instancia: PublicClientApplication | null = null;

export function getMsalInstance(): PublicClientApplication {
  if (!instancia) instancia = new PublicClientApplication(msalConfig);
  return instancia;
}
