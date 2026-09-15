import axios from 'axios';

// Cliente HTTP base, sin auth: el interceptor que adjunta el JWT (y el
// manejo de 401) se agrega junto con la integración del login.
export const apiClient = axios.create({
  baseURL: import.meta.env.PUBLIC_BFF_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
