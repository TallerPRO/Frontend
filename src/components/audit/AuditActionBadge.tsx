import { Badge } from '../ui/Badge';
import { AUDIT_ACTION_LABELS, type AuditAction } from '../../types/audit.types';

const TONES: Record<AuditAction, 'green' | 'blue' | 'red' | 'purple' | 'neutral' | 'yellow'> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  STATUS_CHANGE: 'purple',
  LOGIN: 'neutral',
  LOGOUT: 'neutral',
  ACCESS_DENIED: 'yellow',
};

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return <Badge tone={TONES[action]}>{AUDIT_ACTION_LABELS[action]}</Badge>;
}
