import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DEFAULT_WORKSHOP_ID, WORKSHOP_OPTIONS } from '../../lib/workshops';
import { useBays } from '../../hooks/useBays';
import { useMechanics } from '../../hooks/useMechanics';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import type { CreateOrderDTO } from '../../types/order.types';
import { PLATE_LENGTH, YEAR_LENGTH, plateSchema, yearSchema } from '../../lib/validation';

const schema = z.object({
  workshopId: z.string().min(1, 'Requerido'),
  // Obligatoria: al recepcionar el vehículo se le reserva su puesto de trabajo.
  bayId: z.string().min(1, 'Selecciona una bahía disponible'),
  // El mecánico se asigna acá para que el aviso salga solo al pasar a reparación.
  mechanicId: z.string().min(1, 'Selecciona un mecánico'),
  // Patente: 6 caracteres alfanuméricos. Año: 4 dígitos. Ver lib/validation.ts.
  vehiclePlate: plateSchema,
  vehicleBrand: z.string().min(1, 'Requerido'),
  vehicleModel: z.string().min(1, 'Requerido'),
  vehicleYear: yearSchema,
  clientName: z.string().min(1, 'Requerido'),
  clientEmail: z.email('Correo inválido'),
  clientPhone: z
    .string()
    .trim()
    .min(8, 'Teléfono incompleto')
    .max(20, 'Teléfono demasiado largo')
    .regex(/^[0-9+\s-]+$/, 'Solo números, espacios, + y -'),
  diagnosisNotes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface CreateOrderFormProps {
  onSubmit: (dto: CreateOrderDTO) => Promise<void> | void;
  submitting?: boolean;
}

// Los servicios y repuestos se agregan desde el catálogo (Fase 6); por ahora
// la orden se crea sin ítems y se completan después desde el detalle.
export function CreateOrderForm({ onSubmit, submitting }: CreateOrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { workshopId: DEFAULT_WORKSHOP_ID, bayId: '', mechanicId: '' },
  });

  // Solo se ofrecen bahías libres del taller elegido: reservar una ocupada
  // sería rechazado por el backend igual.
  const workshopId = watch('workshopId') || DEFAULT_WORKSHOP_ID;
  const { bays, loading: baysLoading } = useBays(workshopId);
  const availableBays = bays.filter((b) => b.status === 'DISPONIBLE');
  const bayOptions = availableBays.map((b) => ({ value: b.id, label: `${b.code} · ${b.sector}` }));

  const { mechanics, loading: mechanicsLoading } = useMechanics(workshopId);
  const mechanicOptions = mechanics.map((m) => ({ value: m.id, label: `${m.name} · ${m.rut}` }));

  async function handleFormSubmit(values: FormOutput) {
    // El nombre y el correo del mecánico viajan con la orden: jobs los guarda
    // para el aviso posterior sin tener que volver a consultar el catálogo.
    const mechanic = mechanics.find((m) => m.id === values.mechanicId);
    await onSubmit({
      ...values,
      mechanicName: mechanic?.name ?? '',
      mechanicEmail: mechanic?.email ?? '',
      services: [],
      parts: [],
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehículo</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Patente"
            placeholder="AB1234"
            maxLength={PLATE_LENGTH}
            autoCapitalize="characters"
            autoComplete="off"
            className="uppercase"
            // Mientras se escribe: solo letras y números, en mayúsculas.
            onInput={(e) => {
              const el = e.currentTarget;
              el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PLATE_LENGTH);
            }}
            error={errors.vehiclePlate?.message}
            {...register('vehiclePlate')}
          />
          <Select label="Taller" options={WORKSHOP_OPTIONS} error={errors.workshopId?.message} {...register('workshopId')} />
          <Input label="Marca" placeholder="Toyota" error={errors.vehicleBrand?.message} {...register('vehicleBrand')} />
          <Input label="Modelo" placeholder="Yaris" error={errors.vehicleModel?.message} {...register('vehicleModel')} />
          <Select
            label="Bahía asignada"
            placeholder={baysLoading ? 'Cargando bahías…' : 'Selecciona una bahía disponible'}
            options={bayOptions}
            disabled={baysLoading}
            error={errors.bayId?.message}
            {...register('bayId')}
          />
          <Select
            label="Mecánico a cargo"
            placeholder={mechanicsLoading ? 'Cargando mecánicos…' : 'Selecciona un mecánico'}
            options={mechanicOptions}
            disabled={mechanicsLoading}
            error={errors.mechanicId?.message}
            {...register('mechanicId')}
          />
          <Input
            label="Año"
            // type="text" + inputMode: type="number" deja escribir "e", "+" y más de 4 dígitos.
            type="text"
            inputMode="numeric"
            maxLength={YEAR_LENGTH}
            placeholder="2022"
            autoComplete="off"
            onInput={(e) => {
              const el = e.currentTarget;
              el.value = el.value.replace(/\D/g, '').slice(0, YEAR_LENGTH);
            }}
            error={errors.vehicleYear?.message}
            {...register('vehicleYear')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nombre" placeholder="Nombre completo" error={errors.clientName?.message} {...register('clientName')} />
          <Input
            label="Correo"
            type="email"
            placeholder="cliente@correo.cl"
            error={errors.clientEmail?.message}
            {...register('clientEmail')}
          />
          <Input
            label="Teléfono"
            type="tel"
            inputMode="tel"
            maxLength={20}
            placeholder="+56 9 1234 5678"
            error={errors.clientPhone?.message}
            {...register('clientPhone')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico inicial</CardTitle>
        </CardHeader>
        <textarea
          rows={4}
          placeholder="Observaciones del vehículo al recepcionar…"
          className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          {...register('diagnosisNotes')}
        />
      </Card>

      <div className="flex items-center justify-end gap-3">
        {!baysLoading && availableBays.length === 0 && (
          <p className="text-sm text-red-400">
            No hay bahías disponibles en este taller. Crea otra desde Bahías o espera una salida.
          </p>
        )}
        {!mechanicsLoading && mechanics.length === 0 && (
          <p className="text-sm text-red-400">Sin mecánicos en este taller. Créalos desde el Dashboard.</p>
        )}
        <Button
          type="submit"
          loading={submitting}
          disabled={(!baysLoading && availableBays.length === 0) || (!mechanicsLoading && mechanics.length === 0)}
        >
          Crear orden
        </Button>
      </div>
    </form>
  );
}
