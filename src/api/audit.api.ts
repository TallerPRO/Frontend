import { apiClient } from './client';
import type { Page } from '../types/api.types';
import type { AuditAction, AuditEntity, AuditEvent } from '../types/audit.types';

export interface AuditQuery {
  action?: AuditAction;
  entityType?: AuditEntity;
  actor?: string; // búsqueda libre por nombre
  from?: string; // ISO date
  to?: string;
  page?: number;
  size?: number;
}

export async function listAuditEvents(query: AuditQuery = {}): Promise<Page<AuditEvent>> {
  const { data } = await apiClient.get<Page<AuditEvent>>('/api/audit/events', { params: query });
  return data;
}

export async function getAuditEvent(id: string): Promise<AuditEvent> {
  const { data } = await apiClient.get<AuditEvent>(`/api/audit/events/${id}`);
  return data;
}
