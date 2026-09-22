import { Pencil, Trash2 } from 'lucide-react';
import { SERVICE_CATEGORY_LABELS, type Service } from '../../types/catalog.types';
import { Table, type Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/formatters';

interface ServiceTableProps {
  services: Service[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Sin estos callbacks la tabla queda en solo lectura (usuario sin permiso). */
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function ServiceTable({ services, loading, page, totalPages, onPageChange, onEdit, onDelete }: ServiceTableProps) {
  const columns: Column<Service>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (s) => <span className="font-mono text-xs text-gray-200">{s.code}</span>,
      sortable: true,
      sortValue: (s) => s.code,
    },
    {
      key: 'name',
      header: 'Servicio',
      render: (s) => (
        <div>
          <p className="text-gray-100">{s.name}</p>
          {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
        </div>
      ),
      sortable: true,
      sortValue: (s) => s.name,
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (s) => <Badge tone="blue">{SERVICE_CATEGORY_LABELS[s.category]}</Badge>,
      sortable: true,
      sortValue: (s) => s.category,
    },
    {
      key: 'estimatedMinutes',
      header: 'Duración',
      render: (s) => formatMinutes(s.estimatedMinutes),
      sortable: true,
      sortValue: (s) => s.estimatedMinutes,
    },
    {
      key: 'price',
      header: 'Precio',
      render: (s) => formatCurrency(s.price),
      sortable: true,
      sortValue: (s) => s.price,
    },
    {
      key: 'active',
      header: 'Estado',
      render: (s) => <Badge tone={s.active ? 'green' : 'neutral'}>{s.active ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (s) => !onEdit && !onDelete ? null : (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="h-8 px-2" aria-label={`Editar ${s.name}`} onClick={() => onEdit?.(s)}>
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2 text-red-400 hover:text-red-300"
            aria-label={`Eliminar ${s.name}`}
            onClick={() => onDelete?.(s)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={services}
      rowKey={(s) => s.id}
      loading={loading}
      emptyTitle="No hay servicios"
      emptyDescription="Ajusta los filtros o agrega un nuevo servicio al catálogo."
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
}
