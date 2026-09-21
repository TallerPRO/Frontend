import { apiClient } from './client';
import type { Page } from '../types/api.types';
import type { AuditAction, AuditEntity, AuditEvent } from '../types/audit.types';
import type { OrderStatus } from '../types/order.types';

// Adaptador hacia ms-tallerpro-audit (vía gateway): /api/audit/timeline.
// El backend registra exclusivamente cambios de estado de órdenes (alimentado por
// Kafka desde jobs), así que todos los eventos son STATUS_CHANGE sobre ORDER.

interface TimelineEntry {
  eventId: string;
  orderId: string;
  tallerId: string;
  eventType: OrderStatus;
  actorId: string;
  actorName: string;
  actorRole: string;
  eventTimestamp: string;
  recordedAt: string;
}

interface TimelinePage {
  content: TimelineEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  JEFE_TALLER: 'JefeTaller',
  MECANICO: 'Mecanico',
  CLIENTE: 'Cliente',
  SISTEMA: 'Sistema',
};

function toAuditEvent(e: TimelineEntry): AuditEvent {
  return {
    id: e.eventId,
    action: 'STATUS_CHANGE',
    entityType: 'ORDER',
    entityId: e.orderId,
    entityLabel: `TP-${new Date(e.eventTimestamp).getFullYear()}-${e.orderId.slice(0, 5).toUpperCase()}`,
    actorId: e.actorId,
    actorName: e.actorName,
    actorRole: ROLE_LABELS[e.actorRole] ?? e.actorRole,
    ipAddress: '—',
    occurredAt: e.eventTimestamp,
    changes: { estado: { before: null, after: e.eventType } },
  };
}

export interface AuditQuery {
  action?: AuditAction;
  entityType?: AuditEntity;
  actor?: string; // id del actor (oid)
  orderId?: string;
  eventType?: OrderStatus;
  from?: string; // ISO date
  to?: string;
  page?: number;
  size?: number;
}

const EMPTY = (page: number, size: number): Page<AuditEvent> => ({ content: [], totalElements: 0, totalPages: 0, number: page, size });

export async function listAuditEvents(query: AuditQuery = {}): Promise<Page<AuditEvent>> {
  const page = query.page ?? 0;
  const size = query.size ?? 20;
  // Filtros que el backend no puede satisfacer: no hay eventos de ese tipo.
  if ((query.action && query.action !== 'STATUS_CHANGE') || (query.entityType && query.entityType !== 'ORDER')) {
    return EMPTY(page, size);
  }
  const { data } = await apiClient.get<TimelinePage>('/api/audit/timeline', {
    params: {
      orderId: query.orderId,
      actorId: query.actor || undefined,
      eventType: query.eventType,
      from: query.from ? `${query.from}T00:00:00Z` : undefined,
      to: query.to ? `${query.to}T23:59:59Z` : undefined,
      page,
      size,
    },
  });
  return {
    content: data.content.map(toAuditEvent),
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    number: data.page,
    size: data.size,
  };
}

/** Timeline completo de una orden (quién la recepcionó, diagnosticó, reparó y entregó). */
export async function getOrderAuditTimeline(orderId: string): Promise<AuditEvent[]> {
  const { data } = await apiClient.get<{ events: TimelineEntry[] }>(`/api/audit/orders/${orderId}/timeline`);
  return data.events.map(toAuditEvent);
}

// El backend no expone un evento por id; se busca en la primera página filtrando
// por la orden que viene codificada en el id no es posible, así que se pagina.
export async function getAuditEvent(id: string): Promise<AuditEvent> {
  for (let page = 0; page < 20; page++) {
    const result = await listAuditEvents({ page, size: 100 });
    const found = result.content.find((e) => e.id === id);
    if (found) return found;
    if (page + 1 >= result.totalPages) break;
  }
  throw new Error(`Evento de auditoría ${id} no encontrado`);
}
