import { describe, expect, it } from 'vitest';
import { carouselWindow, nextStart, visibleItemCount } from './footer-carousel';

describe('iconos visibles por columnas de la rejilla', () => {
  it('12 columnas: todas las opciones, sean las que sean; 9: tres; 6: dos', () => {
    expect(visibleItemCount(4, 500, 12)).toBe(4);
    expect(visibleItemCount(5, 500, 12)).toBe(5);
    expect(visibleItemCount(3, 500, 12)).toBe(3);
    expect(visibleItemCount(4, 400, 9)).toBe(3);
    expect(visibleItemCount(5, 400, 9)).toBe(3);
    expect(visibleItemCount(4, 260, 6)).toBe(2);
    expect(visibleItemCount(5, 260, 6)).toBe(2);
  });

  it('entre medias: 10 y 11 columnas tres, 7 y 8 dos, de 4 a 5 uno', () => {
    expect([11, 10].map((columns) => visibleItemCount(5, 400, columns))).toEqual([3, 3]);
    expect([8, 7].map((columns) => visibleItemCount(5, 300, columns))).toEqual([2, 2]);
    expect([5, 4].map((columns) => visibleItemCount(5, 200, columns))).toEqual([1, 1]);
  });

  it('con menos opciones caben antes: tres opciones a 9 columnas, y dos a 6, se ven todas', () => {
    expect(visibleItemCount(3, 400, 9)).toBe(3);
    expect(visibleItemCount(2, 260, 6)).toBe(2);
    expect(visibleItemCount(3, 260, 6)).toBe(2);
  });

  it('las columnas mandan sobre el ancho en píxeles', () => {
    expect(visibleItemCount(4, 900, 6)).toBe(2);
    expect(visibleItemCount(4, 150, 12)).toBe(4);
  });
});

describe('respaldo por píxeles (sin rejilla de secciones)', () => {
  it('caben todos, o los que quepan junto a la flecha', () => {
    expect(visibleItemCount(4, 622)).toBe(4);
    expect(visibleItemCount(4, 400)).toBe(3);
    expect(visibleItemCount(4, 300)).toBe(2);
    expect(visibleItemCount(4, 202)).toBe(1);
  });

  it('nunca todos si no caben, y al menos uno', () => {
    expect(visibleItemCount(4, 60)).toBe(1);
    expect(visibleItemCount(3, 400)).toBe(3);
  });
});

describe('sin medida o con un solo icono no hay carrusel', () => {
  it('ancho 0 (aún sin medir) o un icono', () => {
    expect(visibleItemCount(4, 0)).toBe(4);
    expect(visibleItemCount(4, 0, 6)).toBe(4);
    expect(visibleItemCount(1, 100, 4)).toBe(1);
    expect(visibleItemCount(0, 300)).toBe(0);
  });
});

describe('ventana del carrusel', () => {
  const items = ['brillo', 'temperatura', 'color', 'efectos'];

  it('desliza de uno en uno y vuelve a empezar tras la última', () => {
    expect(carouselWindow(items, 0, 2)).toEqual(['brillo', 'temperatura']);
    expect(carouselWindow(items, 1, 2)).toEqual(['temperatura', 'color']);
    expect(carouselWindow(items, 2, 2)).toEqual(['color', 'efectos']);
    expect(carouselWindow(items, 3, 2)).toEqual(['efectos', 'brillo']);
  });

  it('con tres visibles de cuatro', () => {
    expect(carouselWindow(items, 0, 3)).toEqual(['brillo', 'temperatura', 'color']);
    expect(carouselWindow(items, 1, 3)).toEqual(['temperatura', 'color', 'efectos']);
  });

  it('la flecha avanza una posición y de la última pasa a la primera', () => {
    expect(nextStart(0, 4)).toBe(1);
    expect(nextStart(3, 4)).toBe(0);
    expect(nextStart(0, 0)).toBe(0);
  });

  it('sin elementos no hay ventana', () => {
    expect(carouselWindow([], 0, 2)).toEqual([]);
  });
});
