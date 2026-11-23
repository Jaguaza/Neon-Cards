import { css } from 'lit';

/**
 * Estilos del dibujo de la persiana (`cover-glyph.ts`). El dibujo se mueve con
 * dos variables CSS (`--open` y `--tilt`, de 0 a 1) y transiciones, así que
 * la tarjeta no repinta el SVG entero al cambiar el porcentaje.
 */
export const NEON_COVER_GLYPH_STYLES = css`
  .cover-glyph {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    --glyph-line: var(--cover-color);
    --glyph-fill: color-mix(in srgb, var(--cover-color) 30%, transparent);
  }

  ha-card.neon-halo-active .cover-glyph {
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--cover-color) 65%, transparent));
  }

  .g-glass {
    fill: color-mix(in srgb, var(--cover-color) 7%, transparent);
    stroke: color-mix(in srgb, var(--primary-text-color) 22%, transparent);
    stroke-width: 1;
  }

  .g-box,
  .g-slat,
  .g-bar {
    fill: var(--glyph-fill);
    stroke: var(--glyph-line);
    stroke-width: 1.2;
  }

  .g-bar {
    fill: var(--glyph-line);
  }

  .g-guide,
  .g-sill {
    stroke: var(--glyph-line);
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .g-curtain {
    transform: translateY(calc(var(--open, 0) * var(--travel, -64px) * -1));
    transition: transform 500ms ease;
  }

  /* La veneciana: cada lama se desplaza hacia el cabezal (--k, ya con su
     signo) y se aplasta con la inclinación, girando sobre su propio centro. */
  .g-blind-slat {
    transform-box: fill-box;
    transform-origin: center;
    transform: translateY(calc(var(--open, 0) * var(--k, 0px))) scaleY(calc(1 - var(--tilt, 0) * 0.85));
    transition: transform 500ms ease;
  }

  /* Al arrastrar, el dibujo sigue al dedo sin retraso. */
  .dragging .g-curtain,
  .dragging .g-blind-slat {
    transition: none;
  }

  .hero-mdi {
    --mdc-icon-size: 96px;
    display: block;
    color: var(--cover-color);
    transition: color 300ms ease-out;
  }

  ha-card.neon-halo-active .hero-mdi {
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--cover-color) 65%, transparent));
  }

  @media (prefers-reduced-motion: reduce) {
    .g-curtain,
    .g-blind-slat {
      transition: none;
    }
  }
`;
