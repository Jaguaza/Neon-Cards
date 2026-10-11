import { describe, expect, it } from 'vitest';
import { DEFAULT_SINGLE_COLOR, DEFAULT_THRESHOLD_COLORS, THEME_COLOR, UNAVAILABLE_COLOR } from './constants';
import { resolveCardColors, resolveEdgeColor, resolveEffect } from './sensor-colors';

describe('resolveEffect', () => {
  it('por defecto y ante valores desconocidos es halo', () => {
    expect(resolveEffect(undefined)).toBe('halo');
    expect(resolveEffect({})).toBe('halo');
    expect(resolveEffect({ neon_effect: 'raro' as never })).toBe('halo');
  });
  it('respeta normal y single', () => {
    expect(resolveEffect({ neon_effect: 'normal' })).toBe('normal');
    expect(resolveEffect({ neon_effect: 'single' })).toBe('single');
  });
});

describe('resolveCardColors · efectos (sin umbrales)', () => {
  it('halo: los tres colores de la paleta, distintos entre sí', () => {
    const c = resolveCardColors({ neon_palette: 'emerald' }, 'normal');
    expect(c).toEqual({ c1: '#39e07a', c2: '#2dd6b8', c3: '#1ecdf2' });
  });
  it('halo con paleta personalizada', () => {
    const c = resolveCardColors({ neon_palette: 'custom', neon_color1: '#111111', neon_color2: '#222222', neon_color3: '#333333' }, 'normal');
    expect(c).toEqual({ c1: '#111111', c2: '#222222', c3: '#333333' });
  });
  it('single: un único color (el elegido o el de por defecto)', () => {
    expect(resolveCardColors({ neon_effect: 'single', neon_color: '#abcdef' }, 'normal')).toEqual({ c1: '#abcdef', c2: '#abcdef', c3: '#abcdef' });
    const d = resolveCardColors({ neon_effect: 'single' }, 'normal');
    expect([d.c1, d.c2, d.c3]).toEqual([DEFAULT_SINGLE_COLOR, DEFAULT_SINGLE_COLOR, DEFAULT_SINGLE_COLOR]);
  });
  it('normal: color del tema', () => {
    const c = resolveCardColors({ neon_effect: 'normal' }, 'normal');
    expect([c.c1, c.c2, c.c3]).toEqual([THEME_COLOR, THEME_COLOR, THEME_COLOR]);
  });
  it('sin señal: neutro en todos los efectos', () => {
    for (const neon_effect of ['normal', 'halo', 'single'] as const) {
      expect(resolveCardColors({ neon_effect }, 'unavailable').c1).toBe(UNAVAILABLE_COLOR);
    }
  });
});

describe('resolveCardColors · los umbrales no tocan el gráfico', () => {
  it('con umbrales activos el gráfico sigue el efecto, no el nivel', () => {
    const cfg = { thresholds_enabled: true, neon_palette: 'emerald', threshold_colors: { high: '#ff0000', low: '#0000ff' } };
    for (const level of ['low', 'ok', 'high'] as const) {
      expect(resolveCardColors(cfg, level)).toEqual({ c1: '#39e07a', c2: '#2dd6b8', c3: '#1ecdf2' });
    }
  });
});

describe('resolveEdgeColor · el perímetro lo marcan solo los umbrales', () => {
  const on = { thresholds_enabled: true } as const;
  it('desactivados (o sin config): null, perímetro normal, con cualquier efecto', () => {
    expect(resolveEdgeColor(undefined, 'high')).toBeNull();
    for (const neon_effect of ['normal', 'halo', 'single'] as const) {
      expect(resolveEdgeColor({ neon_effect, threshold_colors: { high: '#ff0000' } }, 'high')).toBeNull();
      expect(resolveEdgeColor({ neon_effect, thresholds_enabled: false }, 'low')).toBeNull();
    }
  });
  it('activados: cada nivel usa su color por defecto', () => {
    expect(resolveEdgeColor(on, 'low')).toBe(DEFAULT_THRESHOLD_COLORS.low);
    expect(resolveEdgeColor(on, 'ok')).toBe(DEFAULT_THRESHOLD_COLORS.ok);
    expect(resolveEdgeColor(on, 'high')).toBe(DEFAULT_THRESHOLD_COLORS.high);
  });
  it('activados: usa el color elegido por el usuario', () => {
    const cfg = { ...on, threshold_colors: { low: '#0000ff', high: '#ff0000' } };
    expect(resolveEdgeColor(cfg, 'low')).toBe('#0000ff');
    expect(resolveEdgeColor(cfg, 'high')).toBe('#ff0000');
    expect(resolveEdgeColor(cfg, 'ok')).toBe(DEFAULT_THRESHOLD_COLORS.ok);
  });
  it('sin señal: neutro si hay umbrales; null si no', () => {
    expect(resolveEdgeColor(on, 'unavailable')).toBe(UNAVAILABLE_COLOR);
    expect(resolveEdgeColor({}, 'unavailable')).toBeNull();
  });
  it('lectura sin valorar (nivel normal): null', () => {
    expect(resolveEdgeColor(on, 'normal')).toBeNull();
  });
});
