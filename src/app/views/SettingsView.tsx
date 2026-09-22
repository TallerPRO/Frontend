import { useState } from 'react';
import { Pencil, Plus, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, type Column } from '../../components/ui/Table';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BayFormModal } from '../../components/settings/BayFormModal';
import { useBayAdmin } from '../../hooks/useBayAdmin';
import { errorMessage } from '../../api/client';
import { DEFAULT_WORKSHOP_ID, WORKSHOP_OPTIONS, workshopName } from '../../lib/workshops';
import type { Bay, BayDTO, BayStatus } from '../../types/bay.types';

const STATUS_LABELS: Record<BayStatus, string> = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  OCUPADA: 'Ocupada',
};

// Mismos colores que el mapa de bahías: verde libre, amarillo reservada, rojo ocupada.
const STATUS_TONES: Record<BayStatus, 'green' | 'yellow' | 'red'> = {
  DISPONIBLE: 'green',
  RESERVADA: 'yellow',
  OCUPADA: 'red',
};

// Configuración del taller. Por ahora administra las bahías; las siguientes
// secciones (usuarios, parámetros) se agregan como tarjetas nuevas aquí.
export function SettingsView() {
  const [workshopId, setWorkshopId] = useState(DEFAULT_WORKSHOP_ID);
  const { bays, loading, error, save, deactivate, usedCodes } = useBayAdmin(workshopId);
  const [editing, setEditing] = useState<Bay | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<Bay | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(bay: Bay) {
    setEditing(bay);
    setFormOpen(true);
  }

  async function handleSave(dto: BayDTO) {
    try {
      await save(dto, editing ?? undefined);
    } catch (err) {
      // El backend puede rechazar por código duplicado o por falta de rol Admin.
      toast.error(errorMessage(err, 'No pudimos guardar la bahía.'));
      throw err;
    }
  }

  async function handleDeactivate() {
    if (!deactivating) return;
    try {
      await deactivate(deactivating);
    } catch (err) {
      toast.error(errorMessage(err, 'No pudimos dar de baja la bahía.'));
    } finally {
      setDeactivating(null);
    }
  }

  const columns: Column<Bay>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      sortValue: (b) => b.code,
      render: (b) => <span className="font-medium text-gray-100">{b.code}</span>,
    },
    { key: 'sector', header: 'Sector', sortable: true, sortValue: (b) => b.sector, render: (b) => b.sector },
    {
      key: 'status',
      header: 'Estado',
      render: (b) => <Badge tone={STATUS_TONES[b.status]}>{STATUS_LABELS[b.status]}</Badge>,
    },
    {
      key: 'active',
      header: 'En servicio',
      render: (b) => (b.active ? <Badge tone="emerald">Sí</Badge> : <Badge tone="red">Fuera de servicio</Badge>),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openEdit(b)} aria-label={`Editar bahía ${b.code}`}>
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            disabled={!b.active}
            onClick={() => setDeactivating(b)}
            aria-label={`Dar de baja la bahía ${b.code}`}
          >
            <PowerOff className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Administra las bahías de trabajo del taller"
        actions={
          <>
            <Select
              options={WORKSHOP_OPTIONS}
              value={workshopId}
              onChange={(e) => setWorkshopId(e.target.value)}
              aria-label="Taller"
              className="w-44"
            />
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden />
              Nueva bahía
            </Button>
          </>
        }
      />

      <ErrorBanner message={error} />

      <Card>
        <CardHeader>
          <CardTitle>Bahías de {workshopName(workshopId)}</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-gray-400">
          Una bahía dada de baja deja de ofrecerse para reservas, pero conserva su historial. Solo se puede dar de baja
          una bahía que no esté ocupada.
        </p>
        <Table
          columns={columns}
          data={bays}
          rowKey={(b) => b.id}
          loading={loading}
          emptyTitle="Sin bahías"
          emptyDescription="Crea la primera bahía de este taller con el botón «Nueva bahía»."
        />
      </Card>

      <BayFormModal
        open={formOpen}
        bay={editing}
        usedCodes={usedCodes(editing?.id)}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={deactivating !== null}
        title="Dar de baja la bahía"
        description={`¿Dejar la bahía ${deactivating?.code ?? ''} fuera de servicio? Podrás volver a habilitarla editándola.`}
        confirmLabel="Dar de baja"
        danger
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </>
  );
}
