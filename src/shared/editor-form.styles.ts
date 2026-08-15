import { css } from 'lit';

/**
 * "Carcasa" del editor visual de config, común a cualquier tarjeta con
 * un formulario de secciones (acuerdo nº4 — encontrado en auditoría:
 * Button y Entity tenían estas 11 reglas duplicadas byte a byte, cada
 * una con su propia copia dentro de su `<nombre>-editor.ts`/
 * `<nombre>-editor.styles.ts`). Cualquier tarjeta futura con el mismo
 * patrón de editor (secciones con cabecera, selects/inputs nativos,
 * bloque de acción, selector de color) debería componer esto en su
 * `static styles` en vez de copiarlo:
 *
 *   static styles = [NEON_EDITOR_FORM_STYLES, MI_TARJETA_EDITOR_STYLES];
 *
 * Lo que NO va aquí: clases específicas de una sola tarjeta (en Button,
 * `.sensor-card`/`.sensor-row`/`.field`/...; en Entity,
 * `.two-col-grid`/`.field-col`/`ha-formfield`) — esas se quedan en el
 * archivo de estilos propio de cada tarjeta.
 */
export const NEON_EDITOR_FORM_STYLES = css`
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
`;
