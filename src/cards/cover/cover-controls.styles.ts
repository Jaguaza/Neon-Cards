import { css } from 'lit';

/** Estilos de la fila de botones Cerrar, Parar y Abrir. */
export const NEON_COVER_CONTROLS_STYLES = css`
  .controls {
    display: grid;
    grid-template-columns: repeat(var(--count, 3), 1fr);
    gap: 12px;
    padding-top: 14px;
    border-top: 1px solid color-mix(in srgb, var(--primary-text-color) 14%, transparent);
  }

  .control {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 0;
    height: 64px;
    padding: 0 8px;
    border-radius: 18px;
    border: 1.5px solid color-mix(in srgb, var(--primary-text-color) 18%, transparent);
    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 200ms ease-out, box-shadow 200ms ease-out, background 200ms ease-out;
  }

  .control ha-icon {
    --mdc-icon-size: 26px;
    color: var(--cover-color);
  }

  .control:hover,
  .control:focus-visible {
    background: color-mix(in srgb, var(--cover-color) 14%, transparent);
    outline: none;
  }

  .control[data-active='true'] {
    border-color: var(--cover-color);
    box-shadow: 0 0 10px color-mix(in srgb, var(--cover-color) 45%, transparent);
  }

  .control:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;
