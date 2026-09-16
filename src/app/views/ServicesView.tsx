import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { MockBanner } from '../../components/ui/MockBanner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CatalogTabs } from '../../components/catalog/CatalogTabs';
import { ServiceTable } from '../../components/catalog/ServiceTable';
import { ServiceFormModal } from '../../components/catalog/ServiceFormModal';
import { useServices } from '../../hooks/useCatalog';
import { SERVICE_CATEGORY_LABELS, type Service, type ServiceCategory } from '../../types/catalog.types';

const CATEGORY_OPTIONS = (Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategory[]).map((value) => ({
  value,
  label: SERVICE_CATEGORY_LABELS[value],
}));

export function ServicesView() {
  const { items, page, totalPages, loading, usingMock, filters, setFilters, setPage, save, remove } = useServices();
  const [editing, setEditing] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Service | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
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
            Nuevo servicio
          </Button>
        }
      />
      <CatalogTabs />
      <MockBanner visible={usingMock} />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Buscar"
            placeholder="Código o nombre"
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ search: e.target.value || undefined })}
          />
          <Select
            label="Categoría"
            placeholder="Todas las categorías"
            options={CATEGORY_OPTIONS}
            value={filters.category ?? ''}
            onChange={(e) => setFilters({ category: (e.target.value || undefined) as ServiceCategory | undefined })}
          />
        </div>
      </Card>

      <ServiceTable
        services={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <ServiceFormModal
        open={formOpen}
        service={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(dto) => save(dto, editing ?? undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar servicio"
        description={`¿Eliminar "${deleting?.name}" del catálogo? Las órdenes existentes no se modifican.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={() => (deleting ? remove(deleting) : undefined)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
