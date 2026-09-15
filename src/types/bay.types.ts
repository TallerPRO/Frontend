import type { OrderStatus } from './order.types';

// Una bahía es el puesto físico de trabajo donde se estaciona el vehículo
// mientras se ejecutan las reparaciones.
export type BayStatus = 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA';

export interface Bay {
  id: string;
  code: string; // "A-01" — único dentro del taller
  sector: string; // "Mecánica General", "Frenos y Suspensión", …
  workshopId: string;
  status: BayStatus;
  freeSince: string | null; // ISO — solo cuando status === 'DISPONIBLE'
  assignment: BayAssignment | null; // presente en RESERVADA y OCUPADA
}

// Datos que se muestran en el modal cuando la bahía NO está disponible.
export interface BayAssignment {
  reservationId: string;
  orderId: string;
  orderFolio: string; // "TP-2026-01291"
  orderStatus: OrderStatus;
  plate: string; // patente del vehículo
  vehicleLabel: string; // "Chevrolet Sail LT 2021"
  customerName: string;
  bodyType: 'SEDAN' | 'SUV'; // elige el ícono de vista superior
  startsAt: string; // ISO — inicio de trabajos
  endsAt: string; // ISO — término programado (RESERVADA) o estimado (OCUPADA)
  reservedBy: string; // quién creó la reserva
  mechanicName: string | null;
  progressPercent: number | null; // solo OCUPADA
}

export type CancelReservationReason =
  | 'CLIENTE_DESISTIO'
  | 'REPROGRAMADA_TALLER'
  | 'VEHICULO_NO_INGRESO'
  | 'ERROR_REGISTRO'
  | 'OTRO';

export const CANCEL_REASON_LABELS: Record<CancelReservationReason, string> = {
  CLIENTE_DESISTIO: 'El cliente desistió',
  REPROGRAMADA_TALLER: 'Reprogramada por el taller',
  VEHICULO_NO_INGRESO: 'El vehículo no ingresó',
  ERROR_REGISTRO: 'Error de registro',
  OTRO: 'Otro motivo',
};

export interface BayOccupancySummary {
  total: number;
  disponibles: number;
  reservadas: number;
  ocupadas: number;
  occupancyRate: number; // 0–100
  nextReleaseAt: string | null;
  nextReleaseBayCode: string | null;
}
