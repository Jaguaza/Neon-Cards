import { css } from 'lit';

/**
 * Estilos del dial arrastrable (vista grande) — extraído de
 * `neon-thermostat-card.styles.ts` (acuerdo nº7). Se compone junto al
 * resto en `static styles` del componente.
 */
export const THERMOSTAT_DIAL_STYLES = css`
  /* ---- Dial arrastrable (vista grande): un único arco continuo con
     halo transparente→color→transparente (ver DIAL_START_ANGLE/
     DIAL_END_ANGLE), pegado a la píldora de abajo, sirve también de
     control de consigna. ---- */
  .dial-wrap {
    /* El arco (barrido de 180°, diámetro horizontal) dibuja solo en la
       mitad superior de la caja cuadrada del viewBox — se recorta la
       altura del contenedor a esa franja real para que no "flote" con
       hueco antes de la píldora (ver comentario de DIAL_START_ANGLE/
       DIAL_END_ANGLE). El <svg> cuadrado se posiciona absoluto por
       encima, desbordando sin reservar espacio. Alto ligeramente mayor
       que el estrictamente necesario para el trazo visible: dentro cabe
       también la zona de toque ampliada del punto (.dial-hit-dot, más
       grande a petición — "difícil de seleccionar"), sin que se corte
       ni se solape con la píldora de abajo. */
    position: relative;
    width: 150px;
    height: 88px;
    flex-shrink: 0;
  }

  .dial-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 150px;
    height: 150px;
    /* El cuadrado del <svg> se desborda por debajo del recorte visual
       de .dial-wrap (arriba) para no distorsionar el círculo — sin
       esto, esa franja invisible seguía capturando el toque cuando el
       usuario pulsaba el "+" de la píldora justo debajo (bug
       reportado: el "+" a veces saltaba a 35°). El arco/punto
       reactivan la captura de puntero explícitamente más abajo. */
    touch-action: none;
    pointer-events: none;
    overflow: visible;
  }

  /* Siempre a brillo pleno — NO se atenúa según isClimateRunning. (Se
     probó una variante atenuada/encendida ligada a eso y se descartó
     explícitamente: "debe quedar siempre incrementado, como estaba
     antes".) */
  .dial-arc {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
    /* Puramente visual — la captura de puntero vive en .dial-hit /
       .dial-hit-dot (zona más ancha, ver más abajo), no aquí. */
    pointer-events: none;
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--current-color, transparent) 75%, transparent));
  }

  .dial-dot {
    fill: var(--current-color, var(--state-icon-color));
    stroke: var(--card-background-color, #1c1c1c);
    stroke-width: 1.5;
    pointer-events: none;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--current-color, transparent) 90%, transparent));
  }

  /* Zonas de toque invisibles, bastante más anchas que el trazo/punto
     visibles (que se quedan finos a propósito, petición explícita) —
     el control era muy difícil de acertar con el dedo tal cual se veía.
     Comparten los mismos manejadores de puntero del <svg> (burbujeo). */
  .dial-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 34;
    /* Extremo recto (no redondeado): con extremo redondeado, la zona de
       toque se alargaría más allá del final geométrico del arco (justo
       hacia abajo en los dos extremos, donde el arco es tangente
       vertical) y volvería a invadir la píldora de abajo — el mismo bug
       de toques fantasma que ya se corrigió una vez. */
    stroke-linecap: butt;
    pointer-events: stroke;
    cursor: pointer;
  }

  .dial-hit-dot {
    fill: transparent;
    pointer-events: all;
    cursor: pointer;
  }
`;
