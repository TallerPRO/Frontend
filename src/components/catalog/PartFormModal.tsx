import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Part, PartDTO } from '../../types/catalog.types';

const schema = z.object({
  partNumber: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .transform((v) => v.toUpperCase().trim()),
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  brand: z.string().min(1, 'Requerido'),
  unitPrice: z.coerce.number().int('Sin decimales').min(0, 'Precio inválido'),
  stock: z.coerce.number().int().min(0, 'Stock inválido'),
  minStock: z.coerce.number().int().min(0, 'Valor inválido'),
  active: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface PartFormModalProps {
  open: boolean;
  part: Part | null; // null = crear
  onClose: () => void;
  onSubmit: (dto: PartDTO) => Promise<void>;
}

const EMPTY: FormInput = { partNumber: '', name: '', brand: '', unitPrice: 0, stock: 0, minStock: 0, active: true };

export function PartFormModal({ open, part, onClose, onSubmit }: PartFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      part
        ? {
            partNumber: part.partNumber,
            name: part.name,
            brand: part.brand,
            unitPrice: part.unitPrice,
            stock: part.stock,
            minStock: part.minStock,
            active: part.active,
          }
        : EMPTY,
    );
  }, [open, part, reset]);

  async function handleFormSubmit(values: FormOutput) {
    await onSubmit(values);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={part ? 'Editar repuesto' : 'Nuevo repuesto'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="N° de parte" placeholder="BR-4521-T" error={errors.partNumber?.message} {...register('partNumber')} />
          <Input label="Marca" placeholder="Brembo" error={errors.brand?.message} {...register('brand')} />
        </div>
        <Input label="Nombre" placeholder="Pastillas de freno delanteras" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Precio unitario (CLP)" type="number" min={0} error={errors.unitPrice?.message} {...register('unitPrice')} />
          <Input label="Stock" type="number" min={0} error={errors.stock?.message} {...register('stock')} />
          <Input label="Stock mínimo" type="number" min={0} error={errors.minStock?.message} {...register('minStock')} />
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
            {part ? 'Guardar cambios' : 'Crear repuesto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
