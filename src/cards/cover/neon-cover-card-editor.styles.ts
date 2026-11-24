import { css } from 'lit';

/** Estilos propios del editor de la Cover card: el selector de tipo con una ficha por dibujo. */
export const NEON_COVER_EDITOR_STYLES = css`
  .type-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .type-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
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
    --cover-color: var(--primary-text-color);
  }

  .type-tile:hover {
    background: var(--secondary-background-color);
  }

  .type-tile:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .type-tile.selected {
    border-color: var(--primary-color);
    box-shadow: inset 0 0 0 1px var(--primary-color);
    --cover-color: var(--primary-color);
  }

  .type-tile .cover-glyph {
    width: 52px;
  }

  .type-tile ha-icon {
    --mdc-icon-size: 40px;
    height: 57px;
    display: inline-flex;
    align-items: center;
    color: var(--secondary-text-color);
  }

  .type-tile.selected ha-icon {
    color: var(--primary-color);
  }

  .color-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 6px;
  }

  .data-hint {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

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
`;
