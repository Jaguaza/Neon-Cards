import { css } from 'lit';

/**
 * Estilos propios del editor de la Alarm card (los comunes están en
 * `NEON_EDITOR_FORM_STYLES`). Los controles son grandes en todos los
 * dispositivos: filas de 48px que se pulsan enteras, botones de 44px y
 * muestrarios de color cómodos de tocar, sea con ratón o con el dedo.
 */
export const NEON_ALARM_EDITOR_STYLES = css`
  .data-hint {
    font-size: 12px;
    line-height: 16px;
    color: var(--secondary-text-color);
  }
  .sensor-slot {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sensor-checks {
    margin-top: 4px;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .sensor-checks summary {
    cursor: pointer;
    padding: 12px 0;
    color: var(--secondary-text-color);
  }
  /* Lista de sensores a ocultar: una fila por sensor, sin scroll interno (el
     propio editor ya hace scroll y dos scrolls anidados se pelean). */
  .sensor-checks-list {
    display: flex;
    flex-direction: column;
  }
  .sensor-checks-list ha-formfield {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color) 10%, transparent);
    --mdc-checkbox-touch-target-size: 48px;
  }
  .bulk-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 4px 0;
  }
  .bulk-btn {
    min-height: 44px;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-color);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  .bulk-btn:hover:not(:disabled),
  .bulk-btn:focus-visible {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    outline: none;
  }
  .bulk-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .color-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 4px 0 10px;
  }
  /* Una fila por color: el nombre a la izquierda y el muestrario a la derecha. */
  .color-list .color-picker-wrapper {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
  }
  .color-list input[type='color'] {
    flex: none;
    width: 64px;
    min-width: 64px;
    height: 36px;
  }
  .reset-colors {
    align-self: flex-start;
    margin-top: 6px;
  }
`;
