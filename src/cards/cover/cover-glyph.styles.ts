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

  /* La cortina: cada panel se recoge hacia su lado (0,78 de su ancho menos al
     abrirse del todo) y sus pliegues se juntan con él. */
  .g-panel {
    transform-box: fill-box;
    transform: scaleX(calc(1 - var(--open, 0) * 0.78));
    transition: transform 500ms ease;
  }

  .g-panel-left {
    transform-origin: 0% 50%;
  }

  .g-panel-right {
    transform-origin: 100% 50%;
  }

  /* Opaco: cerrada, la cortina tapa la ventana y el alféizar de detrás. */
  .g-fabric {
    fill: color-mix(in srgb, var(--cover-color) 30%, var(--card-background-color, #1c1c1c));
    stroke: var(--glyph-line);
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  .g-fold {
    stroke: color-mix(in srgb, var(--glyph-line) 70%, transparent);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .g-rod {
    stroke: var(--glyph-line);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .g-finial {
    fill: var(--glyph-line);
  }

  /* El toldo: la lona crece hacia abajo desde el cajón y el volante baja con su borde. */
  .g-stripes {
    transform-box: fill-box;
    transform-origin: 50% 0%;
    transform: scaleY(calc(var(--rolled, 0.14) + var(--open, 0) * (1 - var(--rolled, 0.14))));
    transition: transform 500ms ease;
  }

  .g-stripe {
    fill: var(--glyph-fill);
  }

  .g-stripe-alt {
    fill: color-mix(in srgb, var(--cover-color) 12%, transparent);
  }

  .g-valance {
    fill: var(--glyph-fill);
    stroke: var(--glyph-line);
    stroke-width: 1.2;
    transform: translateY(calc(var(--open, 0) * var(--travel, 48px)));
    transition: transform 500ms ease;
  }

  /* Al arrastrar, el dibujo sigue al dedo sin retraso. */
  .dragging .g-curtain,
  .dragging .g-blind-slat,
  .dragging .g-panel,
  .dragging .g-stripes,
  .dragging .g-valance {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .g-curtain,
    .g-blind-slat,
    .g-panel,
    .g-stripes,
    .g-valance {
      transition: none;
    }
  }
`;
