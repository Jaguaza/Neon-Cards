// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { DOOR_ICON, DOOR_MAX_ANGLE, doorAngle, doorKnobPath, doorLeafPath } from './door';
import { attr, renderIcon } from './render-helper';

const grid = Array.from({ length: 41 }, (_, i) => i / 40);
const count = (d: string, ch: string) => d.split(ch).length - 1;
const farX = (d: string) => Number(d.match(/^M[\d.-]+ [\d.-]+L([\d.-]+) /)![1]);

describe('puerta (mdi:door-closed → mdi:door-open)', () => {
  it('cerrada: no hay hoja que dibujar y el pomo es el de mdi:door-closed', () => {
    expect(doorLeafPath(0)).toBe('');
    expect(doorKnobPath(0)).toBe('M16 11H18V13H16Z');
  });

  it('abierta: la hoja maciza queda a la izquierda con el pomo como agujero (mdi:door-open)', () => {
    expect(doorLeafPath(1)).toBe('M10 5L3 5L3 19L10 19ZM5 11H7V13H5Z');
    expect(doorKnobPath(1)).toBe('');
  });

  it('el marco es el de mdi:door-closed sin el pomo', () => {
    const frame = attr(renderIcon(DOOR_ICON), '.frame', 'd');
    expect(frame).toBe('M12 3H19C20.11 3 21 3.89 21 5V19H22V21H2V19H10V5C10 3.89 10.89 3 12 3ZM12 5V19H19V5H12Z');
  });

  it('el ángulo va de 0 a 180 sin retroceder', () => {
    expect(doorAngle(0)).toBe(0);
    expect(doorAngle(1)).toBe(DOOR_MAX_ANGLE);
    let prev = -1;
    for (const s of grid) {
      expect(doorAngle(s)).toBeGreaterThanOrEqual(prev);
      prev = doorAngle(s);
    }
  });

  it('de frente la hoja es un contorno en «U» (8 puntos) con el pomo relleno aparte', () => {
    const d = doorLeafPath(0.25);
    expect(count(d, 'L')).toBe(7);
    expect(count(d, 'M')).toBe(1);
    expect(doorKnobPath(0.25)).not.toBe('');
  });

  it('de espaldas la hoja es maciza (4 puntos) y el pomo es un agujero dentro del mismo trazo', () => {
    const d = doorLeafPath(0.75);
    expect(count(d, 'M')).toBe(2);
    expect(count(d, 'L')).toBe(3);
    expect(doorKnobPath(0.75)).toBe('');
  });

  it('a los 90° la hoja queda de canto, pegada al eje de la bisagra', () => {
    expect(doorLeafPath(0.5).startsWith('M11 ')).toBe(true);
    expect(farX(doorLeafPath(0.5))).toBe(11);
  });

  it('el canto libre solo se mueve hacia la izquierda al abrir', () => {
    let prev = Infinity;
    for (const s of grid) {
      const d = doorLeafPath(s);
      if (!d) continue;
      expect(farX(d)).toBeLessThanOrEqual(prev);
      prev = farX(d);
    }
  });

  it('paint escribe la hoja y el pomo', () => {
    const svg = renderIcon(DOOR_ICON);
    DOOR_ICON.paint(svg, 0.25);
    expect(attr(svg, '.leaf', 'd')).toBe(doorLeafPath(0.25));
    expect(attr(svg, '.knob', 'd')).toBe(doorKnobPath(0.25));
    DOOR_ICON.paint(svg, 1);
    expect(attr(svg, '.leaf', 'd')).toBe('M10 5L3 5L3 19L10 19ZM5 11H7V13H5Z');
    expect(attr(svg, '.knob', 'd')).toBe('');
  });
});
