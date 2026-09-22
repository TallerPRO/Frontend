import type { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.PUBLIC_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.PUBLIC_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.PUBLIC_AZURE_POST_LOGOUT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [import.meta.env.PUBLIC_API_SCOPE],
};
