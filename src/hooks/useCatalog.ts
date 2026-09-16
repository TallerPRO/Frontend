import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  createPart,
  createService,
  deletePart,
  deleteService,
  listParts,
  listServices,
  updatePart,
  updateService,
  type PartsQuery,
  type ServicesQuery,
} from '../api/catalog.api';
import type { Page } from '../types/api.types';
import type { Part, PartDTO, Service, ServiceDTO } from '../types/catalog.types';
import { MOCK_PARTS, MOCK_SERVICES } from '../lib/mockCatalog';
import { DEFAULT_PAGE_SIZE } from '../lib/constants';

interface CatalogApi<T, DTO, Q> {
  list: (query: Q) => Promise<Page<T>>;
  create: (dto: DTO) => Promise<T>;
  update: (id: string, dto: DTO) => Promise<T>;
  remove: (id: string) => Promise<void>;
  mock: T[];
  filterMock: (items: T[], query: Q) => T[];
  fromDto: (id: string, dto: DTO, previous?: T) => T;
  labels: { created: string; updated: string; deleted: string; loadError: string };
}

// Hook genérico: servicios y repuestos comparten listado paginado, CRUD y
// fallback a datos de muestra cuando el BFF no responde (ver useBays).
function useCatalogResource<T extends { id: string }, DTO, Q extends { page?: number; size?: number }>(
  api: CatalogApi<T, DTO, Q>,
  initialQuery: Q,
) {
  const [query, setQuery] = useState<Q>({ size: DEFAULT_PAGE_SIZE, page: 0, ...initialQuery });
  const [items, setItems] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [mockItems, setMockItems] = useState<T[]>(api.mock);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.list(query);
      setItems(result.content);
      setTotalPages(result.totalPages);
      setUsingMock(false);
    } catch {
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
    // `api` es estable (se construye fuera del componente).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // En modo mock la paginación y filtros se resuelven en el cliente.
  const mockPage = useMemo(() => {
    const filtered = api.filterMock(mockItems, query);
    const size = query.size ?? DEFAULT_PAGE_SIZE;
    const page = query.page ?? 0;
    return {
      content: filtered.slice(page * size, page * size + size),
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    };
  }, [api, mockItems, query]);

  function setFilters(filters: Partial<Omit<Q, 'page' | 'size'>>) {
    setQuery((q) => ({ ...q, ...filters, page: 0 }));
  }

  function setPage(page: number) {
    setQuery((q) => ({ ...q, page }));
  }

  async function save(dto: DTO, existing?: T) {
    if (usingMock) {
      setMockItems((prev) =>
        existing
          ? prev.map((item) => (item.id === existing.id ? api.fromDto(existing.id, dto, existing) : item))
          : [api.fromDto(`local-${Date.now()}`, dto), ...prev],
      );
      toast.success(existing ? api.labels.updated : api.labels.created);
      return;
    }
    if (existing) await api.update(existing.id, dto);
    else await api.create(dto);
    toast.success(existing ? api.labels.updated : api.labels.created);
    await fetchItems();
  }

  async function remove(item: T) {
    if (usingMock) {
      setMockItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(api.labels.deleted);
      return;
    }
    await api.remove(item.id);
    toast.success(api.labels.deleted);
    await fetchItems();
  }

  return {
    items: usingMock ? mockPage.content : items,
    page: query.page ?? 0,
    totalPages: usingMock ? mockPage.totalPages : totalPages,
    loading,
    usingMock,
    filters: query,
    setFilters,
    setPage,
    save,
    remove,
    refetch: fetchItems,
  };
}

function matchesSearch(haystack: string[], search?: string): boolean {
  if (!search) return true;
  const needle = search.toLowerCase();
  return haystack.some((value) => value.toLowerCase().includes(needle));
}

const SERVICES_API: CatalogApi<Service, ServiceDTO, ServicesQuery> = {
  list: listServices,
  create: createService,
  update: updateService,
  remove: deleteService,
  mock: MOCK_SERVICES,
  filterMock: (items, q) =>
    items.filter(
      (s) => (!q.category || s.category === q.category) && matchesSearch([s.code, s.name], q.search),
    ),
  fromDto: (id, dto, previous) => ({
    id,
    code: previous?.code ?? `SRV-${String(Date.now()).slice(-4)}`,
    ...dto,
    updatedAt: new Date().toISOString(),
  }),
  labels: {
    created: 'Servicio creado',
    updated: 'Servicio actualizado',
    deleted: 'Servicio eliminado',
    loadError: 'No pudimos cargar los servicios.',
  },
};

const PARTS_API: CatalogApi<Part, PartDTO, PartsQuery> = {
  list: listParts,
  create: createPart,
  update: updatePart,
  remove: deletePart,
  mock: MOCK_PARTS,
  filterMock: (items, q) =>
    items.filter(
      (p) =>
        (!q.lowStock || p.stock < p.minStock) && matchesSearch([p.partNumber, p.name, p.brand], q.search),
    ),
  fromDto: (id, dto) => ({ id, ...dto, updatedAt: new Date().toISOString() }),
  labels: {
    created: 'Repuesto creado',
    updated: 'Repuesto actualizado',
    deleted: 'Repuesto eliminado',
    loadError: 'No pudimos cargar los repuestos.',
  },
};

export function useServices(initialQuery: ServicesQuery = {}) {
  return useCatalogResource(SERVICES_API, initialQuery);
}

export function useParts(initialQuery: PartsQuery = {}) {
  return useCatalogResource(PARTS_API, initialQuery);
}
