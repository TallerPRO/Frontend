import { AUDIT_ENTITY_LABELS, type AuditEvent } from '../../types/audit.types';
import { Table, type Column } from '../ui/Table';
import { AuditActionBadge } from './AuditActionBadge';
import { formatDateTime } from '../../lib/formatters';

interface AuditTableProps {
  events: AuditEvent[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (event: AuditEvent) => void;
}

export function AuditTable({ events, loading, page, totalPages, onPageChange, onRowClick }: AuditTableProps) {
  const columns: Column<AuditEvent>[] = [
    {
      key: 'occurredAt',
      header: 'Fecha',
      render: (e) => <span className="whitespace-nowrap text-gray-300">{formatDateTime(e.occurredAt)}</span>,
      sortable: true,
      sortValue: (e) => e.occurredAt,
    },
    {
      key: 'actor',
      header: 'Usuario',
      render: (e) => (
        <div>
          <p className="text-gray-100">{e.actorName}</p>
          <p className="text-xs text-gray-500">{e.actorRole}</p>
        </div>
      ),
      sortable: true,
      sortValue: (e) => e.actorName,
    },
    {
      key: 'action',
      header: 'Acción',
      render: (e) => <AuditActionBadge action={e.action} />,
    },
    {
      key: 'entity',
      header: 'Entidad',
      render: (e) => (
        <div>
          <p className="text-gray-200">{AUDIT_ENTITY_LABELS[e.entityType]}</p>
          {e.entityLabel && <p className="font-mono text-xs text-gray-500">{e.entityLabel}</p>}
        </div>
      ),
      sortable: true,
      sortValue: (e) => e.entityType,
    },
    {
      key: 'ip',
      header: 'IP',
      render: (e) => <span className="font-mono text-xs text-gray-400">{e.ipAddress}</span>,
    },
  ];

  return (
    <Table
      columns={columns}
      data={events}
      rowKey={(e) => e.id}
      loading={loading}
      emptyTitle="Sin eventos"
      emptyDescription="No hay actividad registrada para los filtros seleccionados."
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
    />
  );
}
