import { describe, expect, it } from 'vitest';
import { CARD_GRID, CARD_SIZES, DEFAULT_CARD_SIZE, resolveCardSize } from './card-size';

describe('tamaño de las tarjetas', () => {
  it('por defecto es la grande (la tarjeta de siempre)', () => {
    expect(DEFAULT_CARD_SIZE).toBe('large');
    expect(resolveCardSize(undefined)).toBe('large');
    expect(resolveCardSize({})).toBe('large');
  });

  it('respeta un tamaño válido', () => {
    expect(resolveCardSize({ size: 'compact' })).toBe('compact');
    expect(resolveCardSize({ size: 'medium' })).toBe('medium');
    expect(resolveCardSize({ size: 'large' })).toBe('large');
  });

  it('un valor desconocido cuenta como el predeterminado', () => {
    expect(resolveCardSize({ size: 'enorme' as never })).toBe('large');
    expect(resolveCardSize({ size: '' as never })).toBe('large');
  });

  it('el grid tiene una entrada por cada tamaño, sin que el mínimo supere las columnas', () => {
    expect(Object.keys(CARD_GRID)).toEqual([...CARD_SIZES]);
    for (const size of CARD_SIZES) expect(CARD_GRID[size].min_columns).toBeLessThanOrEqual(CARD_GRID[size].columns);
  });
});
