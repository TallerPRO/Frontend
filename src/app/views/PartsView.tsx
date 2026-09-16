import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MockBanner } from '../../components/ui/MockBanner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CatalogTabs } from '../../components/catalog/CatalogTabs';
import { PartTable } from '../../components/catalog/PartTable';
import { PartFormModal } from '../../components/catalog/PartFormModal';
import { useParts } from '../../hooks/useCatalog';
import type { Part } from '../../types/catalog.types';

export function PartsView() {
  const { items, page, totalPages, loading, usingMock, filters, setFilters, setPage, save, remove } = useParts();
  const [editing, setEditing] = useState<Part | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Part | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(part: Part) {
    setEditing(part);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Catálogo"
        description="Servicios y repuestos disponibles para las órdenes"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo repuesto
          </Button>
        }
      />
      <CatalogTabs />
      <MockBanner visible={usingMock} />

      <Card className="mb-4">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
          <Input
            label="Buscar"
            placeholder="N° de parte, nombre o marca"
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ search: e.target.value || undefined })}
          />
          <label className="flex h-10 items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-500"
              checked={filters.lowStock ?? false}
              onChange={(e) => setFilters({ lowStock: e.target.checked || undefined })}
            />
            Solo stock bajo
          </label>
        </div>
      </Card>

      <PartTable
        parts={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <PartFormModal
        open={formOpen}
        part={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(dto) => save(dto, editing ?? undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar repuesto"
        description={`¿Eliminar "${deleting?.name}" del catálogo? Las órdenes existentes no se modifican.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={() => (deleting ? remove(deleting) : undefined)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
