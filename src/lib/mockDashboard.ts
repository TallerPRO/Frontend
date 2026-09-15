// Datos de muestra para el Dashboard mientras no existe el endpoint de
// reportes (Fase 7, /api/reports/*). Reemplazar por datos reales del BFF.
import type { Order } from '../types/order.types';
import type { OrdersByStatusDatum } from '../components/dashboard/OrdersByStatusChart';
import type { OrdersTrendDatum } from '../components/dashboard/OrdersTrendChart';
import type { WorkshopLoadDatum } from '../components/dashboard/WorkshopLoadBar';

export const MOCK_ORDERS_BY_STATUS: OrdersByStatusDatum[] = [
  { status: 'RECEPCIONADA', count: 18 },
  { status: 'DIAGNOSTICADA', count: 9 },
  { status: 'EN_REPARACION', count: 24 },
  { status: 'LISTA_RETIRO', count: 7 },
  { status: 'ENTREGADA', count: 62 },
  { status: 'ANULADA', count: 3 },
];

export const MOCK_ORDERS_TREND: OrdersTrendDatum[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }),
    count: Math.round(8 + Math.sin(i / 3) * 4 + Math.random() * 3),
  };
});

export const MOCK_WORKSHOP_LOAD: WorkshopLoadDatum[] = [
  { workshopName: 'Providencia', activeOrders: 14 },
  { workshopName: 'Maipú', activeOrders: 9 },
  { workshopName: 'La Florida', activeOrders: 11 },
  { workshopName: 'Ñuñoa', activeOrders: 6 },
  { workshopName: 'Puente Alto', activeOrders: 17 },
];

export const MOCK_RECENT_ORDERS: Order[] = [
  {
    id: '1',
    folio: 'TP-2026-01291',
    workshopId: 'w1',
    workshopName: 'Providencia',
    vehiclePlate: 'HJKL12',
    vehicleBrand: 'Chevrolet',
    vehicleModel: 'Sail LT',
    vehicleYear: 2021,
    clientId: 'c1',
    clientName: 'María Torres',
    clientEmail: 'maria.torres@example.com',
    status: 'EN_REPARACION',
    services: [],
    parts: [],
    estimatedCost: 185000,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdBy: 'jefe.taller@tallerpro.cl',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    folio: 'TP-2026-01290',
    workshopId: 'w2',
    workshopName: 'Maipú',
    vehiclePlate: 'RTYU45',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Yaris',
    vehicleYear: 2019,
    clientId: 'c2',
    clientName: 'Pedro Salas',
    clientEmail: 'pedro.salas@example.com',
    status: 'LISTA_RETIRO',
    services: [],
    parts: [],
    estimatedCost: 92000,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    createdBy: 'jefe.taller@tallerpro.cl',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    folio: 'TP-2026-01289',
    workshopId: 'w3',
    workshopName: 'La Florida',
    vehiclePlate: 'ABCD78',
    vehicleBrand: 'Nissan',
    vehicleModel: 'Versa',
    vehicleYear: 2022,
    clientId: 'c3',
    clientName: 'Ignacia Rojas',
    clientEmail: 'ignacia.rojas@example.com',
    status: 'RECEPCIONADA',
    services: [],
    parts: [],
    estimatedCost: 45000,
    receivedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdBy: 'mecanico@tallerpro.cl',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    folio: 'TP-2026-01288',
    workshopId: 'w1',
    workshopName: 'Providencia',
    vehiclePlate: 'LMNO33',
    vehicleBrand: 'Hyundai',
    vehicleModel: 'Accent',
    vehicleYear: 2020,
    clientId: 'c4',
    clientName: 'Sebastián Vidal',
    clientEmail: 'sebastian.vidal@example.com',
    status: 'ENTREGADA',
    services: [],
    parts: [],
    estimatedCost: 63000,
    finalCost: 63000,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    deliveredAt: new Date().toISOString(),
    createdBy: 'jefe.taller@tallerpro.cl',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    folio: 'TP-2026-01287',
    workshopId: 'w5',
    workshopName: 'Puente Alto',
    vehiclePlate: 'QWER99',
    vehicleBrand: 'Suzuki',
    vehicleModel: 'Swift',
    vehicleYear: 2018,
    clientId: 'c5',
    clientName: 'Camila Fuentes',
    clientEmail: 'camila.fuentes@example.com',
    status: 'DIAGNOSTICADA',
    services: [],
    parts: [],
    estimatedCost: 128000,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    createdBy: 'mecanico@tallerpro.cl',
    updatedAt: new Date().toISOString(),
  },
];
