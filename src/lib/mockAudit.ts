// Datos de muestra para Auditoría mientras el BFF no expone
// /api/audit/events. El hook cae a estos datos si la llamada falla.
import type { AuditEvent } from '../types/audit.types';

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'a1', action: 'STATUS_CHANGE', entityType: 'ORDER', entityId: '1', entityLabel: 'TP-2026-01291',
    actorId: 'u2', actorName: 'Carlos Muñoz', actorRole: 'Mecanico', ipAddress: '10.0.4.21', occurredAt: minutesAgo(4),
    changes: { status: { before: 'DIAGNOSTICADA', after: 'EN_REPARACION' } },
  },
  {
    id: 'a2', action: 'CREATE', entityType: 'ORDER', entityId: '9', entityLabel: 'TP-2026-01298',
    actorId: 'u1', actorName: 'María González', actorRole: 'JefeTaller', ipAddress: '10.0.4.10', occurredAt: minutesAgo(18),
    changes: { vehiclePlate: { before: null, after: 'KLRT88' }, clientName: { before: null, after: 'Rodrigo Pérez' } },
  },
  {
    id: 'a3', action: 'UPDATE', entityType: 'PART', entityId: 'p2', entityLabel: 'FLT-OIL-TY01',
    actorId: 'u3', actorName: 'Admin TallerPro', actorRole: 'Admin', ipAddress: '10.0.1.5', occurredAt: minutesAgo(41),
    changes: { stock: { before: 20, after: 12 }, unitPrice: { before: 8000, after: 8500 } },
  },
  {
    id: 'a4', action: 'LOGIN', entityType: 'SESSION', entityId: null, entityLabel: null,
    actorId: 'u4', actorName: 'Andrea Soto', actorRole: 'Mecanico', ipAddress: '10.0.4.33', occurredAt: minutesAgo(55),
    changes: null,
  },
  {
    id: 'a5', action: 'ACCESS_DENIED', entityType: 'USER', entityId: 'u5', entityLabel: 'cliente@correo.cl',
    actorId: 'u5', actorName: 'Rodrigo Pérez', actorRole: 'Cliente', ipAddress: '190.22.14.8', occurredAt: minutesAgo(73),
    changes: { section: { before: null, after: 'audit' } },
  },
  {
    id: 'a6', action: 'DELETE', entityType: 'SERVICE', entityId: 's11', entityLabel: 'SRV-0011',
    actorId: 'u3', actorName: 'Admin TallerPro', actorRole: 'Admin', ipAddress: '10.0.1.5', occurredAt: minutesAgo(120),
    changes: { active: { before: true, after: false } },
  },
  {
    id: 'a7', action: 'UPDATE', entityType: 'BAY', entityId: 'b3', entityLabel: 'A-03',
    actorId: 'u1', actorName: 'María González', actorRole: 'JefeTaller', ipAddress: '10.0.4.10', occurredAt: minutesAgo(190),
    changes: { status: { before: 'RESERVADA', after: 'DISPONIBLE' }, reason: { before: null, after: 'NO_SHOW' } },
  },
  {
    id: 'a8', action: 'STATUS_CHANGE', entityType: 'ORDER', entityId: '4', entityLabel: 'TP-2026-01287',
    actorId: 'u1', actorName: 'María González', actorRole: 'JefeTaller', ipAddress: '10.0.4.10', occurredAt: minutesAgo(260),
    changes: { status: { before: 'LISTA_RETIRO', after: 'ENTREGADA' }, finalCost: { before: null, after: 145000 } },
  },
  {
    id: 'a9', action: 'LOGOUT', entityType: 'SESSION', entityId: null, entityLabel: null,
    actorId: 'u2', actorName: 'Carlos Muñoz', actorRole: 'Mecanico', ipAddress: '10.0.4.21', occurredAt: minutesAgo(400),
    changes: null,
  },
  {
    id: 'a10', action: 'CREATE', entityType: 'SERVICE', entityId: 's12', entityLabel: 'SRV-0012',
    actorId: 'u3', actorName: 'Admin TallerPro', actorRole: 'Admin', ipAddress: '10.0.1.5', occurredAt: minutesAgo(1500),
    changes: { name: { before: null, after: 'Desabolladura y pintura (panel)' }, price: { before: null, after: 140000 } },
  },
];
