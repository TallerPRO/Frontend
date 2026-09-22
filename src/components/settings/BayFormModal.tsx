import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Bay, BayDTO } from '../../types/bay.types';

// Los límites (10 y 60) son los mismos que valida catalog en BahiaRequest.
const CODE_MAX = 10;
const SECTOR_MAX = 60;

interface BayFormModalProps {
  open: boolean;
  bay: Bay | null; // null = crear
  /** Códigos ya ocupados en el taller (en mayúsculas), para rechazar duplicados. */
  usedCodes: string[];
  onClose: () => void;
  onSubmit: (dto: BayDTO) => Promise<void>;
}

const EMPTY = { code: '', sector: '', active: true };

export function BayFormModal({ open, bay, usedCodes, onClose, onSubmit }: BayFormModalProps) {
  // El schema se arma dentro del componente porque la validación de código
  // duplicado depende de las bahías que ya existen en el taller.
  const schema = z.object({
    code: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .refine((v) => v.length > 0, { message: 'Requerido' })
      .refine((v) => v.length <= CODE_MAX, { message: `Máximo ${CODE_MAX} caracteres` })
      .refine((v) => /^[A-Z0-9-]+$/.test(v), { message: 'Solo letras, números y guion (ej. A-01)' })
      .refine((v) => !usedCodes.includes(v), { message: 'Ya existe una bahía con ese código' }),
    sector: z
      .string()
      .trim()
      .min(3, 'Mínimo 3 caracteres')
      .max(SECTOR_MAX, `Máximo ${SECTOR_MAX} caracteres`),
    active: z.boolean(),
  });

  type FormInput = z.input<typeof schema>;
  type FormOutput = z.output<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(bay ? { code: bay.code, sector: bay.sector, active: bay.active } : EMPTY);
  }, [open, bay, reset]);

  async function handleFormSubmit(values: FormOutput) {
    await onSubmit(values);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={bay ? `Editar bahía ${bay.code}` : 'Nueva bahía'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Código"
            placeholder="A-01"
            maxLength={CODE_MAX}
            autoComplete="off"
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            label="Sector"
            placeholder="Mecánica General"
            maxLength={SECTOR_MAX}
            error={errors.sector?.message}
            {...register('sector')}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" className="h-4 w-4 accent-brand-500" {...register('active')} />
          En servicio (disponible para reservas)
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {bay ? 'Guardar cambios' : 'Crear bahía'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
