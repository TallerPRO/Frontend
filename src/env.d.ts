/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_AZURE_CLIENT_ID: string;
  readonly PUBLIC_AZURE_TENANT_ID: string;
  readonly PUBLIC_AZURE_REDIRECT_URI: string;
  readonly PUBLIC_AZURE_POST_LOGOUT_URI: string;
  readonly PUBLIC_BFF_BASE_URL: string;
  readonly PUBLIC_API_SCOPE: string;
  readonly PUBLIC_ENABLE_AUDIT: string;
  readonly PUBLIC_ENABLE_REPORTS: string;
  /** JSON: [{"id":"<uuid>","name":"Providencia"}, ...] */
  readonly PUBLIC_WORKSHOPS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
