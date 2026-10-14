// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCK_ICON, LOCK_ICONS, LOCK_ICON_TYPES, resolveLockIconType } from './index';
import { renderIcon } from './render-helper';

describe('registro de iconos', () => {
  it('ofrece candado, puerta, garaje enrollable y garaje corredera, en ese orden', () => {
    expect([...LOCK_ICON_TYPES]).toEqual(['padlock', 'door', 'garage_roller', 'garage_sliding']);
    for (const type of LOCK_ICON_TYPES) expect(LOCK_ICONS[type]).toBeDefined();
  });

  it('un valor desconocido o ausente es el candado', () => {
    expect(DEFAULT_LOCK_ICON).toBe('padlock');
    for (const v of [undefined, null, '', 'puerta', 5, {}]) expect(resolveLockIconType(v)).toBe('padlock');
    for (const type of LOCK_ICON_TYPES) expect(resolveLockIconType(type)).toBe(type);
  });

  for (const type of LOCK_ICON_TYPES) {
    describe(type, () => {
      const def = LOCK_ICONS[type];

      it('tiene duración positiva y una plantilla <svg class="lock-icon"> con el marcador is-open', () => {
        expect(def.durationMs).toBeGreaterThan(0);
        expect(renderIcon(def, false).classList.contains('lock-icon')).toBe(true);
        expect(renderIcon(def, false).classList.contains('is-open')).toBe(false);
        expect(renderIcon(def, true).classList.contains('is-open')).toBe(true);
      });

      it('en todo el recorrido (y fuera de él) no escribe NaN, undefined ni Infinity', () => {
        const svg = renderIcon(def);
        for (const s of [-1, 0, 0.1, 0.25, 0.364, 0.5, 0.75, 0.99, 1, 2]) {
          def.paint(svg, s);
          for (const el of Array.from(svg.querySelectorAll('*'))) {
            for (const a of Array.from(el.attributes)) expect(a.value).not.toMatch(/NaN|undefined|Infinity/);
          }
        }
      });

      it('cerrado y abierto se dibujan distinto, y pintar dos veces lo mismo da lo mismo', () => {
        const snapshot = (s: number) => {
          const svg = renderIcon(def);
          def.paint(svg, s);
          return svg.innerHTML;
        };
        expect(snapshot(0)).not.toBe(snapshot(1));
        expect(snapshot(0.5)).toBe(snapshot(0.5));
      });
    });
  }
});
