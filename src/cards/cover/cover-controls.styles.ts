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
    padding-top: 4px;
    border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: stretch;
    gap: 6px;
    min-width: 0;
    padding: 4px 8px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 150ms ease-out, background 150ms ease-out;
  }

  /* El divisor cae en el borde real de la columna; sin radio para que sea una línea recta. */
  .control--divided {
    border-left: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .control ha-icon {
    --mdc-icon-size: 18px;
    flex: 0 0 auto;
  }

  .control-label {
    white-space: nowrap;
  }

  /* Tarjetas estrechas: menos relleno y, si ni así caben icono y texto en
     cada columna, solo el icono (el nombre sigue en aria-label y title). */
  @container (max-width: 340px) {
    .control {
      gap: 4px;
      padding-left: 4px;
      padding-right: 4px;
    }
  }

  @container (max-width: 290px) {
    .control-label {
      display: none;
    }
  }

  /* Se ilumina solo mientras se pulsa y se apaga al soltar: nada de hover ni
     de resaltado por estado, que en pantallas táctiles se quedaba encendido. */
  .control:active:not(:disabled) {
    background: color-mix(in srgb, var(--cover-color) 18%, transparent);
    color: var(--cover-color);
  }

  .control:active:not(:disabled) ha-icon {
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--cover-color) 80%, transparent));
  }

  /* Foco de teclado: solo un contorno, sin iluminar el botón. */
  .control:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--cover-color) 55%, transparent);
    outline-offset: -2px;
  }

  .control:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;
