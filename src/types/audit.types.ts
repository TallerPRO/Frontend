// Log inmutable de eventos del sistema. Solo lectura desde el frontend.

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ACCESS_DENIED';

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  DELETE: 'Eliminación',
  STATUS_CHANGE: 'Cambio de estado',
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  ACCESS_DENIED: 'Acceso denegado',
};

export type AuditEntity = 'ORDER' | 'BAY' | 'SERVICE' | 'PART' | 'USER' | 'SESSION';

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  ORDER: 'Orden',
  BAY: 'Bahía',
  SERVICE: 'Servicio',
  PART: 'Repuesto',
  USER: 'Usuario',
  SESSION: 'Sesión',
};

export interface AuditEvent {
  id: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string | null;
  entityLabel: string | null; // ej. folio de la orden o código de la bahía
  actorId: string;
  actorName: string;
  actorRole: string;
  ipAddress: string;
  occurredAt: string; // ISO 8601
  // Diff serializado por el BFF: valores previos/nuevos por campo.
  changes: Record<string, { before: unknown; after: unknown }> | null;
}
