import { apiClient } from './client';
import type { Page } from '../types/api.types';
import type { Part, PartDTO, Service, ServiceCategory, ServiceDTO } from '../types/catalog.types';

export interface ServicesQuery {
  search?: string;
  category?: ServiceCategory;
  page?: number;
  size?: number;
}

export interface PartsQuery {
  search?: string;
  lowStock?: boolean;
  page?: number;
  size?: number;
}

export async function listServices(query: ServicesQuery = {}): Promise<Page<Service>> {
  const { data } = await apiClient.get<Page<Service>>('/api/catalog/services', { params: query });
  return data;
}

export async function createService(dto: ServiceDTO): Promise<Service> {
  const { data } = await apiClient.post<Service>('/api/catalog/services', dto);
  return data;
}

export async function updateService(id: string, dto: ServiceDTO): Promise<Service> {
  const { data } = await apiClient.put<Service>(`/api/catalog/services/${id}`, dto);
  return data;
}

export async function deleteService(id: string): Promise<void> {
  await apiClient.delete(`/api/catalog/services/${id}`);
}

export async function listParts(query: PartsQuery = {}): Promise<Page<Part>> {
  const { data } = await apiClient.get<Page<Part>>('/api/catalog/parts', { params: query });
  return data;
}

export async function createPart(dto: PartDTO): Promise<Part> {
  const { data } = await apiClient.post<Part>('/api/catalog/parts', dto);
  return data;
}

export async function updatePart(id: string, dto: PartDTO): Promise<Part> {
  const { data } = await apiClient.put<Part>(`/api/catalog/parts/${id}`, dto);
  return data;
}

export async function deletePart(id: string): Promise<void> {
  await apiClient.delete(`/api/catalog/parts/${id}`);
}
