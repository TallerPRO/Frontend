import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatRut, rutSchema } from '../../lib/validation';
import type { Mechanic, MechanicDTO } from '../../types/mechanic.types';

const schema = z.object({
  // RUT con dígito verificador válido; se envía formateado "12.345.678-5" y
  // catalog lo normaliza y vuelve a validarlo.
  rut: rutSchema,
  name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
  email: z.email('Correo inválido'),
  phone: z.string().trim().max(30, 'Máximo 30 caracteres').optional(),
  active: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface MechanicFormModalProps {
  open: boolean;
  mechanic: Mechanic | null; // null = crear
  onClose: () => void;
  onSubmit: (dto: MechanicDTO) => Promise<void>;
}

const EMPTY: FormInput = { rut: '', name: '', email: '', phone: '', active: true };

export function MechanicFormModal({ open, mechanic, onClose, onSubmit }: MechanicFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(
      mechanic
        ? { rut: mechanic.rut, name: mechanic.name, email: mechanic.email, phone: mechanic.phone, active: mechanic.active }
        : EMPTY,
    );
  }, [open, mechanic, reset]);

  async function handleFormSubmit(values: FormOutput) {
    await onSubmit({ ...values, phone: values.phone || undefined });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={mechanic ? `Editar a ${mechanic.name}` : 'Nuevo mecánico'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="RUT"
            placeholder="12.345.678-5"
            maxLength={12}
            autoComplete="off"
            // Se formatea mientras se escribe para que el punto y el guion no
            // dependan de cómo lo tipee cada persona.
            onInput={(e) => {
              const el = e.currentTarget;
              el.value = formatRut(el.value);
            }}
            error={errors.rut?.message}
            {...register('rut')}
          />
          <Input label="Nombre" placeholder="Pedro Soto" error={errors.name?.message} {...register('name')} />
        </div>

        <Input
          label="Correo"
          type="email"
          placeholder="pedro@taller.cl"
          error={errors.email?.message}
          {...register('email')}
        />
        <p className="-mt-2 text-xs text-gray-400">
          A este correo le llega el aviso cuando se le asigna un trabajo, indicando la bahía.
        </p>

        <Input label="Teléfono (opcional)" placeholder="+56 9 1111 1111" error={errors.phone?.message} {...register('phone')} />

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" className="h-4 w-4 accent-brand-500" {...register('active')} />
          Disponible para asignar trabajos
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {mechanic ? 'Guardar cambios' : 'Crear mecánico'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
