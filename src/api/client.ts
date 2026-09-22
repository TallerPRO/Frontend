import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Cliente HTTP hacia el API Gateway (PUBLIC_BFF_BASE_URL). El frontend NUNCA llama
// a un microservicio por su puerto directo: todo pasa por el gateway.
export const apiClient = axios.create({
  baseURL: import.meta.env.PUBLIC_BFF_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Punto de enganche para el JWT: AuthProvider registra aquí acquireTokenSilent
// cuando el tenant está configurado. Sin proveedor, las llamadas van sin
// Authorization y el backend debe estar con TALLERPRO_JWT_ENABLED=false.
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

// Handler de sesión expirada (401). Lo registra AuthProvider con
// acquireTokenRedirect: solo el usuario puede resolver un 401 volviendo a
// autenticarse, así que no tiene sentido reintentar la llamada.
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;
let reautenticando = false;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler;
  reautenticando = false;
}

/**
 * Una pantalla dispara varias llamadas a la vez; si todas fallan con 401 y cada
 * una pide un redirect, MSAL rechaza las siguientes con `interaction_in_progress`.
 * Solo la primera relanza la autenticación.
 */
function relanzarAutenticacion() {
  if (reautenticando) return;
  reautenticando = true;
  onSessionExpired?.();
}

// Contrato de errores (Caso/message.txt §8): 401 sesión, 403 rol insuficiente,
// 503 microservicio caído.
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    if (status === 401) {
      toast.error('Tu sesión expiró. Vuelve a iniciar sesión.');
      relanzarAutenticacion();
    } else if (status === 403) {
      toast.error('No tienes permisos para esta acción');
    } else if (status === 503) {
      toast.error('Servicio no disponible. Intenta nuevamente en unos instantes.');
    } else if (!error.response) {
      toast.error('No se pudo conectar con el servidor');
    }
    return Promise.reject(error);
  },
);
