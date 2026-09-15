// Contrato de paginación estándar del BFF (Page de Spring).
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual, 0-indexed
  size: number;
}
