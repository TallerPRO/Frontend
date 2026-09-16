// Catálogo maestro de servicios y repuestos que se agregan a las órdenes.

export type ServiceCategory =
  | 'MANTENCION'
  | 'FRENOS'
  | 'SUSPENSION'
  | 'MOTOR'
  | 'ELECTRICO'
  | 'CARROCERIA'
  | 'DIAGNOSTICO';

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  MANTENCION: 'Mantención',
  FRENOS: 'Frenos',
  SUSPENSION: 'Suspensión',
  MOTOR: 'Motor',
  ELECTRICO: 'Eléctrico',
  CARROCERIA: 'Carrocería',
  DIAGNOSTICO: 'Diagnóstico',
};

export interface Service {
  id: string;
  code: string; // "SRV-0001"
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  estimatedMinutes: number;
  active: boolean;
  updatedAt: string; // ISO 8601
}

export interface ServiceDTO {
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  estimatedMinutes: number;
  active: boolean;
}

export interface Part {
  id: string;
  partNumber: string; // código de fabricante, ej. "BR-4521-T"
  name: string;
  brand: string;
  unitPrice: number;
  stock: number;
  minStock: number; // bajo este umbral se marca "stock bajo"
  active: boolean;
  updatedAt: string;
}

export interface PartDTO {
  partNumber: string;
  name: string;
  brand: string;
  unitPrice: number;
  stock: number;
  minStock: number;
  active: boolean;
}
