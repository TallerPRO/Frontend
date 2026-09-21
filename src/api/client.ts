import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Cliente HTTP hacia el API Gateway (PUBLIC_BFF_BASE_URL). El frontend NUNCA llama
// a un microservicio por su puerto directo: todo pasa por el gateway.
export const apiClient = axios.create({
  baseURL: import.meta.env.PUBLIC_BFF_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Punto de enganche para el JWT: la integración MSAL registra aquí un proveedor de
// token (acquireTokenSilent). Mientras no exista, las llamadas van sin Authorization
// (el gateway y los microservicios deben estar con TALLERPRO_JWT_ENABLED=false).
type TokenProvider = () => Promise<string | null>;
let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider;
}

apiClient.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Formato de error que devuelven los microservicios: {timestamp, status, error, message, path}
// y el gateway (503): {title, detail, status} (problem+json).
export interface ApiErrorBody {
  message?: string;
  detail?: string;
  title?: string;
  status?: number;
}

export function errorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return body?.message ?? body?.detail ?? error.message ?? fallback;
  }
  return fallback;
}

// Contrato de errores (ARQUITECTURA_ACCESO.md §8). El 401 lo resuelve la capa de auth
// (acquireTokenSilent / redirect a login) cuando se integre MSAL; aquí solo se avisa.
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    if (status === 403) {
      toast.error('No tienes permisos para esta acción');
    } else if (status === 503) {
      toast.error('Servicio no disponible. Intenta nuevamente en unos instantes.');
    } else if (!error.response) {
      toast.error('No se pudo conectar con el servidor');
    }
    return Promise.reject(error);
  },
);
