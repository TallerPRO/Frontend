import { apiClient } from './client';
import type { Bay, BayAssignment, BayOccupancySummary, CancelReservationReason } from '../types/bay.types';
import { DEFAULT_WORKSHOP_ID } from '../lib/workshops';
import { toOrder, type OrdenServicioResponse } from './orders.api';

// Adaptador hacia ms-tallerpro-catalog (vía gateway): /api/v1/talleres/{tallerId}/bahias.
// Las bahías pertenecen a un taller, así que todas las rutas llevan el tallerId.

/** Respuesta de catalog (BahiaResponse). */
interface BahiaResponse {
  id: string;
  tallerId: string;
  codigo: string;
  sector: string;
  estado: 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA';
  ordenId: string | null;
  inicioProgramado: string | null;
  terminoProgramado: string | null;
  libreDesde: string | null;
  activa: boolean;
  fechaActualizacion: string;
}

interface ResumenOcupacion {
  tallerId: string;
  total: number;
  disponibles: number;
  reservadas: number;
  ocupadas: number;
  tasaOcupacion: number;
  proximaLiberacion: string | null;
  proximaLiberacionCodigo: string | null;
}

const base = (workshopId?: string) => `/api/v1/talleres/${workshopId ?? DEFAULT_WORKSHOP_ID}/bahias`;

// catalog solo guarda el ordenId; los datos del vehículo/cliente se completan
// consultando la orden en jobs (una llamada por bahía ocupada, cacheada por id).
async function buildAssignment(b: BahiaResponse, cache: Map<string, Promise<OrdenServicioResponse | null>>): Promise<BayAssignment | null> {
  if (!b.ordenId) return null;
  if (!cache.has(b.ordenId)) {
    cache.set(
      b.ordenId,
      apiClient
        .get<OrdenServicioResponse>(`/api/v1/ordenes/${b.ordenId}`)
        .then((r) => r.data)
        .catch(() => null),
    );
  }
  const orden = await cache.get(b.ordenId)!;
  const order = orden ? toOrder(orden) : null;
  return {
    reservationId: b.id, // catalog no tiene entidad "reserva": la bahía misma es la reserva
    orderId: b.ordenId,
    orderFolio: order?.folio ?? b.ordenId.slice(0, 8).toUpperCase(),
    orderStatus: order?.status ?? 'RECEPCIONADA',
    plate: order?.vehiclePlate ?? '—',
    vehicleLabel: order ? `${order.vehicleBrand} ${order.vehicleModel} ${order.vehicleYear || ''}`.trim() : '—',
    customerName: order?.clientName ?? '—',
    bodyType: 'SEDAN',
    startsAt: b.inicioProgramado ?? b.fechaActualizacion,
    endsAt: b.terminoProgramado ?? b.inicioProgramado ?? b.fechaActualizacion,
    reservedBy: order?.assignedMechanicName ?? 'Jefe de taller',
    mechanicName: order?.assignedMechanicName ?? null,
    progressPercent: null,
  };
}

async function toBay(b: BahiaResponse, cache: Map<string, Promise<OrdenServicioResponse | null>>): Promise<Bay> {
  return {
    id: b.id,
    code: b.codigo,
    sector: b.sector,
    workshopId: b.tallerId,
    status: b.estado,
    freeSince: b.estado === 'DISPONIBLE' ? b.libreDesde : null,
    assignment: await buildAssignment(b, cache),
  };
}

export async function listBays(workshopId?: string): Promise<Bay[]> {
  const { data } = await apiClient.get<BahiaResponse[]>(base(workshopId));
  const cache = new Map<string, Promise<OrdenServicioResponse | null>>();
  return Promise.all(data.filter((b) => b.activa).map((b) => toBay(b, cache)));
}

export async function getBaysSummary(workshopId?: string): Promise<BayOccupancySummary> {
  const { data } = await apiClient.get<ResumenOcupacion>(`${base(workshopId)}/resumen`);
  return {
    total: data.total,
    disponibles: data.disponibles,
    reservadas: data.reservadas,
    ocupadas: data.ocupadas,
    occupancyRate: data.tasaOcupacion,
    nextReleaseAt: data.proximaLiberacion,
    nextReleaseBayCode: data.proximaLiberacionCodigo,
  };
}

export async function getBay(id: string, workshopId?: string): Promise<Bay> {
  const { data } = await apiClient.get<BahiaResponse>(`${base(workshopId)}/${id}`);
  return toBay(data, new Map());
}

export async function reserveBay(
  id: string,
  body: { orderId: string; startsAt: string; endsAt: string },
  workshopId?: string,
): Promise<Bay> {
  const { data } = await apiClient.post<BahiaResponse>(`${base(workshopId)}/${id}/reserva`, {
    ordenId: body.orderId,
    inicioProgramado: body.startsAt,
    terminoProgramado: body.endsAt,
  });
  return toBay(data, new Map());
}

// Cancelar la reserva = liberar la bahía. El motivo queda registrado en el
// log del cliente; catalog no lo persiste (solo cambia el estado).
export async function cancelReservation(
  bayId: string,
  _reservationId: string,
  body: { reason: CancelReservationReason; comment?: string },
  workshopId?: string,
): Promise<void> {
  console.info(`Reserva de bahía ${bayId} cancelada: ${body.reason}${body.comment ? ` — ${body.comment}` : ''}`);
  await apiClient.post(`${base(workshopId)}/${bayId}/liberacion`);
}

/** RESERVADA -> OCUPADA (ingreso físico del vehículo). */
export async function checkInBay(id: string, workshopId?: string): Promise<Bay> {
  const { data } = await apiClient.post<BahiaResponse>(`${base(workshopId)}/${id}/ocupacion`);
  return toBay(data, new Map());
}

/** OCUPADA -> DISPONIBLE (término de trabajos). */
export async function releaseBay(id: string, workshopId?: string): Promise<Bay> {
  const { data } = await apiClient.post<BahiaResponse>(`${base(workshopId)}/${id}/liberacion`);
  return toBay(data, new Map());
}
