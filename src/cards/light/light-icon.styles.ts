import { css } from 'lit';

/**
 * Estilos del icono: solo el borde en blanco con el interior transparente
 * y, encima, el relleno que se enciende de abajo arriba, del color de la luz
 * (`--light-color`; sin él, `--neon-c1`). El resplandor va en un
 * envoltorio aparte del recorte: un `filter` y un `clip-path` en el mismo
 * elemento recortarían también el resplandor.
 */
export const LIGHT_ICON_STYLES = css`
  .light-icon {
    position: relative;
    width: 40px;
    height: 40px;
    flex: none;
    margin-bottom: 2px;
  }
  .light-icon ha-icon {
    --mdc-icon-size: 40px;
    display: block;
  }
  /* Capa de abajo: solo el contorno del icono. Home Assistant pinta el relleno
     de sus iconos con currentcolor y no define trazo propio, y el trazo se
     hereda: con color transparente el interior queda vacío y el trazo blanco
     dibuja el borde, sea cual sea el icono. */
  .icon-base {
    color: transparent;
    stroke: var(--primary-text-color, #fff);
    stroke-width: 1;
    stroke-linejoin: round;
  }
  .icon-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--light-color, var(--neon-c1)) 60%, transparent));
  }
  .icon-lit {
    position: absolute;
    inset: 0;
    color: var(--light-color, var(--neon-c1));
    clip-path: inset(calc(100% - var(--fill, 0%)) 0 0 0);
    transition: clip-path 600ms ease-out, color 300ms ease-out;
  }
  @media (prefers-reduced-motion: reduce) {
    .icon-lit {
      transition: none;
    }
  }
`;
