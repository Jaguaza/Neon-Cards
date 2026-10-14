import { css } from 'lit';

/**
 * Estilos del candado (ver `lock-icon.ts`). Aquí solo hay tamaño, color y
 * grosor del arco: no hay transiciones CSS, el movimiento lo calcula
 * `lock-geometry.ts` y lo pinta `NeonLockCard` fotograma a fotograma.
 */
export const NEON_LOCK_ICON_STYLES = css`
  .lock-icon {
    width: 40px;
    height: 40px;
    flex: none;
    margin-bottom: 2px;
    overflow: visible;
    color: var(--state-icon-color, var(--primary-text-color));
  }
  .lock-icon .body {
    fill: currentColor;
  }
  .lock-icon .shackle {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;
