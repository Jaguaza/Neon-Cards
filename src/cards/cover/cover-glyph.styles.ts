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

  /* Tema claro (\`BaseNeonCard\` pone \`data-neon-light\` en el host): el color neón
     apenas contrasta con un fondo claro y el resplandor difuminaba el trazo
     fino del dibujo. Igual que el resto de iconos de la colección
     (\`NEON_HALO_STYLES\`), se conserva el color y se cambia el resplandor por
     un contorno fino del mismo tono oscurecido. En oscuro no cambia nada. */
  :host([data-neon-light]) ha-card.neon-halo-active .cover-glyph {
    filter: drop-shadow(0 0 0.6px color-mix(in srgb, var(--neon-c1) 40%, #000))
      drop-shadow(0 0 1px color-mix(in srgb, var(--neon-c1) 40%, #000))
      drop-shadow(0 0 3px color-mix(in srgb, var(--neon-c1) 40%, transparent));
  }

  /* La ventana: marco, cristal y crucetas. */
  .g-frame {
    fill: none;
    stroke: color-mix(in srgb, var(--primary-text-color) 50%, transparent);
    stroke-width: 1.6;
  }

  .g-glass {
    fill: color-mix(in srgb, var(--cover-color) 9%, transparent);
    stroke: none;
  }

  .g-mullion {
    stroke: color-mix(in srgb, var(--primary-text-color) 38%, transparent);
    stroke-width: 1.4;
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

  .g-guide {
    stroke: var(--glyph-line);
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .g-sill {
    stroke: var(--glyph-line);
    stroke-width: 2;
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

  /* La cortina: cada pliegue se desplaza hacia el lado de su panel (--k, ya
     con su signo) y se estrecha al abrirse, y el conjunto se amontona. Opaco:
     cerrada, tapa la ventana. */
  .g-pleat {
    transform-box: fill-box;
    transform-origin: center;
    transform: translateX(calc(var(--open, 0) * var(--k, 0px))) scaleX(calc(1 - var(--open, 0) * 0.4));
    transition: transform 500ms ease;
  }

  .g-drape {
    fill: color-mix(in srgb, var(--cover-color) 30%, var(--card-background-color, #1c1c1c));
    stroke: var(--glyph-line);
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  .g-hilite {
    stroke: color-mix(in srgb, var(--glyph-line) 55%, transparent);
    stroke-width: 1;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  .g-ring {
    fill: none;
    stroke: var(--glyph-line);
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  /* La alzapaño aparece al recoger la cortina. */
  .g-tie {
    fill: var(--glyph-line);
    opacity: clamp(0, calc(var(--open, 0) * 3 - 1.5), 1);
    transition: opacity 500ms ease;
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
  .g-stripes,
  .g-screen {
    transform-box: fill-box;
    transform-origin: 50% 0%;
    transform: scaleY(calc(var(--rolled, 0.14) + var(--open, 0) * (1 - var(--rolled, 0.14))));
    transition: transform 500ms ease;
  }

  /* Opaco: la lona tapa la ventana de detrás. */
  .g-stripe {
    fill: color-mix(in srgb, var(--cover-color) 32%, var(--card-background-color, #1c1c1c));
  }

  .g-stripe-alt {
    fill: color-mix(in srgb, var(--cover-color) 14%, var(--card-background-color, #1c1c1c));
  }

  .g-valance,
  .g-screen-bar {
    fill: color-mix(in srgb, var(--cover-color) 32%, var(--card-background-color, #1c1c1c));
    stroke: var(--glyph-line);
    stroke-width: 1.2;
    transform: translateY(calc(var(--open, 0) * var(--travel, 48px)));
    transition: transform 500ms ease;
  }

  /* La pantalla de proyector: lienzo claro, como una pantalla de verdad. */
  .g-canvas {
    fill: color-mix(in srgb, var(--primary-text-color) 16%, var(--card-background-color, #1c1c1c));
    stroke: var(--glyph-line);
    stroke-width: 1.2;
  }

  .g-screen-bar {
    stroke: var(--glyph-line);
    stroke-width: 1.2;
  }

  /* El «play» aparece cuando están abiertas del todo. */
  .g-play {
    fill: var(--glyph-line);
    opacity: clamp(0, calc(var(--open, 0) * 5 - 4), 1);
    transition: opacity 500ms ease;
  }

  /* La TV en mueble: la TV sube desde dentro del mueble (recortada a su borde). */
  .g-tv {
    transform: translateY(calc((1 - var(--open, 0)) * var(--travel, 62px)));
    transition: transform 500ms ease;
  }

  .g-tv-body {
    fill: color-mix(in srgb, var(--primary-text-color) 8%, var(--card-background-color, #1c1c1c));
    stroke: var(--glyph-line);
    stroke-width: 1.4;
  }

  .g-tv-screen {
    fill: color-mix(in srgb, var(--cover-color) 16%, var(--card-background-color, #1c1c1c));
  }

  .g-cabinet {
    fill: color-mix(in srgb, var(--cover-color) 24%, var(--card-background-color, #1c1c1c));
    stroke: var(--glyph-line);
    stroke-width: 1.4;
  }

  .g-cabinet-line {
    stroke: color-mix(in srgb, var(--glyph-line) 70%, transparent);
    stroke-width: 1.2;
  }

  .g-handle {
    fill: var(--glyph-line);
  }

  /* Al arrastrar, el dibujo sigue al dedo sin retraso. */
  .dragging .g-curtain,
  .dragging .g-blind-slat,
  .dragging .g-pleat,
  .dragging .g-tie,
  .dragging .g-stripes,
  .dragging .g-valance,
  .dragging .g-screen,
  .dragging .g-screen-bar,
  .dragging .g-tv,
  .dragging .g-play {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .g-curtain,
    .g-blind-slat,
    .g-pleat,
    .g-tie,
    .g-stripes,
    .g-valance,
    .g-screen,
    .g-screen-bar,
    .g-tv,
    .g-play {
      transition: none;
    }
  }
`;
