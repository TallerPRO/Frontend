import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import type { Part } from '../../types/catalog.types';
import { Table, type Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/cn';

interface PartTableProps {
  parts: Part[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (part: Part) => void;
  onDelete: (part: Part) => void;
}

export function PartTable({ parts, loading, page, totalPages, onPageChange, onEdit, onDelete }: PartTableProps) {
  const columns: Column<Part>[] = [
    {
      key: 'partNumber',
      header: 'N° de parte',
      render: (p) => <span className="font-mono text-xs text-gray-200">{p.partNumber}</span>,
      sortable: true,
      sortValue: (p) => p.partNumber,
    },
    {
      key: 'name',
      header: 'Repuesto',
      render: (p) => (
        <div>
          <p className="text-gray-100">{p.name}</p>
          <p className="text-xs text-gray-500">{p.brand}</p>
        </div>
      ),
      sortable: true,
      sortValue: (p) => p.name,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => {
        const low = p.stock < p.minStock;
        return (
          <span className={cn('inline-flex items-center gap-1', low && 'text-yellow-300')}>
            {low && <AlertTriangle className="h-3.5 w-3.5" aria-label="Stock bajo" />}
            {p.stock}
            <span className="text-xs text-gray-500">/ mín. {p.minStock}</span>
          </span>
        );
      },
      sortable: true,
      sortValue: (p) => p.stock,
    },
    {
      key: 'unitPrice',
      header: 'Precio unitario',
      render: (p) => formatCurrency(p.unitPrice),
      sortable: true,
      sortValue: (p) => p.unitPrice,
    },
    {
      key: 'active',
      header: 'Estado',
      render: (p) => <Badge tone={p.active ? 'green' : 'neutral'}>{p.active ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" className="h-8 px-2" aria-label={`Editar ${p.name}`} onClick={() => onEdit(p)}>
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2 text-red-400 hover:text-red-300"
            aria-label={`Eliminar ${p.name}`}
            onClick={() => onDelete(p)}
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
      data={parts}
      rowKey={(p) => p.id}
      loading={loading}
      emptyTitle="No hay repuestos"
      emptyDescription="Ajusta los filtros o agrega un nuevo repuesto al catálogo."
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
}
