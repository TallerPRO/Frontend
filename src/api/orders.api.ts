import { apiClient } from './client';
import type { Page } from '../types/api.types';
import type {
  CreateOrderDTO,
  Order,
  OrderStatus,
  OrderTimelineEntry,
  UpdateOrderStatusDTO,
} from '../types/order.types';
import { workshopName } from '../lib/workshops';
import { uuidFromString } from '../lib/uuid';

// Adaptador hacia ms-tallerpro-jobs (vía gateway): /api/v1/ordenes.
// El backend habla en español y con UUIDs; aquí se traduce al modelo de las vistas.

const BASE = '/api/v1/ordenes';

/** Respuesta de ms-tallerpro-jobs (OrdenServicioResponse). */
export interface OrdenServicioResponse {
  id: string;
  tallerId: string;
  clienteId: string;
  clienteNombre: string;
  clienteContacto: string | null;
  vehiculoPatente: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoAnio: number | null;
  estado: OrderStatus;
  diagnostico: string | null;
  mecanicoId: string | null;
  mecanicoNombre: string | null;
  bahiaId: string | null;
  repuestosUtilizados: { repuestoId: string; nombre: string; cantidad: number }[];
  motivoAnulacion: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaDiagnostico: string | null;
  fechaEnReparacion: string | null;
  fechaListaRetiro: string | null;
  fechaEntrega: string | null;
  fechaAnulacion: string | null;
}

export function toOrder(o: OrdenServicioResponse): Order {
  const year = new Date(o.fechaCreacion).getFullYear();
  return {
    id: o.id,
    folio: `TP-${year}-${o.id.slice(0, 5).toUpperCase()}`,
    workshopId: o.tallerId,
    workshopName: workshopName(o.tallerId),
    vehiclePlate: o.vehiculoPatente,
    vehicleBrand: o.vehiculoMarca ?? '',
    vehicleModel: o.vehiculoModelo ?? '',
    vehicleYear: o.vehiculoAnio ?? 0,
    clientId: o.clienteId,
    clientName: o.clienteNombre,
    clientEmail: o.clienteContacto ?? '',
    assignedMechanicId: o.mecanicoId ?? undefined,
    assignedMechanicName: o.mecanicoNombre ?? undefined,
    status: o.estado,
    services: [],
    parts: (o.repuestosUtilizados ?? []).map((r) => ({
      partId: r.repuestoId,
      partName: r.nombre,
      partNumber: '',
      unitPrice: 0,
      quantity: r.cantidad ?? 1,
    })),
    diagnosisNotes: o.diagnostico ?? undefined,
    estimatedCost: 0,
    receivedAt: o.fechaCreacion,
    deliveredAt: o.fechaEntrega ?? undefined,
    createdBy: '',
    updatedAt: o.fechaActualizacion,
  };
}

/** El timeline se deriva de las fechas de cada estado que guarda la orden. */
export function toTimeline(o: OrdenServicioResponse): OrderTimelineEntry[] {
  const steps: { status: OrderStatus; at: string | null; notes?: string | null }[] = [
    { status: 'RECEPCIONADA', at: o.fechaCreacion },
    { status: 'DIAGNOSTICADA', at: o.fechaDiagnostico, notes: o.diagnostico },
    { status: 'EN_REPARACION', at: o.fechaEnReparacion },
    { status: 'LISTA_RETIRO', at: o.fechaListaRetiro },
    { status: 'ENTREGADA', at: o.fechaEntrega },
    { status: 'ANULADA', at: o.fechaAnulacion, notes: o.motivoAnulacion },
  ];
  return steps
    .filter((s): s is { status: OrderStatus; at: string; notes?: string | null } => !!s.at)
    .map((s) => ({
      id: `${o.id}-${s.status}`,
      status: s.status,
      notes: s.notes ?? undefined,
      changedBy: s.status === 'RECEPCIONADA' ? o.clienteNombre : (o.mecanicoNombre ?? 'Taller'),
      changedAt: s.at,
    }));
}

