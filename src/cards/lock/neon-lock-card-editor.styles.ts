import { css } from 'lit';

/** Estilos propios del editor de la Lock card (los comunes están en `NEON_EDITOR_FORM_STYLES`). */
export const NEON_LOCK_EDITOR_STYLES = css`
  .reset-colors {
    align-self: flex-start;
    margin-top: 4px;
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--primary-color);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    text-decoration: underline;
  }
  .icon-picker {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .icon-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 6px;
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
    cursor: pointer;
  }
  .icon-tile:hover {
    background: var(--secondary-background-color);
  }
  .icon-tile:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .icon-tile.selected {
    border-color: var(--primary-color);
    box-shadow: inset 0 0 0 1px var(--primary-color);
  }
  ha-formfield {
    display: flex;
  }
  .icon-tile .lock-icon {
    margin-bottom: 0;
    color: var(--primary-text-color);
  }
  .icon-tile.selected .lock-icon {
    color: var(--primary-color);
  }
  .data-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.12);
  }
  .data-card.on {
    border-color: var(--primary-color);
  }
  .data-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .data-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
  }
  .data-card.on .data-icon {
    background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    color: var(--primary-color);
  }
  .data-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .data-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .data-desc,
  .data-hint {
    font-size: 12px;
    line-height: 16px;
    color: var(--secondary-text-color);
  }
  .data-warning {
    font-size: 12px;
    line-height: 16px;
    color: var(--warning-color, #ffa600);
  }
`;
