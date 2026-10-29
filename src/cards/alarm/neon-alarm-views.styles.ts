import { css } from 'lit';

/**
 * Estilos de las vistas que ocupan el sitio del contenido (modos,
 * confirmación, teclado y lista de sensores). Mientras hay una abierta, la
 * vista y el contenido comparten la misma celda de una rejilla: la tarjeta
 * mide lo mayor de las dos y crece en vez de cortar los botones.
 */
export const NEON_ALARM_VIEWS_STYLES = css`
  .viewing {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    max-height: none;
    container-type: inline-size;
  }
  .viewing .content,
  .viewing .view {
    grid-area: 1 / 1;
    min-width: 0;
  }
  .view {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
    z-index: 2;
    cursor: default;
    animation: view-in 180ms ease-out;
  }
  .view-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1 1 110px;
  }
  .view-title {
    font-size: 18px;
    line-height: 22px;
    font-weight: 600;
    color: var(--primary-text-color);
    text-shadow: 0 0 8px color-mix(in srgb, var(--neon-c1) 70%, transparent);
  }
  .view-title.is-error {
    color: #ff5c5c;
    text-shadow: 0 0 8px rgba(255, 92, 92, 0.6);
  }
  .view-name {
    font-size: 11px;
    line-height: 14px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .view-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    flex: 0 1 auto;
  }
  .view-btn {
    box-sizing: border-box;
    min-width: 0;
    height: 30px;
    padding: 0 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1.5px solid var(--neon-c1);
    background: transparent;
    color: var(--neon-c1);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 0 8px color-mix(in srgb, var(--neon-c1) 45%, transparent), inset 0 0 6px color-mix(in srgb, var(--neon-c1) 25%, transparent);
    transition: background 150ms ease-out, box-shadow 150ms ease-out, transform 100ms ease;
  }
  .view-btn:hover,
  .view-btn:focus-visible {
    background: color-mix(in srgb, var(--neon-c1) 22%, transparent);
    outline: none;
  }
  .view-btn:active {
    transform: scale(0.95);
  }
  .view-btn:disabled {
    opacity: 0.4;
    cursor: default;
    box-shadow: none;
  }
  .view-btn.accept {
    background: color-mix(in srgb, var(--neon-c1) 18%, transparent);
  }
  .view-btn.cancel {
    border-color: color-mix(in srgb, var(--neon-c2) 55%, transparent);
    color: var(--secondary-text-color);
    box-shadow: none;
  }
  .view-btn.icon-only {
    flex: none;
    width: 30px;
    padding: 0;
  }
  /* Compacta: sin sitio para el título del teclado o la lista; el aviso de
     código incorrecto sí se queda. */
  .size-compact .keypad-head .view-title:not(.is-error) {
    display: none;
  }
  .size-compact .keypad-head {
    justify-content: flex-end;
  }
  .view-btn ha-icon {
    --mdc-icon-size: 18px;
    margin: 0;
    color: inherit;
  }
  /* Teclado y lista: ocupan todo el ancho, en columna. */
  .view--keypad,
  .view--sensors {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    flex-wrap: nowrap;
    gap: 8px;
  }
  .keypad-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .keypad-head .view-title {
    font-size: 15px;
    line-height: 18px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .code-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    min-height: 12px;
  }
  .code-dots .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--neon-c1);
    box-shadow: 0 0 6px var(--neon-c1);
  }
  .keypad {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    max-width: 220px;
    width: 100%;
    margin: 0 auto;
  }
  .key {
    height: 34px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--neon-c1) 55%, transparent);
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 120ms ease-out, transform 80ms ease;
  }
  .key:hover,
  .key:focus-visible {
    background: color-mix(in srgb, var(--neon-c1) 22%, transparent);
    outline: none;
  }
  .key:active {
    transform: scale(0.94);
  }
  .key:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .key--accept {
    background: color-mix(in srgb, var(--neon-c1) 18%, transparent);
  }
  .key ha-icon {
    --mdc-icon-size: 20px;
    margin: 0;
    color: inherit;
  }
  .code-text {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .code-input {
    flex: 1 1 auto;
    min-width: 0;
    box-sizing: border-box;
    height: 34px;
    padding: 0 10px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--neon-c1) 55%, transparent);
    background: transparent;
    color: var(--primary-text-color);
    font: inherit;
  }
  .view--keypad.has-error .code-dots,
  .view--keypad.has-error .code-text {
    animation: code-shake 300ms ease-out;
  }
  .sensor-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 132px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sensor-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    line-height: 16px;
    color: var(--secondary-text-color);
  }
  .sensor-row.is-active {
    color: var(--alarm-sensor-active, #ffb02e);
    font-weight: 600;
  }
  .sensor-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sensor-state {
    flex: none;
  }
  .sensor-empty {
    margin: 0;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  @keyframes view-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes code-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .view,
    .view--keypad.has-error .code-dots,
    .view--keypad.has-error .code-text {
      animation: none;
    }
  }
`;