export interface OrdersQuery {
  status?: OrderStatus;
  workshopId?: string;
  page?: number;
  size?: number;
}

// jobs devuelve la lista completa (sin paginar); la paginación se resuelve aquí.
export async function listOrders(query: OrdersQuery = {}): Promise<Page<Order>> {
  const { data } = await apiClient.get<OrdenServicioResponse[]>(BASE, {
    params: { tallerId: query.workshopId, estado: query.status },
  });
  const size = query.size ?? 20;
  const page = query.page ?? 0;
  const ordered = [...data].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  return {
    content: ordered.slice(page * size, page * size + size).map(toOrder),
    totalElements: ordered.length,
    totalPages: Math.max(1, Math.ceil(ordered.length / size)),
    number: page,
    size,
  };
}

async function fetchOrden(id: string): Promise<OrdenServicioResponse> {
  const { data } = await apiClient.get<OrdenServicioResponse>(`${BASE}/${id}`);
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  return toOrder(await fetchOrden(id));
}

export async function getOrderTimeline(id: string): Promise<OrderTimelineEntry[]> {
  return toTimeline(await fetchOrden(id));
}

export async function createOrder(dto: CreateOrderDTO): Promise<Order> {
  const { data } = await apiClient.post<OrdenServicioResponse>(BASE, {
    tallerId: dto.workshopId,
    clienteId: await uuidFromString(dto.clientEmail),
    clienteNombre: dto.clientName,
    clienteContacto: dto.clientEmail,
    vehiculoPatente: dto.vehiclePlate,
    vehiculoMarca: dto.vehicleBrand,
    vehiculoModelo: dto.vehicleModel,
    vehiculoAnio: dto.vehicleYear,
  });
  return toOrder(data);
}

// La máquina de estados de jobs expone un endpoint por transición (RF-05).
export async function updateOrderStatus(id: string, dto: UpdateOrderStatusDTO): Promise<Order> {
  const notes = dto.notes?.trim();
  let response: OrdenServicioResponse;
  switch (dto.status) {
    case 'DIAGNOSTICADA':
      response = (await apiClient.post<OrdenServicioResponse>(`${BASE}/${id}/diagnostico`, {
        diagnostico: notes || 'Diagnóstico registrado desde la aplicación',
        repuestos: [],
      })).data;
      break;
    case 'EN_REPARACION':
      response = (await apiClient.post<OrdenServicioResponse>(`${BASE}/${id}/reparacion`, {
        observaciones: notes || null,
        repuestosAdicionales: [],
      })).data;
      break;
    case 'LISTA_RETIRO':
      response = (await apiClient.post<OrdenServicioResponse>(`${BASE}/${id}/lista-retiro`)).data;
      break;
    case 'ENTREGADA':
      response = (await apiClient.post<OrdenServicioResponse>(`${BASE}/${id}/entrega`)).data;
      break;
    case 'ANULADA':
      response = (await apiClient.post<OrdenServicioResponse>(`${BASE}/${id}/anulacion`, {
        motivo: notes || 'Anulada desde la aplicación',
      })).data;
      break;
    default:
      throw new Error(`Transición no soportada: ${dto.status}`);
  }
  return toOrder(response);
}

export async function cancelOrder(id: string, reason = 'Anulada desde la aplicación'): Promise<void> {
  await apiClient.post(`${BASE}/${id}/anulacion`, { motivo: reason });
}

/** RF-06: asigna mecánico y bahía (jobs reserva la bahía en catalog). */
export async function assignResources(
  id: string,
  body: { mechanicId: string; mechanicName?: string; bayId: string },
): Promise<Order> {
  const { data } = await apiClient.post<OrdenServicioResponse>(`${BASE}/${id}/asignacion`, {
    mecanicoId: body.mechanicId,
    mecanicoNombre: body.mechanicName,
    bahiaId: body.bayId,
  });
  return toOrder(data);
}
