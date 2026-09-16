import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { AuditQuery } from '../../api/audit.api';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  type AuditAction,
  type AuditEntity,
} from '../../types/audit.types';

const ACTION_OPTIONS = (Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map((value) => ({
  value,
  label: AUDIT_ACTION_LABELS[value],
}));

const ENTITY_OPTIONS = (Object.keys(AUDIT_ENTITY_LABELS) as AuditEntity[]).map((value) => ({
  value,
  label: AUDIT_ENTITY_LABELS[value],
}));

interface AuditFiltersProps {
  filters: AuditQuery;
  onChange: (filters: Partial<Omit<AuditQuery, 'page' | 'size'>>) => void;
}

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
  return (
    <Card className="mb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Usuario"
          placeholder="Nombre"
          value={filters.actor ?? ''}
          onChange={(e) => onChange({ actor: e.target.value || undefined })}
        />
        <Select
          label="Acción"
          placeholder="Todas"
          options={ACTION_OPTIONS}
          value={filters.action ?? ''}
          onChange={(e) => onChange({ action: (e.target.value || undefined) as AuditAction | undefined })}
        />
        <Select
          label="Entidad"
          placeholder="Todas"
          options={ENTITY_OPTIONS}
          value={filters.entityType ?? ''}
          onChange={(e) => onChange({ entityType: (e.target.value || undefined) as AuditEntity | undefined })}
        />
        <Input label="Desde" type="date" value={filters.from ?? ''} onChange={(e) => onChange({ from: e.target.value || undefined })} />
        <Input label="Hasta" type="date" value={filters.to ?? ''} onChange={(e) => onChange({ to: e.target.value || undefined })} />
      </div>
    </Card>
  );
}
