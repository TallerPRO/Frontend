// Datos de muestra para el Catálogo mientras el BFF no expone
// /api/catalog/*. Los hooks caen a estos datos si la llamada falla.
import type { Part, Service } from '../types/catalog.types';

const NOW = new Date().toISOString();

export const MOCK_SERVICES: Service[] = [
  { id: 's1', code: 'SRV-0001', name: 'Cambio de aceite y filtro', category: 'MANTENCION', price: 45000, estimatedMinutes: 45, active: true, updatedAt: NOW },
  { id: 's2', code: 'SRV-0002', name: 'Mantención 10.000 km', category: 'MANTENCION', price: 120000, estimatedMinutes: 120, active: true, updatedAt: NOW },
  { id: 's3', code: 'SRV-0003', name: 'Cambio de pastillas de freno delanteras', category: 'FRENOS', price: 65000, estimatedMinutes: 60, active: true, updatedAt: NOW },
  { id: 's4', code: 'SRV-0004', name: 'Rectificado de discos', category: 'FRENOS', price: 38000, estimatedMinutes: 90, active: true, updatedAt: NOW },
  { id: 's5', code: 'SRV-0005', name: 'Cambio de amortiguadores (par)', category: 'SUSPENSION', price: 95000, estimatedMinutes: 150, active: true, updatedAt: NOW },
  { id: 's6', code: 'SRV-0006', name: 'Alineación y balanceo', category: 'SUSPENSION', price: 30000, estimatedMinutes: 45, active: true, updatedAt: NOW },
  { id: 's7', code: 'SRV-0007', name: 'Cambio de correa de distribución', category: 'MOTOR', price: 180000, estimatedMinutes: 240, active: true, updatedAt: NOW },
  { id: 's8', code: 'SRV-0008', name: 'Limpieza de inyectores', category: 'MOTOR', price: 55000, estimatedMinutes: 90, active: true, updatedAt: NOW },
  { id: 's9', code: 'SRV-0009', name: 'Diagnóstico por scanner', category: 'DIAGNOSTICO', price: 25000, estimatedMinutes: 30, active: true, updatedAt: NOW },
  { id: 's10', code: 'SRV-0010', name: 'Cambio de batería', category: 'ELECTRICO', price: 15000, estimatedMinutes: 20, active: true, updatedAt: NOW },
  { id: 's11', code: 'SRV-0011', name: 'Reparación de alternador', category: 'ELECTRICO', price: 85000, estimatedMinutes: 180, active: false, updatedAt: NOW },
  { id: 's12', code: 'SRV-0012', name: 'Desabolladura y pintura (panel)', category: 'CARROCERIA', price: 140000, estimatedMinutes: 480, active: true, updatedAt: NOW },
];

export const MOCK_PARTS: Part[] = [
  { id: 'p1', partNumber: 'OIL-5W30-4L', name: 'Aceite sintético 5W-30 4L', brand: 'Mobil', unitPrice: 32000, stock: 48, minStock: 20, active: true, updatedAt: NOW },
  { id: 'p2', partNumber: 'FLT-OIL-TY01', name: 'Filtro de aceite Toyota', brand: 'Denso', unitPrice: 8500, stock: 12, minStock: 15, active: true, updatedAt: NOW },
  { id: 'p3', partNumber: 'FLT-AIR-CH02', name: 'Filtro de aire Chevrolet Sail', brand: 'ACDelco', unitPrice: 11000, stock: 7, minStock: 10, active: true, updatedAt: NOW },
  { id: 'p4', partNumber: 'BR-4521-T', name: 'Pastillas de freno delanteras', brand: 'Brembo', unitPrice: 42000, stock: 25, minStock: 10, active: true, updatedAt: NOW },
  { id: 'p5', partNumber: 'BR-DISC-280', name: 'Disco de freno 280mm', brand: 'Brembo', unitPrice: 58000, stock: 6, minStock: 8, active: true, updatedAt: NOW },
  { id: 'p6', partNumber: 'SUS-AMT-F01', name: 'Amortiguador delantero', brand: 'Monroe', unitPrice: 47000, stock: 14, minStock: 6, active: true, updatedAt: NOW },
  { id: 'p7', partNumber: 'BAT-60AH', name: 'Batería 60Ah', brand: 'Bosch', unitPrice: 89000, stock: 9, minStock: 5, active: true, updatedAt: NOW },
  { id: 'p8', partNumber: 'BLT-TIM-K01', name: 'Kit correa de distribución', brand: 'Gates', unitPrice: 76000, stock: 3, minStock: 4, active: true, updatedAt: NOW },
  { id: 'p9', partNumber: 'SPK-IRD-4', name: 'Bujías iridio (set 4)', brand: 'NGK', unitPrice: 36000, stock: 30, minStock: 12, active: true, updatedAt: NOW },
  { id: 'p10', partNumber: 'WPR-22', name: 'Plumilla limpiaparabrisas 22"', brand: 'Bosch', unitPrice: 9500, stock: 0, minStock: 10, active: false, updatedAt: NOW },
];
