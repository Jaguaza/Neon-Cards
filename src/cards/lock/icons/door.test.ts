// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { DOOR_ICON, DOOR_MAX_ANGLE, doorAngle, doorLeafPath, doorRoomOpacity } from './door';
import { attr, renderIcon } from './render-helper';

const freeX = (d: string) => Number(d.match(/^M[\d.]+ [\d.]+L([\d.]+) /)![1]);
const grid = Array.from({ length: 21 }, (_, i) => i / 20);

describe('puerta', () => {
  it('cerrada: la hoja ocupa todo el hueco, con el pomo como agujero', () => {
    const d = doorLeafPath(0);
    expect(d.startsWith('M6.3 5L17.7 5V20.4L6.3 20.4Z')).toBe(true);
    expect(d).toContain('a0.9 0.9'); // pomo
  });

  it('abierta: el canto libre se acerca a la bisagra y la hoja crece por la perspectiva', () => {
    const d = doorLeafPath(1);
    expect(freeX(d)).toBeCloseTo(6.3 + 11.4 * Math.cos((DOOR_MAX_ANGLE * Math.PI) / 180), 2);
    const top = Number(d.match(/^M[\d.]+ [\d.]+L[\d.]+ ([\d.]+)/)![1]);
    expect(top).toBeLessThan(5); // más alta que cerrada
  });

  it('el ángulo va de 0 a DOOR_MAX_ANGLE sin retroceder', () => {
    expect(doorAngle(0)).toBe(0);
    expect(doorAngle(1)).toBe(DOOR_MAX_ANGLE);
    let prev = -1;
    for (const s of grid) {
      expect(doorAngle(s)).toBeGreaterThanOrEqual(prev);
      prev = doorAngle(s);
    }
  });

  it('el canto libre solo se mueve hacia la bisagra al abrir', () => {
    let prev = Infinity;
    for (const s of grid) {
      const x = freeX(doorLeafPath(s));
      expect(x).toBeLessThanOrEqual(prev);
      prev = x;
    }
  });

  it('el hueco de detrás se descubre de 0 a 1', () => {
    expect(doorRoomOpacity(0)).toBe(0);
    expect(doorRoomOpacity(0.5)).toBe(0.5);
    expect(doorRoomOpacity(1)).toBe(1);
    expect(doorRoomOpacity(9)).toBe(1);
  });

  it('paint escribe la hoja y el hueco', () => {
    const svg = renderIcon(DOOR_ICON);
    DOOR_ICON.paint(svg, 1);
    expect(attr(svg, '.leaf', 'd')).toBe(doorLeafPath(1));
    expect(attr(svg, '.room', 'opacity')).toBe('1');
  });
});
