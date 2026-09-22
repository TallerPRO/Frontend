import { describe, expect, it } from 'vitest';
import { MAX_VEHICLE_YEAR, normalizePlate, plateSchema, yearSchema } from '../validation';

describe('plateSchema', () => {
  it('acepta 6 caracteres alfanuméricos y los pasa a mayúsculas', () => {
    expect(plateSchema.parse('ab1234')).toBe('AB1234');
    expect(plateSchema.parse('BBBB99')).toBe('BBBB99');
    expect(plateSchema.parse('123456')).toBe('123456');
  });

  it('normaliza guiones y espacios antes de validar', () => {
    expect(plateSchema.parse('AB-12-34')).toBe('AB1234');
    expect(plateSchema.parse(' ab 12 34 ')).toBe('AB1234');
  });

  it('rechaza menos o más de 6 caracteres', () => {
    expect(plateSchema.safeParse('AB123').success).toBe(false);
    expect(plateSchema.safeParse('AB12345').success).toBe(false);
    expect(plateSchema.safeParse('').success).toBe(false);
  });

  it('rechaza símbolos', () => {
    expect(plateSchema.safeParse('AB12#4').success).toBe(false);
    expect(plateSchema.safeParse('AB12.4').success).toBe(false);
  });
});

describe('yearSchema', () => {
  it('acepta exactamente 4 dígitos y devuelve number', () => {
    expect(yearSchema.parse('2022')).toBe(2022);
    expect(yearSchema.parse(String(MAX_VEHICLE_YEAR))).toBe(MAX_VEHICLE_YEAR);
  });

  it('rechaza cantidades de dígitos distintas de 4', () => {
    expect(yearSchema.safeParse('202').success).toBe(false);
    expect(yearSchema.safeParse('20222').success).toBe(false);
    expect(yearSchema.safeParse('').success).toBe(false);
  });

  it('rechaza texto, decimales y notación científica', () => {
    expect(yearSchema.safeParse('20a2').success).toBe(false);
    expect(yearSchema.safeParse('20.2').success).toBe(false);
    expect(yearSchema.safeParse('2e10').success).toBe(false);
  });

  it('rechaza años fuera de rango', () => {
    expect(yearSchema.safeParse('1800').success).toBe(false);
    expect(yearSchema.safeParse(String(MAX_VEHICLE_YEAR + 1)).success).toBe(false);
  });
});

describe('normalizePlate', () => {
  it('deja solo letras y números en mayúsculas', () => {
    expect(normalizePlate('ab-12.34 ')).toBe('AB1234');
  });
});
