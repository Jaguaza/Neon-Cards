import { css } from 'lit';

/**
 * Estilos de los iconos animados (ver `icons/`). Aquí solo hay tamaño,
 * color y trazos: no hay transiciones CSS, el movimiento lo calcula cada
 * icono (`paint`) y lo escribe `NeonLockCard` fotograma a fotograma.
 *
 * Clases comunes a todos los iconos: `solid` (relleno), `soft` (relleno
 * suave para paneles) y `line` (trazo sin relleno).
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
  .lock-icon .body,
  .lock-icon .solid {
    fill: currentColor;
  }
  .lock-icon .soft {
    fill: currentColor;
    fill-opacity: 0.22;
  }
  .lock-icon .line {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .lock-icon .shackle {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;
