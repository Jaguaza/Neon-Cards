import { css } from 'lit';

/** Estilos propios del editor de la Alarm card (los comunes están en `NEON_EDITOR_FORM_STYLES`). */
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
    padding: 4px 0;
    color: var(--secondary-text-color);
  }
  .color-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 4px 0 10px;
  }
  /* Una fila por color: el nombre a la izquierda y un muestrario pequeño a la derecha. */
  .color-list .color-picker-wrapper {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .color-list input[type='color'] {
    flex: none;
    width: 56px;
    min-width: 56px;
  }
  .reset-colors {
    align-self: flex-start;
    margin-top: 6px;
  }
  .bulk-actions {
    display: flex;
    gap: 8px;
    margin: 4px 0;
  }
  .bulk-btn {
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-color);
    font: inherit;
    font-size: 12px;
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
  .sensor-checks-list {
    display: flex;
    flex-direction: column;
    max-height: 180px;
    overflow-y: auto;
  }
  .sensor-checks-list ha-formfield {
    display: flex;
    width: 100%;
    min-width: 0;
  }
  /* Móvil y pantallas táctiles: filas de 48px que se pulsan enteras, sin
     scroll interno (en el móvil el propio editor ya hace scroll y dos
     scrolls anidados se pelean) y botones de marcar todos más grandes. */
  @media (max-width: 600px), (pointer: coarse) {
    .sensor-checks summary {
      padding: 12px 0;
    }
    .sensor-checks-list {
      max-height: none;
      overflow: visible;
    }
    .sensor-checks-list ha-formfield {
      min-height: 48px;
      border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color) 10%, transparent);
      --mdc-checkbox-touch-target-size: 48px;
    }
    .bulk-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .bulk-btn {
      min-height: 44px;
      font-size: 14px;
    }
    .color-list .color-picker-wrapper {
      min-height: 44px;
    }
    .color-list input[type='color'] {
      width: 64px;
      min-width: 64px;
      height: 36px;
    }
  }
`;
