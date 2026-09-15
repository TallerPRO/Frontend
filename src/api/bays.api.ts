import { apiClient } from './client';
import type { Bay, BayOccupancySummary, CancelReservationReason } from '../types/bay.types';

export async function listBays(workshopId?: string): Promise<Bay[]> {
  const { data } = await apiClient.get<Bay[]>('/api/bays', { params: { workshopId } });
  return data;
}

export async function getBaysSummary(workshopId?: string): Promise<BayOccupancySummary> {
  const { data } = await apiClient.get<BayOccupancySummary>('/api/bays/summary', {
    params: { workshopId },
  });
  return data;
}

export async function getBay(id: string): Promise<Bay> {
  const { data } = await apiClient.get<Bay>(`/api/bays/${id}`);
  return data;
}

export async function reserveBay(
  id: string,
  body: { orderId: string; startsAt: string; endsAt: string },
): Promise<Bay> {
  const { data } = await apiClient.post<Bay>(`/api/bays/${id}/reservations`, body);
  return data;
}

export async function cancelReservation(
  bayId: string,
  reservationId: string,
  body: { reason: CancelReservationReason; comment?: string },
): Promise<void> {
  await apiClient.delete(`/api/bays/${bayId}/reservations/${reservationId}`, { data: body });
}

export async function checkInBay(id: string): Promise<Bay> {
  const { data } = await apiClient.post<Bay>(`/api/bays/${id}/check-in`);
  return data;
}

export async function releaseBay(id: string): Promise<Bay> {
  const { data } = await apiClient.post<Bay>(`/api/bays/${id}/release`);
  return data;
}
