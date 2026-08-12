import { css } from 'lit';

/**
 * Estilos propios del editor de Button Card. Vive en su propio archivo
 * (Acuerdo 7: archivo ≤500 líneas) — mismo patrón que
 * `neon-button-card.styles.ts` para el componente principal.
 */
export const NEON_BUTTON_CARD_EDITOR_STYLES = css`
  .editor-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px 0;
  }
  .editor-section {
    background: var(--card-background-color, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .section-header {
    font-weight: 600;
    font-size: 14px;
    color: var(--primary-text-color);
    margin-bottom: 2px;
  }
  .action-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: rgba(0, 0, 0, 0.15);
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid #39e07a;
  }
  .action-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--secondary-text-color);
  }
  .custom-colors-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 6px;
  }
  .native-select-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    display: block;
  }
  .native-select {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
    background: var(--card-background-color, #1c1c1c);
    color: var(--primary-text-color, #e5e5e5);
    padding: 0 10px;
    font-size: 14px;
    cursor: pointer;
  }
  .native-input {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
    background: var(--card-background-color, #1c1c1c);
    color: var(--primary-text-color, #e5e5e5);
    padding: 0 10px;
    font-size: 14px;
    box-sizing: border-box;
    font-family: inherit;
  }
  .color-picker-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  input[type='color'] {
    border: none;
    width: 100%;
    height: 38px;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
  }
  .sensor-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgba(0, 0, 0, 0.15);
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid #2dd6b8;
  }
  .sensor-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sensor-row ha-entity-picker {
    flex: 1;
  }
  .sensor-extra-fields {
    display: flex;
    gap: 10px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  .field.decimals-field {
    flex: 0 0 90px;
  }
  .field-label {
    font-size: 11px;
    color: var(--secondary-text-color);
  }
  .sensor-extra-fields .native-input {
    height: 34px;
    font-size: 13px;
    width: 100%;
  }
  .remove-sensor {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    font-size: 18px;
    padding: 4px 8px;
    flex: 0 0 auto;
  }
  .add-sensor {
    align-self: flex-start;
    background: none;
    border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.3));
    color: var(--primary-text-color);
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 13px;
  }
`;
