import { describe, it, expect } from 'vitest';
import {
  toNumericState,
  resampleSeries,
  buildTracePath,
  buildStepPath,
  TRACE_WIDTH,
  TRACE_HEIGHT,
} from './monitor-trace';

describe('toNumericState', () => {
  it('convierte números y descarta estados no numéricos', () => {
    expect(toNumericState('18.4', 'sensor')).toBe(18.4);
    expect(toNumericState('unavailable', 'sensor')).toBeNull();
    expect(toNumericState('abc', 'sensor')).toBeNull();
    expect(toNumericState('', 'sensor')).toBeNull();
  });
  it('mapea on/off de binary_sensor a 1/0', () => {
    expect(toNumericState('on', 'binary_sensor')).toBe(1);
    expect(toNumericState('off', 'binary_sensor')).toBe(0);
    expect(toNumericState('unknown', 'binary_sensor')).toBeNull();
  });
});

describe('resampleSeries', () => {
  it('promedia por tramo y mantiene el último valor en tramos vacíos', () => {
    const pts = [
      { time: 0, value: 10 },
      { time: 10, value: 20 },
      { time: 60, value: 40 },
    ];
    // 4 tramos de 25: [0,25)→(10+20)/2, [25,50)→mantiene 20, [50,75)→40, [75,100)→mantiene 40
    expect(resampleSeries(pts, 0, 100, 4)).toEqual([15, 20, 40, 40]);
  });
  it('rellena hacia atrás con el primer valor', () => {
    expect(resampleSeries([{ time: 80, value: 7 }], 0, 100, 4)).toEqual([7, 7, 7, 7]);
  });
  it('devuelve [] sin datos o con ventana inválida', () => {
    expect(resampleSeries([], 0, 100, 4)).toEqual([]);
    expect(resampleSeries([{ time: 1, value: 1 }], 100, 100, 4)).toEqual([]);
  });
});

describe('buildTracePath', () => {
  it('abarca todo el ancho y mantiene los valores dentro del alto', () => {
    const d = buildTracePath([1, 3, 2, 5]);
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    expect(xs[0]).toBe(0);
    expect(xs[xs.length - 1]).toBe(TRACE_WIDTH);
    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(Math.max(...ys)).toBeLessThan(TRACE_HEIGHT);
  });
  it('serie plana → línea horizontal centrada', () => {
    expect(buildTracePath([5, 5, 5])).toBe(`M 0 ${TRACE_HEIGHT / 2} L 100 ${TRACE_HEIGHT / 2} L 200 ${TRACE_HEIGHT / 2}`);
  });
  it('un solo valor → línea de lado a lado; vacío → cadena vacía', () => {
    expect(buildTracePath([3])).toBe(`M 0 ${TRACE_HEIGHT / 2} L ${TRACE_WIDTH} ${TRACE_HEIGHT / 2}`);
    expect(buildTracePath([])).toBe('');
  });
  it('mayor valor → y menor (más arriba)', () => {
    const d = buildTracePath([0, 10]);
    const [, y0, , y1] = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(y1).toBeLessThan(y0);
  });
});

describe('buildStepPath', () => {
  it('genera escalones verticales en cada cambio', () => {
    const d = buildStepPath([0, 1]);
    expect(d).toBe(`M 0 ${TRACE_HEIGHT - 6} L ${TRACE_WIDTH} ${TRACE_HEIGHT - 6} L ${TRACE_WIDTH} 6`);
  });
  it('vacío → cadena vacía', () => {
    expect(buildStepPath([])).toBe('');
  });
});
