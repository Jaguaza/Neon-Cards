// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Card = HTMLElement & {
  setConfig(c: unknown): void;
  getCardSize(): number;
  getGridOptions(): Record<string, number>;
};

async function card(size?: string): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-thermostat-card') as Card;
  el.setConfig({ entity: 'climate.salon', ...(size ? { size } : {}) });
  return el;
}

describe('tamaño fijo del termostato en la rejilla de HA', () => {
  const cases: [string | undefined, number, number][] = [
    ['compact', 5, 4],
    ['normal', 8, 5],
    [undefined, 8, 5], // por defecto = normal (Mediana)
    ['large', 12, 5],
  ];

  it.each(cases)('size=%s → %i columnas × %i filas, bloqueado', async (size, columns, rows) => {
    const el = await card(size);
    expect(el.getGridOptions()).toEqual({
      columns, rows, min_columns: columns, max_columns: columns, min_rows: rows, max_rows: rows,
    });
    expect(el.getCardSize()).toBe(rows);
  });
});
