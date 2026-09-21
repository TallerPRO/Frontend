// Talleres de la red. El backend identifica cada taller por UUID (tallerId) y no
// expone (todavía) un catálogo de talleres, así que la lista vive en la variable
// PUBLIC_WORKSHOPS como JSON: [{"id":"<uuid>","name":"Providencia"}, ...].
// Cuando exista la tabla usuario↔taller en el backend, esta lista saldrá de la API.
export interface Workshop {
  id: string;
  name: string;
}

const FALLBACK: Workshop[] = [{ id: '11111111-1111-1111-1111-111111111111', name: 'Taller Central' }];

function parseWorkshops(): Workshop[] {
  const raw = import.meta.env.PUBLIC_WORKSHOPS;
  if (!raw) return FALLBACK;
  try {
    const parsed = JSON.parse(raw) as Workshop[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK;
  } catch {
    console.warn('PUBLIC_WORKSHOPS no es JSON válido; se usa el taller por defecto');
    return FALLBACK;
  }
}

export const WORKSHOPS: Workshop[] = parseWorkshops();

export const DEFAULT_WORKSHOP_ID = WORKSHOPS[0].id;

export function workshopName(id: string | null | undefined): string {
  return WORKSHOPS.find((w) => w.id === id)?.name ?? (id ? `Taller ${id.slice(0, 8)}` : '—');
}

export const WORKSHOP_OPTIONS = WORKSHOPS.map((w) => ({ value: w.id, label: w.name }));
