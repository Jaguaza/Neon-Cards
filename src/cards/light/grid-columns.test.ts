// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { columnsInGrid, findParentGrid } from './grid-columns';

const grid = (tracks: number, trackWidth = 36, gap = 8) => ({ display: 'grid', gridTemplateColumns: Array(tracks).fill(`${trackWidth}px`).join(' '), columnGap: `${gap}px` });
const block = { display: 'block', gridTemplateColumns: 'none', columnGap: 'normal' };

describe('columnas que ocupa la tarjeta en la rejilla', () => {
  // Sección de 12 columnas de 36 px con 8 px de separación: 520 px.
  const section = { tracks: 12, trackWidth: 36, gap: 8 };

  it('12, 9, 6 y 4 columnas, con el ancho que les da Home Assistant', () => {
    expect(columnsInGrid(section, 12 * 36 + 11 * 8)).toBe(12);
    expect(columnsInGrid(section, 9 * 36 + 8 * 8)).toBe(9);
    expect(columnsInGrid(section, 6 * 36 + 5 * 8)).toBe(6);
    expect(columnsInGrid(section, 4 * 36 + 3 * 8)).toBe(4);
  });

  it('da lo mismo el tamaño en píxeles de la sección: cuenta columnas, no píxeles', () => {
    const wide = { tracks: 12, trackWidth: 52, gap: 8 };
    expect(columnsInGrid(wide, 9 * 52 + 8 * 8)).toBe(9);
    expect(columnsInGrid(wide, 6 * 52 + 5 * 8)).toBe(6);
  });

  it('una rejilla con otro número de columnas se normaliza a 12 (mitad del ancho = 6)', () => {
    expect(columnsInGrid({ tracks: 2, trackWidth: 200, gap: 8 }, 200)).toBe(6);
    expect(columnsInGrid({ tracks: 2, trackWidth: 200, gap: 8 }, 408)).toBe(12);
  });

  it('sin rejilla o sin ancho no hay columnas', () => {
    expect(columnsInGrid(undefined, 300)).toBeUndefined();
    expect(columnsInGrid(section, 0)).toBeUndefined();
  });
});

describe('búsqueda de la rejilla', () => {
  it('sube por los padres hasta la rejilla con columnas', () => {
    const outer = document.createElement('div');
    outer.id = 'grid';
    const inner = document.createElement('div');
    const leaf = document.createElement('div');
    outer.appendChild(inner);
    inner.appendChild(leaf);
    const info = findParentGrid(leaf, (el) => (el.id === 'grid' ? grid(12) : block));
    expect(info).toEqual({ tracks: 12, trackWidth: 36, gap: 8 });
  });

  it('atraviesa los shadow roots (hui-card dentro de la sección)', () => {
    const section = document.createElement('div');
    section.id = 'grid';
    const huiCard = document.createElement('div');
    section.appendChild(huiCard);
    const root = huiCard.attachShadow({ mode: 'open' });
    const leaf = document.createElement('div');
    root.appendChild(leaf);
    expect(findParentGrid(leaf, (el) => (el.id === 'grid' ? grid(12, 40, 8) : block))).toEqual({ tracks: 12, trackWidth: 40, gap: 8 });
  });

  it('sin rejilla (masonry, panel) devuelve undefined', () => {
    const parent = document.createElement('div');
    const leaf = document.createElement('div');
    parent.appendChild(leaf);
    expect(findParentGrid(leaf, () => block)).toBeUndefined();
  });

  it('ignora una rejilla de una sola columna o sin tamaños resueltos, y sigue subiendo', () => {
    const top = document.createElement('div');
    top.id = 'top';
    const mid = document.createElement('div');
    mid.id = 'mid';
    const leaf = document.createElement('div');
    top.appendChild(mid);
    mid.appendChild(leaf);
    const info = findParentGrid(leaf, (el) => (el.id === 'mid' ? { display: 'grid', gridTemplateColumns: '300px', columnGap: '0px' } : el.id === 'top' ? grid(12) : block));
    expect(info?.tracks).toBe(12);
    expect(findParentGrid(leaf, (el) => (el.id === 'mid' ? { display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '0px' } : block))).toBeUndefined();
  });

  it('un columnGap «normal» cuenta como 0', () => {
    const parent = document.createElement('div');
    const leaf = document.createElement('div');
    parent.appendChild(leaf);
    expect(findParentGrid(leaf, () => ({ display: 'grid', gridTemplateColumns: '50px 50px', columnGap: 'normal' }))?.gap).toBe(0);
  });
});
