import { css } from 'lit';

/**
 * Estilos propios del editor de Button Card — solo lo específico de
 * Button (bloque de sensor suelto/agrupado). La carcasa común del
 * formulario (secciones, selects/inputs nativos, selector de color,
 * bloque de acción) vive en `src/shared/editor-form.styles.ts` y se
 * compone en `static styles` del editor (acuerdo nº4 — antes estaba
 * duplicada aquí y en `neon-card-entity-editor.ts`).
 */
export const NEON_BUTTON_CARD_EDITOR_STYLES = css`
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
