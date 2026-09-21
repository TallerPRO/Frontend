import { useCallback, useEffect, useState } from 'react';
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
import { errorMessage } from '../api/client';
import type { Page } from '../types/api.types';
import type { Part, PartDTO, Service, ServiceDTO } from '../types/catalog.types';
import { DEFAULT_PAGE_SIZE } from '../lib/constants';

interface CatalogApi<T, DTO, Q> {
  list: (query: Q) => Promise<Page<T>>;
  create: (dto: DTO) => Promise<T>;
  update: (id: string, dto: DTO) => Promise<T>;
  remove: (id: string) => Promise<void>;
  labels: { created: string; updated: string; deleted: string; loadError: string };
}

// Hook genérico: servicios y repuestos comparten listado paginado y CRUD
// contra ms-tallerpro-catalog (vía gateway).
function useCatalogResource<T extends { id: string }, DTO, Q extends { page?: number; size?: number }>(
  api: CatalogApi<T, DTO, Q>,
  initialQuery: Q,
) {
  const [query, setQuery] = useState<Q>({ size: DEFAULT_PAGE_SIZE, page: 0, ...initialQuery });
  const [items, setItems] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.list(query);
      setItems(result.content);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, api.labels.loadError));
    } finally {
      setLoading(false);
    }
    // `api` es estable (se construye fuera del componente).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function setFilters(filters: Partial<Omit<Q, 'page' | 'size'>>) {
    setQuery((q) => ({ ...q, ...filters, page: 0 }));
  }

  function setPage(page: number) {
    setQuery((q) => ({ ...q, page }));
  }

  async function save(dto: DTO, existing?: T) {
    if (existing) await api.update(existing.id, dto);
    else await api.create(dto);
    toast.success(existing ? api.labels.updated : api.labels.created);
    await fetchItems();
  }

  async function remove(item: T) {
    await api.remove(item.id);
    toast.success(api.labels.deleted);
    await fetchItems();
  }

  return {
    items,
    page: query.page ?? 0,
    totalPages,
    loading,
    error,
    usingMock: false,
    filters: query,
    setFilters,
    setPage,
    save,
    remove,
    refetch: fetchItems,
  };
}

const SERVICES_API: CatalogApi<Service, ServiceDTO, ServicesQuery> = {
  list: listServices,
  create: createService,
  update: updateService,
  remove: deleteService,
  labels: {
    created: 'Servicio creado',
    updated: 'Servicio actualizado',
    deleted: 'Servicio desactivado',
    loadError: 'No pudimos cargar los servicios.',
  },
};

// Repuestos: stock por taller. Sin taller explícito se usa el taller por defecto
// (ver src/lib/workshops.ts); la vista puede pasar workshopId en el query.
const PARTS_API: CatalogApi<Part, PartDTO, PartsQuery> = {
  list: listParts,
  create: (dto) => createPart(dto),
  update: (id, dto) => updatePart(id, dto),
  remove: (id) => deletePart(id),
  labels: {
    created: 'Repuesto creado',
    updated: 'Repuesto actualizado',
    deleted: 'Repuesto desactivado',
    loadError: 'No pudimos cargar los repuestos.',
  },
};

export function useServices(initialQuery: ServicesQuery = {}) {
  return useCatalogResource(SERVICES_API, initialQuery);
}

export function useParts(initialQuery: PartsQuery = {}) {
  return useCatalogResource(PARTS_API, initialQuery);
}
