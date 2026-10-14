// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { GARAGE_ROLLER_ICON, rollerGeometry } from './garage-roller';
import { attr, renderIcon } from './render-helper';

const grid = Array.from({ length: 41 }, (_, i) => i / 40);

describe('garaje con puerta enrollable', () => {
  it('cerrado: las tres lamas de mdi:garage-variant (y=12, 15 y 18, de 2 de alto)', () => {
    expect(rollerGeometry(0)).toEqual({
      lift: 0,
      slats: [
        { y: 12, height: 2 },
        { y: 15, height: 2 },
        { y: 18, height: 2 },
      ],
    });
  });

  it('abierto: solo queda la lama inferior pegada al dintel (mdi:garage-open-variant)', () => {
    expect(rollerGeometry(1)).toEqual({ lift: 6, slats: [{ y: 12, height: 2 }] });
  });

  it('al abrir la puerta solo sube y las lamas solo se pierden', () => {
    let prev = rollerGeometry(0);
    for (const s of grid.slice(1)) {
      const g = rollerGeometry(s);
      expect(g.lift).toBeGreaterThanOrEqual(prev.lift);
      expect(g.slats.length).toBeLessThanOrEqual(prev.slats.length);
      prev = g;
    }
  });

  it('ninguna lama se dibuja por encima del dintel ni por debajo del suelo', () => {
    for (const s of grid) {
      for (const { y, height } of rollerGeometry(s).slats) {
        expect(y).toBeGreaterThanOrEqual(11);
        expect(y + height).toBeLessThanOrEqual(20);
        expect(height).toBeGreaterThan(0);
      }
    }
  });

  it('durante el recorrido una lama entra recortada bajo el dintel', () => {
    const g = rollerGeometry(0.4);
    expect(g.slats[0].y).toBe(11);
    expect(g.slats[0].height).toBeLessThan(2);
  });

  it('paint escribe las lamas del progreso', () => {
    const svg = renderIcon(GARAGE_ROLLER_ICON);
    GARAGE_ROLLER_ICON.paint(svg, 0);
    expect(attr(svg, '.slats', 'd')).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5Z');
    GARAGE_ROLLER_ICON.paint(svg, 1);
    expect(attr(svg, '.slats', 'd')).toBe('M5 12H19V14H5Z');
  });

  it('el marco es el de mdi:garage-variant', () => {
    expect(attr(renderIcon(GARAGE_ROLLER_ICON), '.frame', 'd')).toBe('M22 9V20H20V11H4V20H2V9L12 5L22 9Z');
  });
});
