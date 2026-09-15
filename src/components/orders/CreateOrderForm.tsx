import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import type { CreateOrderDTO } from '../../types/order.types';

const schema = z.object({
  workshopId: z.string().min(1, 'Requerido'),
  vehiclePlate: z
    .string()
    .min(5, 'Patente inválida')
    .max(8, 'Patente inválida')
    .transform((v) => v.toUpperCase()),
  vehicleBrand: z.string().min(1, 'Requerido'),
  vehicleModel: z.string().min(1, 'Requerido'),
  vehicleYear: z.coerce
    .number()
    .int()
    .min(1980, 'Año inválido')
    .max(new Date().getFullYear() + 1, 'Año inválido'),
  clientName: z.string().min(1, 'Requerido'),
  clientEmail: z.email('Correo inválido'),
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
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  async function handleFormSubmit(values: FormOutput) {
    await onSubmit({ ...values, services: [], parts: [] });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehículo</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Patente" placeholder="AB1234" error={errors.vehiclePlate?.message} {...register('vehiclePlate')} />
          <Input label="Taller" placeholder="ID de taller" error={errors.workshopId?.message} {...register('workshopId')} />
          <Input label="Marca" placeholder="Toyota" error={errors.vehicleBrand?.message} {...register('vehicleBrand')} />
          <Input label="Modelo" placeholder="Yaris" error={errors.vehicleModel?.message} {...register('vehicleModel')} />
          <Input
            label="Año"
            type="number"
            placeholder="2022"
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

      <div className="flex justify-end gap-2">
        <Button type="submit" loading={submitting}>
          Crear orden
        </Button>
      </div>
    </form>
  );
}
