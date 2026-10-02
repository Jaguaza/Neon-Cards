import { describe, it, expect } from 'vitest';
import { neonRingSplitPaths } from './glow';

/** Extrae el punto "M x y" inicial de un `d` de SVG. */
function startPoint(d: string): [number, number] {
  const match = d.match(/^M\s+([\d.-]+)\s+([\d.-]+)/);
  if (!match) throw new Error(`Sin punto de inicio en: ${d}`);
  return [parseFloat(match[1]), parseFloat(match[2])];
}

describe('neonRingSplitPaths', () => {
  it('ambas mitades arrancan exactamente en el mismo punto', () => {
    const { top, bottom } = neonRingSplitPaths(280, 120, 12, 1.2);
    expect(startPoint(top)).toEqual(startPoint(bottom));
  });

  it('el punto de inicio está separado `inset` px del borde en la esquina superior-izquierda', () => {
    const inset = 1.2;
    const radius = 12;
    const { top } = neonRingSplitPaths(280, 120, radius, inset);
    const [x, y] = startPoint(top);
    // Punto al 45° del arco de esquina: inset + radius * (1 - cos(45°)).
    const k = radius * (1 - Math.SQRT1_2);
    expect(x).toBeCloseTo(inset + k, 5);
    expect(y).toBeCloseTo(inset + k, 5);
  });

  it('recorta el radio si no cabe en un rectángulo pequeño', () => {
    // width/height muy pequeños: radius pedido (12) no puede ser mayor
    // que width/2 - inset ni height/2 - inset.
    const { top } = neonRingSplitPaths(20, 16, 12, 1);
    const [x, y] = startPoint(top);
    // Con el radio recortado, el punto de inicio debe seguir dentro del
    // rectángulo (nunca fuera de sus límites).
    expect(x).toBeGreaterThanOrEqual(1);
    expect(x).toBeLessThanOrEqual(20 - 1);
    expect(y).toBeGreaterThanOrEqual(1);
    expect(y).toBeLessThanOrEqual(16 - 1);
  });

  it('no produce un radio negativo con dimensiones degeneradas', () => {
    expect(() => neonRingSplitPaths(0, 0, 12, 1)).not.toThrow();
  });
});
