// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { GARAGE_ROLLER_ICON, rollerGeometry } from './garage-roller';
import { attr, renderIcon } from './render-helper';

const grid = Array.from({ length: 41 }, (_, i) => i / 40);

describe('garaje con puerta enrollable', () => {
  it('cerrado: barra en el suelo, tambor fino y lamas visibles', () => {
    expect(rollerGeometry(0)).toEqual({ barY: 19, rollHeight: 0.7, panelY: 12.3, panelHeight: 6.7, slats: [17.7, 15.5, 13.3] });
  });

  it('abierto: la puerta está enrollada, la barra pegada al tambor y sin lamas', () => {
    const g = rollerGeometry(1);
    expect(g.barY).toBe(14.2);
    expect(g.rollHeight).toBe(2.4);
    expect(g.slats).toEqual([]);
    expect(g.panelHeight).toBeGreaterThanOrEqual(0);
  });

  it('al abrir la barra solo sube, el tambor solo engorda y las lamas solo se pierden', () => {
    let prev = rollerGeometry(0);
    for (const s of grid.slice(1)) {
      const g = rollerGeometry(s);
      expect(g.barY).toBeLessThanOrEqual(prev.barY);
      expect(g.rollHeight).toBeGreaterThanOrEqual(prev.rollHeight);
      expect(g.slats.length).toBeLessThanOrEqual(prev.slats.length);
      prev = g;
    }
  });

  it('las lamas siempre quedan entre el tambor y la barra y el panel nunca tiene altura negativa', () => {
    for (const s of grid) {
      const g = rollerGeometry(s);
      expect(g.panelHeight).toBeGreaterThanOrEqual(0);
      for (const y of g.slats) {
        expect(y).toBeGreaterThan(g.panelY);
        expect(y).toBeLessThan(g.barY);
      }
    }
  });

  it('paint escribe tambor, panel, barra y lamas', () => {
    const svg = renderIcon(GARAGE_ROLLER_ICON);
    GARAGE_ROLLER_ICON.paint(svg, 0);
    expect(attr(svg, '.bar', 'y')).toBe('19');
    expect(attr(svg, '.roll', 'height')).toBe('0.7');
    expect(attr(svg, '.panel', 'height')).toBe('6.7');
    expect(attr(svg, '.slats', 'd')).toBe('M3.9 17.7H20.1M3.9 15.5H20.1M3.9 13.3H20.1');
    GARAGE_ROLLER_ICON.paint(svg, 1);
    expect(attr(svg, '.bar', 'y')).toBe('14.2');
    expect(attr(svg, '.slats', 'd')).toBe('');
  });
});
