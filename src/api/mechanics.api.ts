import { apiClient } from './client';
import { DEFAULT_WORKSHOP_ID } from '../lib/workshops';
import type { Mechanic, MechanicDTO } from '../types/mechanic.types';

// Adaptador hacia ms-tallerpro-catalog (vía gateway):
// /api/v1/talleres/{tallerId}/mecanicos. Los mecánicos son un recurso del
// taller, igual que las bahías, por eso viven en catalog y no en jobs.

interface MecanicoResponse {
  id: string;
  tallerId: string;
  rut: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  activo: boolean;
  fechaActualizacion: string;
}

const base = (workshopId?: string) => `/api/v1/talleres/${workshopId ?? DEFAULT_WORKSHOP_ID}/mecanicos`;

const toMechanic = (m: MecanicoResponse): Mechanic => ({
  id: m.id,
  workshopId: m.tallerId,
  rut: m.rut,
  name: m.nombre,
  email: m.correo,
  phone: m.telefono ?? '',
  active: m.activo,
  updatedAt: m.fechaActualizacion,
});

const toBody = (dto: MechanicDTO) => ({
  rut: dto.rut,
  nombre: dto.name,
  correo: dto.email,
  telefono: dto.phone || null,
  activo: dto.active,
});

export async function listMechanics(workshopId?: string, onlyActive = true): Promise<Mechanic[]> {
  const { data } = await apiClient.get<MecanicoResponse[]>(base(workshopId), {
    params: { soloActivos: onlyActive },
  });
  return data.map(toMechanic);
}

export async function createMechanic(dto: MechanicDTO, workshopId?: string): Promise<Mechanic> {
  const { data } = await apiClient.post<MecanicoResponse>(base(workshopId), toBody(dto));
  return toMechanic(data);
}

export async function updateMechanic(id: string, dto: MechanicDTO, workshopId?: string): Promise<Mechanic> {
  const { data } = await apiClient.put<MecanicoResponse>(`${base(workshopId)}/${id}`, toBody(dto));
  return toMechanic(data);
}

/** Baja lógica: deja de aparecer para asignar, pero las órdenes antiguas lo conservan. */
export async function deactivateMechanic(id: string, workshopId?: string): Promise<void> {
  await apiClient.delete(`${base(workshopId)}/${id}`);
}
