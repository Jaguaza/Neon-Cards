import { describe, it, expect } from 'vitest';
import { gridOptionsFor, hasGraph, resolveSize } from './sensor-size';
import { MIN_COLUMNS, SIZE_COLUMNS } from './constants';

describe('resolveSize', () => {
  it('por defecto (y con valores desconocidos) es mediano', () => {
    expect(resolveSize(undefined)).toBe('normal');
    expect(resolveSize({})).toBe('normal');
    expect(resolveSize({ size: 'normal' })).toBe('normal');
    expect(resolveSize({ size: 'huge' as never })).toBe('normal');
  });
  it('respeta pequeño y grande', () => {
    expect(resolveSize({ size: 'compact' })).toBe('compact');
    expect(resolveSize({ size: 'large' })).toBe('large');
  });
});

describe('hasGraph', () => {
  it('dos tamaños con gráfico y uno sin gráfico', () => {
    expect(hasGraph('large')).toBe(true);
    expect(hasGraph('normal')).toBe(true);
    expect(hasGraph('compact')).toBe(false);
  });
});

describe('gridOptionsFor', () => {
  it('el grande ocupa el ancho máximo (12 columnas)', () => {
    expect(gridOptionsFor('large').columns).toBe(12);
  });
  it('el pequeño es el más estrecho y el mediano queda en medio', () => {
    expect(SIZE_COLUMNS.compact).toBeLessThan(SIZE_COLUMNS.normal);
    expect(SIZE_COLUMNS.normal).toBeLessThan(SIZE_COLUMNS.large);
    expect(SIZE_COLUMNS.compact).toBe(MIN_COLUMNS);
  });
  it('alto automático y mínimo de columnas en todos los tamaños', () => {
    for (const size of ['compact', 'normal', 'large'] as const) {
      expect(gridOptionsFor(size)).toEqual({ rows: 'auto', columns: SIZE_COLUMNS[size], min_columns: MIN_COLUMNS });
    }
  });
});
