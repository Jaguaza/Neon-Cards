import { describe, expect, it } from 'vitest';
import { DEFAULT_SINGLE_COLOR, DEFAULT_THRESHOLD_COLORS, THEME_COLOR, UNAVAILABLE_COLOR } from './constants';
import { resolveCardColors, resolveEffect } from './sensor-colors';

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

describe('resolveCardColors · umbrales', () => {
  const on = { thresholds_enabled: true } as const;
  it('cada nivel usa su color por defecto', () => {
    expect(resolveCardColors(on, 'low').c1).toBe(DEFAULT_THRESHOLD_COLORS.low);
    expect(resolveCardColors(on, 'ok').c1).toBe(DEFAULT_THRESHOLD_COLORS.ok);
    expect(resolveCardColors(on, 'high').c1).toBe(DEFAULT_THRESHOLD_COLORS.high);
  });
  it('usa el color elegido por el usuario y manda sobre cualquier efecto', () => {
    const cfg = { ...on, neon_effect: 'halo' as const, threshold_colors: { low: '#0000ff', high: '#ff0000' } };
    expect(resolveCardColors(cfg, 'low')).toEqual({ c1: '#0000ff', c2: '#0000ff', c3: '#0000ff' });
    expect(resolveCardColors(cfg, 'high').c3).toBe('#ff0000');
    expect(resolveCardColors(cfg, 'ok').c1).toBe(DEFAULT_THRESHOLD_COLORS.ok);
  });
  it('desactivados: los colores de nivel se ignoran', () => {
    const cfg = { thresholds_enabled: false, threshold_colors: { high: '#ff0000' } };
    expect(resolveCardColors(cfg, 'high').c1).toBe('#39e07a');
  });
});
