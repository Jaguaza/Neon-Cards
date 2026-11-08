import { css } from 'lit';

/**
 * Estilos del icono que se enciende de abajo arriba, del color de la luz
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
  .icon-base {
    color: var(--secondary-text-color);
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
