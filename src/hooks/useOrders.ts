import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  cancelOrder,
  createOrder,
  getOrder,
  getOrderTimeline,
  listOrders,
  updateOrderStatus,
  type OrdersQuery,
} from '../api/orders.api';
import type {
  CreateOrderDTO,
  Order,
  OrderTimelineEntry,
  UpdateOrderStatusDTO,
} from '../types/order.types';
import { DEFAULT_PAGE_SIZE } from '../lib/constants';

export function useOrders(initialQuery: OrdersQuery = {}) {
  const [query, setQuery] = useState<OrdersQuery>({ size: DEFAULT_PAGE_SIZE, page: 0, ...initialQuery });
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listOrders(query);
      setOrders(result.content);
      setTotalPages(result.totalPages);
    } catch {
      setError('No pudimos cargar las órdenes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function setFilters(filters: Partial<Omit<OrdersQuery, 'page' | 'size'>>) {
    setQuery((q) => ({ ...q, ...filters, page: 0 }));
  }

  function setPage(page: number) {
    setQuery((q) => ({ ...q, page }));
  }

  return {
    orders,
    page: query.page ?? 0,
    totalPages,
    loading,
    error,
    filters: query,
    setFilters,
    setPage,
    refetch: fetchOrders,
  };
}

export function useOrder(id: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<OrderTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [orderResult, timelineResult] = await Promise.all([getOrder(id), getOrderTimeline(id)]);
      setOrder(orderResult);
      setTimeline(timelineResult);
    } catch {
      setError('No pudimos cargar la orden.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function changeStatus(dto: UpdateOrderStatusDTO) {
    if (!id) return;
    const updated = await updateOrderStatus(id, dto);
    setOrder(updated);
    await fetchOrder();
    toast.success('Estado de la orden actualizado');
  }

  return { order, timeline, loading, error, changeStatus, refetch: fetchOrder };
}

export function useCreateOrder() {
  const [submitting, setSubmitting] = useState(false);

  async function submit(dto: CreateOrderDTO) {
    setSubmitting(true);
    try {
      const order = await createOrder(dto);
      toast.success(`Orden ${order.folio} creada`);
      return order;
    } catch {
      toast.error('No pudimos crear la orden. Intenta nuevamente.');
      throw new Error('create-order-failed');
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting };
}

export async function cancelOrderAndNotify(id: string) {
  await cancelOrder(id);
  toast.success('Orden anulada');
}
