import { describe, it, expect } from 'vitest';
import { gridOptionsFor, hasGraph, resolveSize } from './sensor-size';
import { SIZE_GRID } from './constants';

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
  it('cada tamaño ocupa un hueco fijo: columnas × filas', () => {
    expect(SIZE_GRID).toEqual({
      compact: { columns: 3, rows: 2 },
      normal: { columns: 6, rows: 2 },
      large: { columns: 12, rows: 3 },
    });
  });
  it('el grande ocupa el ancho máximo (12 columnas)', () => {
    expect(gridOptionsFor('large').columns).toBe(12);
  });
  it('el hueco queda bloqueado: mínimo = máximo en columnas y filas', () => {
    for (const size of ['compact', 'normal', 'large'] as const) {
      const { columns, rows } = SIZE_GRID[size];
      expect(gridOptionsFor(size)).toEqual({
        columns, rows, min_columns: columns, max_columns: columns, min_rows: rows, max_rows: rows,
      });
    }
  });
});
