import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useParts, useServices } from '../../hooks/useCatalog';
import { formatCurrency } from '../../lib/formatters';
import type { Order } from '../../types/order.types';

interface LineItem {
  id: string; // id del servicio o repuesto en el catálogo
  name: string;
  unitPrice: number;
  quantity: number;
}

interface DiagnosisModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (body: {
    parts: { partId: string; quantity: number }[];
    services: { serviceId: string; quantity: number }[];
    notes?: string;
  }) => Promise<void>;
}

/**
 * Cierre del trabajo: se agregan los repuestos y servicios realmente usados.
 *
 * El total que se muestra aquí es una previsualización con los precios del
 * catálogo; el monto definitivo lo calcula el backend al confirmar (por eso al
 * cerrar solo se envían ids y cantidades).
 */
export function DiagnosisModal({ open, order, onClose, onConfirm }: DiagnosisModalProps) {
  const { items: services, loading: servicesLoading } = useServices({ size: 100 });
  const { items: parts, loading: partsLoading } = useParts({ size: 100 });

  const [selectedServices, setSelectedServices] = useState<LineItem[]>([]);
  const [selectedParts, setSelectedParts] = useState<LineItem[]>([]);
  const [serviceToAdd, setServiceToAdd] = useState('');
  const [partToAdd, setPartToAdd] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedServices([]);
    setSelectedParts([]);
    setServiceToAdd('');
    setPartToAdd('');
    setNotes('');
  }, [open]);

  const total = useMemo(
    () =>
      [...selectedServices, ...selectedParts].reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [selectedServices, selectedParts],
  );

  function addService() {
    const service = services.find((s) => s.id === serviceToAdd);
    if (!service || selectedServices.some((s) => s.id === service.id)) return;
    setSelectedServices((prev) => [...prev, { id: service.id, name: service.name, unitPrice: service.price, quantity: 1 }]);
    setServiceToAdd('');
  }

  function addPart() {
    const part = parts.find((p) => p.id === partToAdd);
    if (!part || selectedParts.some((p) => p.id === part.id)) return;
    setSelectedParts((prev) => [...prev, { id: part.id, name: part.name, unitPrice: part.unitPrice, quantity: 1 }]);
    setPartToAdd('');
  }

  function setQuantity(list: 'services' | 'parts', id: string, quantity: number) {
    const update = (items: LineItem[]) =>
      items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity || 1) } : item));
    if (list === 'services') setSelectedServices(update);
    else setSelectedParts(update);
  }

  function remove(list: 'services' | 'parts', id: string) {
    if (list === 'services') setSelectedServices((prev) => prev.filter((s) => s.id !== id));
    else setSelectedParts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm({
        parts: selectedParts.map((p) => ({ partId: p.id, quantity: p.quantity })),
        services: selectedServices.map((s) => ({ serviceId: s.id, quantity: s.quantity })),
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const loading = servicesLoading || partsLoading;

  return (
    <Modal open={open} onClose={onClose} title={`Registrar diagnóstico · ${order?.vehiclePlate ?? ""}`}>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <ItemSection
            title="Servicios a realizar"
            options={services
              .filter((s) => !selectedServices.some((sel) => sel.id === s.id))
              .map((s) => ({ value: s.id, label: `${s.name} · ${formatCurrency(s.price)}` }))}
            value={serviceToAdd}
            onChange={setServiceToAdd}
            onAdd={addService}
            items={selectedServices}
            onQuantity={(id, q) => setQuantity('services', id, q)}
            onRemove={(id) => remove('services', id)}
            emptyLabel="Sin servicios agregados"
          />

          <ItemSection
            title="Productos y repuestos"
            options={parts
              .filter((p) => !selectedParts.some((sel) => sel.id === p.id))
              .map((p) => ({ value: p.id, label: `${p.name} · ${formatCurrency(p.unitPrice)} (stock ${p.stock})` }))}
            value={partToAdd}
            onChange={setPartToAdd}
            onAdd={addPart}
            items={selectedParts}
            onQuantity={(id, q) => setQuantity('parts', id, q)}
            onRemove={(id) => remove('parts', id)}
            emptyLabel="Sin repuestos agregados"
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="close-notes" className="text-xs font-medium text-gray-300">
              Nota del diagnóstico
            </label>
            <textarea
              id="close-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qué se detectó en la revisión del vehículo…"
              className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-navy-800 px-4 py-3">
            <span className="text-sm text-gray-300">Total a cobrar</span>
            <span className="text-lg font-semibold text-gray-100">{formatCurrency(total)}</span>
          </div>

          <p className="-mt-3 text-xs text-gray-400">
            Al confirmar, la orden pasa a «Diagnosticada» con este detalle y su total.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              loading={submitting}
              // La nota es el diagnóstico en sí: sin ella el backend rechaza el paso.
              disabled={notes.trim().length < 5}
              onClick={handleConfirm}
            >
              Guardar diagnóstico
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

interface ItemSectionProps {
  title: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  items: LineItem[];
  onQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  emptyLabel: string;
}

function ItemSection({ title, options, value, onChange, onAdd, items, onQuantity, onRemove, emptyLabel }: ItemSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select placeholder="Selecciona del catálogo" options={options} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
        <Button type="button" variant="secondary" onClick={onAdd} disabled={!value}>
          <Plus className="h-4 w-4" aria-hidden />
          Agregar
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-gray-500">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-navy-800 px-3 py-2">
              <span className="flex-1 text-sm text-gray-200">{item.name}</span>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => onQuantity(item.id, Number(e.target.value))}
                className="w-20"
                aria-label={`Cantidad de ${item.name}`}
              />
              <span className="w-24 text-right text-sm text-gray-300">{formatCurrency(item.unitPrice * item.quantity)}</span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Quitar ${item.name}`}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
