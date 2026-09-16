import { Modal } from '../ui/Modal';
import { AuditActionBadge } from './AuditActionBadge';
import { AUDIT_ENTITY_LABELS, type AuditEvent } from '../../types/audit.types';
import { formatDateTime } from '../../lib/formatters';

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

interface AuditEventDetailModalProps {
  event: AuditEvent | null;
  onClose: () => void;
}

export function AuditEventDetailModal({ event, onClose }: AuditEventDetailModalProps) {
  const changes = event?.changes ? Object.entries(event.changes) : [];

  return (
    <Modal open={event !== null} onClose={onClose} title="Detalle del evento" className="max-w-xl">
      {event && (
        <div className="flex flex-col gap-5 text-sm">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Acción</dt>
              <dd className="mt-1">
                <AuditActionBadge action={event.action} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Fecha</dt>
              <dd className="mt-1 text-gray-200">{formatDateTime(event.occurredAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Usuario</dt>
              <dd className="mt-1 text-gray-200">
                {event.actorName} <span className="text-gray-500">· {event.actorRole}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">IP</dt>
              <dd className="mt-1 font-mono text-xs text-gray-300">{event.ipAddress}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Entidad</dt>
              <dd className="mt-1 text-gray-200">
                {AUDIT_ENTITY_LABELS[event.entityType]}
                {event.entityLabel && <span className="ml-2 font-mono text-xs text-gray-400">{event.entityLabel}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">ID de evento</dt>
              <dd className="mt-1 font-mono text-xs text-gray-400">{event.id}</dd>
            </div>
          </dl>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Cambios</h3>
            {changes.length === 0 ? (
              <p className="text-xs text-gray-500">Este evento no registra cambios de datos.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-900 text-gray-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">Campo</th>
                      <th className="px-3 py-2 font-medium">Antes</th>
                      <th className="px-3 py-2 font-medium">Después</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {changes.map(([field, diff]) => (
                      <tr key={field}>
                        <td className="px-3 py-2 font-mono text-gray-300">{field}</td>
                        <td className="px-3 py-2 text-red-300/80 line-through">{formatValue(diff.before)}</td>
                        <td className="px-3 py-2 text-emerald-300">{formatValue(diff.after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
