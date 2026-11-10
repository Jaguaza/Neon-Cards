import { css } from 'lit';

/** Estilos propios del editor de la Light Card: opciones del pie y lista de favoritos. Los controles son grandes y se ven igual en todos los dispositivos. */
export const NEON_LIGHT_EDITOR_STYLES = css`
  .data-hint {
    display: block;
    margin: 2px 0 4px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .footer-options {
    display: flex;
    flex-direction: column;
  }
  .footer-options ha-formfield,
  .footer-options > ha-checkbox {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color) 10%, transparent);
    --mdc-checkbox-touch-target-size: 48px;
  }
  .favorites-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 6px 0;
  }
  .favorite-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
  }
  .list-btn {
    min-height: 44px;
    padding: 4px 16px;
    border-radius: 999px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-color);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  .list-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;
