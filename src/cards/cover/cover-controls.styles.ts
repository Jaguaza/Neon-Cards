import { css } from 'lit';

/**
 * Estilos del pie con los botones Cerrar, Parar y Abrir. Misma cuadrícula de
 * columnas iguales con divisor vertical que el pie de sensores de la
 * Thermostat, pero con botones: icono y texto algo mayores para pulsarlos
 * bien.
 */
export const NEON_COVER_CONTROLS_STYLES = css`
  .controls {
    display: grid;
    grid-template-columns: repeat(var(--count, 3), 1fr);
    align-items: center;
    width: 100%;
    min-width: 0;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: stretch;
    gap: 6px;
    min-width: 0;
    padding: 8px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: color 200ms ease-out, background 200ms ease-out;
  }

  /* El divisor cae en el borde real de la columna; sin radio para que sea una línea recta. */
  .control--divided {
    border-left: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .control ha-icon {
    --mdc-icon-size: 18px;
  }

  .control:hover,
  .control:focus-visible {
    background: color-mix(in srgb, var(--cover-color) 12%, transparent);
    color: var(--primary-text-color);
    outline: none;
  }

  /* La persiana va hacia ahí o ya está ahí. */
  .control[data-active='true'] {
    color: var(--cover-color);
  }

  .control[data-active='true'] ha-icon {
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--cover-color) 80%, transparent));
  }

  .control:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;
