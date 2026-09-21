import { apiClient } from './client';
import type { Page } from '../types/api.types';
import type { Part, PartDTO, Service, ServiceCategory, ServiceDTO } from '../types/catalog.types';
import { DEFAULT_WORKSHOP_ID } from '../lib/workshops';

// Adaptador hacia ms-tallerpro-catalog (vía gateway).
// Servicios: /api/v1/servicios (comunes a la red).
// Repuestos: /api/v1/talleres/{tallerId}/repuestos (stock por taller).

interface ServicioResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: ServiceCategory;
  precio: number;
  duracionMinutos: number;
  activo: boolean;
  fechaActualizacion: string;
}

interface RepuestoResponse {
  id: string;
  tallerId: string;
  codigo: string;
  nombre: string;
  marca: string | null;
  precioUnitario: number;
  stock: number;
  stockMinimo: number;
  bajoStock: boolean;
  activo: boolean;
  fechaActualizacion: string;
}

const toService = (s: ServicioResponse): Service => ({
  id: s.id,
  code: s.codigo,
  name: s.nombre,
  description: s.descripcion ?? undefined,
  category: s.categoria,
  price: s.precio,
  estimatedMinutes: s.duracionMinutos,
  active: s.activo,
  updatedAt: s.fechaActualizacion,
});

const toPart = (r: RepuestoResponse): Part => ({
  id: r.id,
  partNumber: r.codigo,
  name: r.nombre,
  brand: r.marca ?? '',
  unitPrice: r.precioUnitario,
  stock: r.stock,
  minStock: r.stockMinimo,
  active: r.activo,
  updatedAt: r.fechaActualizacion,
});

const mapPage = <A, B>(page: Page<A>, fn: (a: A) => B): Page<B> => ({ ...page, content: page.content.map(fn) });

export interface ServicesQuery {
  search?: string;
  category?: ServiceCategory;
  page?: number;
  size?: number;
}

export interface PartsQuery {
  search?: string;
  lowStock?: boolean;
  workshopId?: string;
  page?: number;
  size?: number;
}

// ---------- Servicios ----------

const SERVICES = '/api/v1/servicios';

export async function listServices(query: ServicesQuery = {}): Promise<Page<Service>> {
  const { data } = await apiClient.get<Page<ServicioResponse>>(SERVICES, {
    params: { busqueda: query.search || undefined, categoria: query.category, page: query.page, size: query.size, soloActivos: true },
  });
  return mapPage(data, toService);
}

const serviceBody = (dto: ServiceDTO) => ({
  nombre: dto.name,
  descripcion: dto.description,
  categoria: dto.category,
  precio: dto.price,
  duracionMinutos: dto.estimatedMinutes,
  activo: dto.active,
});

export async function createService(dto: ServiceDTO): Promise<Service> {
  const { data } = await apiClient.post<ServicioResponse>(SERVICES, serviceBody(dto));
  return toService(data);
}

export async function updateService(id: string, dto: ServiceDTO): Promise<Service> {
  const { data } = await apiClient.put<ServicioResponse>(`${SERVICES}/${id}`, serviceBody(dto));
  return toService(data);
}

/** Baja lógica en el backend (activo=false). */
export async function deleteService(id: string): Promise<void> {
  await apiClient.delete(`${SERVICES}/${id}`);
}

// ---------- Repuestos ----------

const parts = (workshopId?: string) => `/api/v1/talleres/${workshopId ?? DEFAULT_WORKSHOP_ID}/repuestos`;

export async function listParts(query: PartsQuery = {}): Promise<Page<Part>> {
  const { data } = await apiClient.get<Page<RepuestoResponse>>(parts(query.workshopId), {
    params: { busqueda: query.search || undefined, bajoStock: query.lowStock || undefined, page: query.page, size: query.size, soloActivos: true },
  });
  return mapPage(data, toPart);
}

const partBody = (dto: PartDTO) => ({
  codigo: dto.partNumber,
  nombre: dto.name,
  marca: dto.brand,
  precioUnitario: dto.unitPrice,
  stock: dto.stock,
  stockMinimo: dto.minStock,
  activo: dto.active,
});

export async function createPart(dto: PartDTO, workshopId?: string): Promise<Part> {
  const { data } = await apiClient.post<RepuestoResponse>(parts(workshopId), partBody(dto));
  return toPart(data);
}

export async function updatePart(id: string, dto: PartDTO, workshopId?: string): Promise<Part> {
  const { data } = await apiClient.put<RepuestoResponse>(`${parts(workshopId)}/${id}`, partBody(dto));
  return toPart(data);
}

export async function deletePart(id: string, workshopId?: string): Promise<void> {
  await apiClient.delete(`${parts(workshopId)}/${id}`);
}
