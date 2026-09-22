export type OrderStatus =
  | 'RECEPCIONADA'
  | 'DIAGNOSTICADA'
  | 'EN_REPARACION'
  | 'LISTA_RETIRO'
  | 'ENTREGADA'
  | 'ANULADA';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'RECEPCIONADA',
  'DIAGNOSTICADA',
  'EN_REPARACION',
  'LISTA_RETIRO',
  'ENTREGADA',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEPCIONADA: 'Recepcionada',
  DIAGNOSTICADA: 'Diagnosticada',
  EN_REPARACION: 'En reparación',
  LISTA_RETIRO: 'Lista para retiro',
  ENTREGADA: 'Entregada',
  ANULADA: 'Anulada',
};

// Ítems cobrables de la orden. Los precios los congela ms-tallerpro-jobs al
// aplicarlos, tomándolos del catálogo: el front nunca los calcula ni los envía.
export interface OrderService {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPart {
  partId: string;
  partName: string;
  partNumber: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  folio: string; // ej: "TP-2026-00123"
  workshopId: string;
  workshopName: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  clientId: string;
  clientName: string;
  clientEmail: string;
  assignedMechanicId?: string;
  assignedMechanicName?: string;
  status: OrderStatus;
  /** Bahía reservada para el vehículo (RF-06). */
  bayId?: string;
  services: OrderService[];
  parts: OrderPart[];
  diagnosisNotes?: string;
  estimatedCost: number;
  /** Monto a cobrar: repuestos + servicios, calculado por el backend. */
  total: number;
  finalCost?: number;
  receivedAt: string; // ISO 8601
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdBy: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  workshopId: string;
  /** Bahía que se reserva al recepcionar el vehículo (obligatoria en recepción). */
  bayId: string;
  /** Mecánico a cargo, elegido del equipo del taller (obligatorio en recepción). */
  mechanicId: string;
  mechanicName: string;
  mechanicEmail: string;
  clientPhone: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  clientName: string;
  clientEmail: string;
  services: { serviceId: string; quantity: number }[];
  parts: { partId: string; quantity: number }[];
  diagnosisNotes?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  notes?: string;
}

export interface OrderTimelineEntry {
  id: string;
  status: OrderStatus;
  notes?: string;
  changedBy: string;
  changedAt: string;
}
