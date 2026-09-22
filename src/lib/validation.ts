import { z } from 'zod';

// Reglas de validación compartidas por los formularios. Viven aquí y no en
// cada schema para que patente y año se validen igual en toda la aplicación.

export const PLATE_LENGTH = 6;
export const YEAR_LENGTH = 4;

const PLATE_REGEX = /^[A-Z0-9]{6}$/;
const YEAR_REGEX = /^\d{4}$/;

export const MIN_VEHICLE_YEAR = 1900;
export const MAX_VEHICLE_YEAR = new Date().getFullYear() + 1;

/** Quita separadores y espacios: "ab-12-34" -> "AB1234". */
export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Patente: exactamente 6 caracteres, solo letras o números.
 * Acepta guiones/espacios al escribir y los normaliza antes de validar.
 */
export const plateSchema = z
  .string()
  .transform(normalizePlate)
  .refine((v) => v.length > 0, { message: 'Requerido' })
  .refine((v) => v.length === PLATE_LENGTH, { message: 'La patente debe tener 6 caracteres' })
  .refine((v) => PLATE_REGEX.test(v), { message: 'Solo letras y números, sin símbolos' });

/**
 * Año: exactamente 4 dígitos numéricos, dentro de un rango razonable.
 * Devuelve number para el DTO.
 */
export const yearSchema = z
  .string()
  .trim()
  .refine((v) => v.length > 0, { message: 'Requerido' })
  .refine((v) => YEAR_REGEX.test(v), { message: 'El año debe ser un número de 4 dígitos' })
  .transform(Number)
  .refine((n) => n >= MIN_VEHICLE_YEAR && n <= MAX_VEHICLE_YEAR, {
    message: `El año debe estar entre ${MIN_VEHICLE_YEAR} y ${MAX_VEHICLE_YEAR}`,
  });

/**
 * Bloquea en el teclado todo lo que no sea dígito (el schema igual valida:
 * esto es solo para que el campo no acepte basura mientras se escribe).
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// ---------------------------------------------------------------- RUT ------

/** "12.345.678-5" -> "123456785" (sin puntos ni guion, K en mayúscula). */
export function cleanRut(value: string): string {
  return value.toUpperCase().replace(/[^0-9K]/g, '');
}

/** "123456785" -> "12.345.678-5", para mostrarlo mientras se escribe. */
export function formatRut(value: string): string {
  const clean = cleanRut(value);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

/** Dígito verificador del RUT chileno (módulo 11). */
export function rutCheckDigit(body: string): string {
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return '0';
  if (rest === 10) return 'K';
  return String(rest);
}

/**
 * RUT chileno con dígito verificador correcto. Se valida aquí además del
 * backend para dar el error antes de enviar el formulario; catalog vuelve a
 * validarlo y responde 409 si no cuadra.
 */
export const rutSchema = z
  .string()
  .transform(cleanRut)
  .refine((v) => v.length > 0, { message: 'Requerido' })
  .refine((v) => v.length >= 8 && v.length <= 9, { message: 'RUT incompleto' })
  .refine((v) => /^\d+[0-9K]$/.test(v), { message: 'Solo números y dígito verificador' })
  .refine((v) => v.slice(-1) === rutCheckDigit(v.slice(0, -1)), {
    message: 'El dígito verificador no corresponde',
  })
  .transform(formatRut);
