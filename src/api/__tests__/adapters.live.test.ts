import { beforeAll, describe, expect, it } from 'vitest';
import { apiClient } from '../client';
import { assignResources, createOrder, getOrder, getOrderTimeline, listOrders, updateOrderStatus } from '../orders.api';
import { checkInBay, getBaysSummary, listBays, releaseBay } from '../bays.api';
import { createPart, createService, listParts, listServices } from '../catalog.api';
import { getOrdersSummary, getRepairTime } from '../reports.api';
import { listAuditEvents } from '../audit.api';
import { DEFAULT_WORKSHOP_ID } from '../../lib/workshops';

/**
 * Integración REAL frontend -> gateway -> microservicios. Se ejecuta solo con
 * TALLERPRO_LIVE=1 y el backend levantado en modo local (TALLERPRO_JWT_ENABLED=false):
 *   TALLERPRO_LIVE=1 npx vitest run src/api
 * Sirve como evidencia de que el contrato que consume el front es el del backend.
 */
const live = process.env.TALLERPRO_LIVE === '1';
const gateway = process.env.PUBLIC_BFF_BASE_URL ?? 'http://localhost:8080';

describe.skipIf(!live)('adaptadores contra el backend real', () => {
  beforeAll(() => {
    apiClient.defaults.baseURL = gateway;
  });

  it('catálogo: crea y lista servicio y repuesto', async () => {
    const service = await createService({
      name: `Alineación ${Date.now()}`,
      category: 'SUSPENSION',
      price: 25000,
      estimatedMinutes: 40,
      active: true,
    });
    expect(service.code).toMatch(/^SRV-\d{4}$/);
    const services = await listServices({ search: 'Alineación' });
    expect(services.content.some((s) => s.id === service.id)).toBe(true);

    const part = await createPart({
      partNumber: `FL-${Date.now()}`,
      name: 'Filtro de aire',
      brand: 'Mann',
      unitPrice: 12000,
      stock: 8,
      minStock: 2,
      active: true,
    });
    const parts = await listParts({ workshopId: DEFAULT_WORKSHOP_ID, search: part.partNumber });
    expect(parts.content[0]?.id).toBe(part.id);
  });

  it('órdenes + bahías: crear, asignar, diagnosticar, timeline y liberar', async () => {
    const order = await createOrder({
      workshopId: DEFAULT_WORKSHOP_ID,
      vehiclePlate: 'LIVE12',
      vehicleBrand: 'Kia',
      vehicleModel: 'Rio',
      vehicleYear: 2021,
      clientName: 'Cliente Live',
      clientEmail: 'cliente.live@correo.cl',
      services: [],
      parts: [],
    });
    expect(order.status).toBe('RECEPCIONADA');
    expect(order.folio).toMatch(/^TP-\d{4}-/);
    expect(order.clientEmail).toBe('cliente.live@correo.cl');

    const listed = await listOrders({ workshopId: DEFAULT_WORKSHOP_ID, size: 5 });
    expect(listed.content[0]?.id).toBe(order.id); // más reciente primero

    // Bahía disponible del taller (creada por el backend o por otro test)
    const { data: bahia } = await apiClient.post(`/api/v1/talleres/${DEFAULT_WORKSHOP_ID}/bahias`, {
      codigo: `L-${String(Date.now()).slice(-4)}`,
      sector: 'Live',
    });
    const assigned = await assignResources(order.id, { mechanicId: crypto.randomUUID(), mechanicName: 'Luis', bayId: bahia.id });
    expect(assigned.assignedMechanicName).toBe('Luis');

    const bays = await listBays(DEFAULT_WORKSHOP_ID);
    const mine = bays.find((b) => b.id === bahia.id)!;
    expect(mine.status).toBe('RESERVADA');
    expect(mine.assignment?.orderFolio).toBe(order.folio);
    expect(mine.assignment?.plate).toBe('LIVE12');

    const checkedIn = await checkInBay(bahia.id, DEFAULT_WORKSHOP_ID);
    expect(checkedIn.status).toBe('OCUPADA');
    const summary = await getBaysSummary(DEFAULT_WORKSHOP_ID);
    expect(summary.ocupadas).toBeGreaterThanOrEqual(1);

    const diagnosed = await updateOrderStatus(order.id, { status: 'DIAGNOSTICADA', notes: 'Frenos gastados' });
    expect(diagnosed.status).toBe('DIAGNOSTICADA');
    expect(diagnosed.diagnosisNotes).toBe('Frenos gastados');

    const timeline = await getOrderTimeline(order.id);
    expect(timeline.map((t) => t.status)).toEqual(['RECEPCIONADA', 'DIAGNOSTICADA']);

    // Saltarse un estado -> 409 del backend
    await expect(updateOrderStatus(order.id, { status: 'LISTA_RETIRO' })).rejects.toMatchObject({ response: { status: 409 } });

    await updateOrderStatus(order.id, { status: 'EN_REPARACION' });
    await updateOrderStatus(order.id, { status: 'LISTA_RETIRO' });
    const delivered = await updateOrderStatus(order.id, { status: 'ENTREGADA' });
    expect(delivered.status).toBe('ENTREGADA');
    expect((await getOrder(order.id)).deliveredAt).toBeTruthy();

    // Al entregar, jobs liberó la bahía en catalog
    const released = await releaseBay(bahia.id, DEFAULT_WORKSHOP_ID);
    expect(released.status).toBe('DISPONIBLE');
    expect(released.assignment).toBeNull();
  });

  it('reportes y auditoría responden con la forma que esperan las vistas', async () => {
    const summary = await getOrdersSummary(DEFAULT_WORKSHOP_ID);
    expect(summary.ordersByStatus).toHaveLength(6);
    expect(typeof summary.activeOrders).toBe('number');
    expect(summary.totalBays).toBeGreaterThanOrEqual(0);

    const repair = await getRepairTime({ from: '2026-01-01', to: '2026-12-31' });
    expect(Array.isArray(repair)).toBe(true);

    const audit = await listAuditEvents({ page: 0, size: 10 });
    expect(audit.number).toBe(0);
    expect(Array.isArray(audit.content)).toBe(true);
    // Sin Kafka en local no hay eventos; con filtro imposible tampoco
    const none = await listAuditEvents({ action: 'LOGIN' });
    expect(none.content).toHaveLength(0);
  });
});
