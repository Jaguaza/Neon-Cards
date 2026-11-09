import { describe, expect, it } from 'vitest';
import { carouselWindow, nextStart, visibleItemCount } from './footer-carousel';

describe('cuántos iconos caben en el pie', () => {
  it('a 12 columnas (~620 px) caben los cuatro, a 9 (~460 px) tres y a 6 (~310 px) dos', () => {
    expect(visibleItemCount(4, 622)).toBe(4);
    expect(visibleItemCount(4, 464)).toBe(3);
    expect(visibleItemCount(4, 307)).toBe(2);
  });

  it('en una tarjeta muy estrecha queda al menos uno, y nunca todos si no caben', () => {
    expect(visibleItemCount(4, 202)).toBe(1);
    expect(visibleItemCount(4, 60)).toBe(1);
    expect(visibleItemCount(3, 464)).toBe(3);
  });

  it('sin medida todavía, o con un solo icono, no hay carrusel', () => {
    expect(visibleItemCount(4, 0)).toBe(4);
    expect(visibleItemCount(1, 100)).toBe(1);
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
