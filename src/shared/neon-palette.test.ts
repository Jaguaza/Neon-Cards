import { describe, it, expect } from 'vitest';
import { resolveGradientColors, NEON_PRESETS, DEFAULT_PALETTE } from './neon-palette';

describe('resolveGradientColors', () => {
  it('usa el preset por defecto sin config', () => {
    expect(resolveGradientColors(undefined)).toEqual({
      c1: NEON_PRESETS[DEFAULT_PALETTE].c1,
      c2: NEON_PRESETS[DEFAULT_PALETTE].c2,
      c3: NEON_PRESETS[DEFAULT_PALETTE].c3,
    });
  });

  it('resuelve un preset conocido por nombre', () => {
    expect(resolveGradientColors({ neon_palette: 'cyberpunk' })).toEqual({
      c1: NEON_PRESETS.cyberpunk.c1,
      c2: NEON_PRESETS.cyberpunk.c2,
      c3: NEON_PRESETS.cyberpunk.c3,
    });
  });

  it('cae al preset por defecto si el nombre no existe', () => {
    expect(resolveGradientColors({ neon_palette: 'no-existe' })).toEqual({
      c1: NEON_PRESETS[DEFAULT_PALETTE].c1,
      c2: NEON_PRESETS[DEFAULT_PALETTE].c2,
      c3: NEON_PRESETS[DEFAULT_PALETTE].c3,
    });
  });

  it('usa los 3 colores personalizados con neon_palette: custom', () => {
    expect(
      resolveGradientColors({
        neon_palette: 'custom',
        neon_color1: '#111111',
        neon_color2: '#222222',
        neon_color3: '#333333',
      })
    ).toEqual({ c1: '#111111', c2: '#222222', c3: '#333333' });
  });

  it('con custom, si falta algún color cae al preset por defecto solo en ese hueco', () => {
    expect(
      resolveGradientColors({
        neon_palette: 'custom',
        neon_color1: '#111111',
        // neon_color2 y neon_color3 sin definir
      })
    ).toEqual({
      c1: '#111111',
      c2: NEON_PRESETS[DEFAULT_PALETTE].c2,
      c3: NEON_PRESETS[DEFAULT_PALETTE].c3,
    });
  });
});
