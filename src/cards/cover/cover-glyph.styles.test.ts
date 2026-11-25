import { describe, expect, it } from 'vitest';
import { NEON_COVER_GLYPH_STYLES } from './cover-glyph.styles';

const css = NEON_COVER_GLYPH_STYLES.cssText.replace(/\s+/g, ' ');

describe('estilos del dibujo en tema claro', () => {
  it('con data-neon-light el resplandor pasa a un contorno fino oscuro del mismo tono', () => {
    const rule = css.slice(css.indexOf(':host([data-neon-light]) ha-card.neon-halo-active .cover-glyph'));
    expect(rule).toContain('filter: drop-shadow(0 0 0.6px color-mix(in srgb, var(--cover-color) 40%, #000))');
    expect(rule.indexOf('}')).toBeGreaterThan(0);
  });

  it('en tema oscuro el resplandor sigue siendo el de siempre', () => {
    expect(css).toContain('ha-card.neon-halo-active .cover-glyph { filter: drop-shadow(0 0 5px');
  });
});
