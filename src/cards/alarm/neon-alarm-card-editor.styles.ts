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
  .sensor-checks-list {
    display: flex;
    flex-direction: column;
    max-height: 180px;
    overflow-y: auto;
  }
`;
