import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import {
  SERVICE_CATEGORY_LABELS,
  type Service,
  type ServiceCategory,
  type ServiceDTO,
} from '../../types/catalog.types';

const CATEGORY_OPTIONS = (Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategory[]).map((value) => ({
  value,
  label: SERVICE_CATEGORY_LABELS[value],
}));

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  category: z.enum(Object.keys(SERVICE_CATEGORY_LABELS) as [ServiceCategory, ...ServiceCategory[]], {
    message: 'Selecciona una categoría',
  }),
  price: z.coerce.number().int('Sin decimales').min(0, 'Precio inválido'),
  estimatedMinutes: z.coerce.number().int().min(5, 'Mínimo 5 minutos'),
  active: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface ServiceFormModalProps {
  open: boolean;
  service: Service | null; // null = crear
  onClose: () => void;
  onSubmit: (dto: ServiceDTO) => Promise<void>;
}

const EMPTY: FormInput = { name: '', description: '', category: 'MANTENCION', price: 0, estimatedMinutes: 30, active: true };

export function ServiceFormModal({ open, service, onClose, onSubmit }: ServiceFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      service
        ? {
            name: service.name,
            description: service.description ?? '',
            category: service.category,
            price: service.price,
            estimatedMinutes: service.estimatedMinutes,
            active: service.active,
          }
        : EMPTY,
    );
  }, [open, service, reset]);

  async function handleFormSubmit(values: FormOutput) {
    await onSubmit({ ...values, description: values.description || undefined });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={service ? 'Editar servicio' : 'Nuevo servicio'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input label="Nombre" placeholder="Cambio de aceite" error={errors.name?.message} {...register('name')} />
        <Input label="Descripción" placeholder="Opcional" {...register('description')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Categoría" options={CATEGORY_OPTIONS} error={errors.category?.message} {...register('category')} />
          <Input label="Precio (CLP)" type="number" min={0} error={errors.price?.message} {...register('price')} />
          <Input
            label="Duración (min)"
            type="number"
            min={5}
            error={errors.estimatedMinutes?.message}
            {...register('estimatedMinutes')}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" className="h-4 w-4 accent-brand-500" {...register('active')} />
          Disponible para nuevas órdenes
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {service ? 'Guardar cambios' : 'Crear servicio'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
