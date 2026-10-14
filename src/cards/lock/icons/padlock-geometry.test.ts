import { describe, expect, it } from 'vitest';
import { LIFT_SHARE, shackleGeometry, shacklePath } from './padlock-geometry';

const steps = Array.from({ length: 101 }, (_, i) => i / 100);

describe('shacklePath', () => {
  it('cerrado es el arco simétrico original', () => {
    expect(shacklePath(0)).toBe('M8.5 17.5V10A3.5 3.5 0 0 1 15.5 10V13.6');
  });

  it('abierto es el arco girado 180° (a la izquierda del eje) y subido', () => {
    expect(shacklePath(1)).toBe('M8.5 14.1V6.6A3.5 3.5 0 0 0 1.5 6.6V10.2');
  });

  it('la pata larga no se mueve de x en todo el recorrido (es el eje del giro)', () => {
    for (const s of steps) expect(shacklePath(s).startsWith('M8.5 ')).toBe(true);
  });

  it('nunca produce NaN ni un arco de ancho 0 (ni siquiera de canto)', () => {
    for (const s of [...steps, -1, 2, LIFT_SHARE + (1 - LIFT_SHARE) / 2]) {
      const d = shacklePath(s);
      expect(d).not.toMatch(/NaN|Infinity/);
      const rx = Number(d.match(/A([\d.]+) /)![1]);
      expect(rx).toBeGreaterThanOrEqual(0.14);
    }
  });

  it('de canto (90°) el arco es casi una línea vertical sobre el eje', () => {
    const d = shacklePath(LIFT_SHARE + (1 - LIFT_SHARE) / 2);
    const [, endX] = d.match(/A[\d.]+ [\d.]+ 0 0 [01] (-?[\d.]+) /)!.map(Number);
    expect(Math.abs(endX - 8.5)).toBeLessThan(0.4);
  });

  it('fuera de [0, 1] se recorta a cerrado/abierto', () => {
    expect(shacklePath(-5)).toBe(shacklePath(0));
    expect(shacklePath(7)).toBe(shacklePath(1));
  });
});

describe('shackleGeometry', () => {
  it('primero sube (sin girar) y después gira (ya subido)', () => {
    expect(shackleGeometry(0)).toEqual({ lift: 0, angle: 0 });
    const beforeTurn = shackleGeometry(LIFT_SHARE);
    expect(beforeTurn.angle).toBe(0);
    expect(beforeTurn.lift).toBeCloseTo(3.4);
    expect(shackleGeometry(LIFT_SHARE / 2).angle).toBe(0);
    expect(shackleGeometry(LIFT_SHARE + 0.2).lift).toBeCloseTo(3.4);
    expect(shackleGeometry(1)).toEqual({ lift: 3.4, angle: 180 });
  });

  it('es monótono: subida y ángulo nunca retroceden al avanzar s', () => {
    let prev = shackleGeometry(0);
    for (const s of steps.slice(1)) {
      const g = shackleGeometry(s);
      expect(g.lift).toBeGreaterThanOrEqual(prev.lift);
      expect(g.angle).toBeGreaterThanOrEqual(prev.angle);
      prev = g;
    }
  });
});
