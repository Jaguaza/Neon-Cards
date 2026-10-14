// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { GARAGE_SLIDING_ICON, panelPath, slidingGeometry } from './garage-sliding';
import { attr, renderIcon } from './render-helper';

const grid = Array.from({ length: 41 }, (_, i) => i / 40);

describe('garaje con puerta corredera', () => {
  it('cerrado: el panel cubre el hueco con las tres lamas de mdi:garage-variant', () => {
    expect(slidingGeometry(0)).toEqual({ left: 5, right: 19, stileRight: 6 });
  });

  it('abierto: el panel se ha ido a la derecha y solo asoma una franja de 3 con el montante', () => {
    expect(slidingGeometry(1)).toEqual({ left: 16, right: 19, stileRight: 17 });
  });

  it('el panel solo avanza hacia la derecha y nada se dibuja pasado x=19', () => {
    let prev = slidingGeometry(0).left;
    for (const s of grid) {
      const g = slidingGeometry(s);
      expect(g.left).toBeGreaterThanOrEqual(prev);
      expect(g.left).toBeLessThan(g.right);
      expect(g.stileRight).toBeLessThanOrEqual(g.right);
      prev = g.left;
    }
  });

  it('el panel va de las lamas a y=12, 15 y 18 más el montante', () => {
    expect(panelPath(slidingGeometry(0))).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5ZM5 12H6V20H5Z');
  });

  it('paint escribe el panel del progreso', () => {
    const svg = renderIcon(GARAGE_SLIDING_ICON);
    GARAGE_SLIDING_ICON.paint(svg, 0);
    expect(attr(svg, '.panel', 'd')).toBe('M5 12H19V14H5ZM5 15H19V17H5ZM5 18H19V20H5ZM5 12H6V20H5Z');
    GARAGE_SLIDING_ICON.paint(svg, 1);
    expect(attr(svg, '.panel', 'd')).toBe('M16 12H19V14H16ZM16 15H19V17H16ZM16 18H19V20H16ZM16 12H17V20H16Z');
  });

  it('el marco es el de mdi:garage-variant', () => {
    expect(attr(renderIcon(GARAGE_SLIDING_ICON), '.frame', 'd')).toBe('M22 9V20H20V11H4V20H2V9L12 5L22 9Z');
  });
});
