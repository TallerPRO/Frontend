import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { MockBanner } from '../../components/ui/MockBanner';
import { AuditFilters } from '../../components/audit/AuditFilters';
import { AuditTable } from '../../components/audit/AuditTable';
import { AuditEventDetailModal } from '../../components/audit/AuditEventDetailModal';
import { useAudit } from '../../hooks/useAudit';
import { downloadCsv } from '../../lib/csv';
import { formatDateTime } from '../../lib/formatters';
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS, type AuditEvent } from '../../types/audit.types';

export function AuditView() {
  const { events, page, totalPages, loading, usingMock, filters, setFilters, setPage, refetch } = useAudit();
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  function exportCsv() {
    downloadCsv(
      `tallerpro-auditoria-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Fecha', 'Usuario', 'Rol', 'Acción', 'Entidad', 'Referencia', 'IP'],
      events.map((e) => [
        formatDateTime(e.occurredAt),
        e.actorName,
        e.actorRole,
        AUDIT_ACTION_LABELS[e.action],
        AUDIT_ENTITY_LABELS[e.entityType],
        e.entityLabel ?? '',
        e.ipAddress,
      ]),
    );
  }

  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Log de eventos del sistema"
        actions={
          <>
            <Button variant="ghost" onClick={refetch} disabled={loading} aria-label="Actualizar">
              <RefreshCw className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="secondary" onClick={exportCsv} disabled={loading || events.length === 0}>
              <Download className="h-4 w-4" aria-hidden />
              Exportar página
            </Button>
          </>
        }
      />
      <MockBanner visible={usingMock} />
      <AuditFilters filters={filters} onChange={setFilters} />

      <AuditTable
        events={events}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={setSelected}
      />

      <AuditEventDetailModal event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
