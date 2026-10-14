// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { GARAGE_SLIDING_ICON, slidingGeometry } from './garage-sliding';
import { attr, renderIcon } from './render-helper';

const grid = Array.from({ length: 41 }, (_, i) => i / 40);

describe('garaje con puerta corredera', () => {
  it('cerrado: el panel cubre el hueco, con tres ranuras y el tirador', () => {
    expect(slidingGeometry(0)).toEqual({ left: 3.9, grooves: [7.95, 12, 16.05], handleX: 4.9 });
  });

  it('abierto: el panel se ha ido a la derecha y solo asoma una franja con el tirador', () => {
    const g = slidingGeometry(1);
    expect(g.left).toBe(17.1);
    expect(g.grooves).toEqual([]);
    expect(g.handleX).toBe(18.1);
  });

  it('el panel solo avanza hacia la derecha y nada se dibuja pasado el hueco', () => {
    let prev = slidingGeometry(0).left;
    for (const s of grid) {
      const g = slidingGeometry(s);
      expect(g.left).toBeGreaterThanOrEqual(prev);
      prev = g.left;
      for (const x of g.grooves) expect(x).toBeLessThan(20.1);
      if (g.handleX !== undefined) expect(g.handleX + 1.4).toBeLessThan(20.1);
    }
  });

  it('paint escribe panel, canto, ranuras y tirador', () => {
    const svg = renderIcon(GARAGE_SLIDING_ICON);
    GARAGE_SLIDING_ICON.paint(svg, 0);
    expect(attr(svg, '.panel', 'd')).toBe('M3.9 11.6H20.1V20.6H3.9Z');
    expect(attr(svg, '.grooves', 'd')).toBe('M7.95 12.5V19.7M12 12.5V19.7M16.05 12.5V19.7');
    expect(attr(svg, '.handle', 'opacity')).toBe('1');
    GARAGE_SLIDING_ICON.paint(svg, 1);
    expect(attr(svg, '.panel', 'd')).toBe('M17.1 11.6H20.1V20.6H17.1Z');
    expect(attr(svg, '.grooves', 'd')).toBe('');
  });
});
