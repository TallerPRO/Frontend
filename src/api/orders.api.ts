import { apiClient } from './client';
import type { Page } from '../types/api.types';
import type {
  CreateOrderDTO,
  Order,
  OrderStatus,
  OrderTimelineEntry,
  UpdateOrderStatusDTO,
} from '../types/order.types';

export interface OrdersQuery {
  status?: OrderStatus;
  workshopId?: string;
  page?: number;
  size?: number;
}

export async function listOrders(query: OrdersQuery = {}): Promise<Page<Order>> {
  const { data } = await apiClient.get<Page<Order>>('/api/orders', { params: query });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/api/orders/${id}`);
  return data;
}

export async function createOrder(dto: CreateOrderDTO): Promise<Order> {
  const { data } = await apiClient.post<Order>('/api/orders', dto);
  return data;
}

export async function updateOrderStatus(id: string, dto: UpdateOrderStatusDTO): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/api/orders/${id}/status`, dto);
  return data;
}

export async function getOrderTimeline(id: string): Promise<OrderTimelineEntry[]> {
  const { data } = await apiClient.get<OrderTimelineEntry[]>(`/api/orders/${id}/timeline`);
  return data;
}

export async function cancelOrder(id: string): Promise<void> {
  await apiClient.delete(`/api/orders/${id}`);
}
