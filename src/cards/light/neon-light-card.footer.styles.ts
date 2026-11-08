import { css } from 'lit';

/**
 * Pie de la tarjeta: fila de iconos y, en su lugar, la barra del control
 * abierto. Alto fijo: abrir una barra no mueve nada.
 */
export const NEON_LIGHT_FOOTER_STYLES = css`
  .footer {
    box-sizing: border-box;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    cursor: default;
  }
  .footer-buttons,
  .control {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
  }
  .foot-btn {
    flex: 1 1 0;
    min-width: 0;
    max-width: 56px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: background 200ms ease-out, color 200ms ease-out;
  }
  .foot-btn:hover,
  .foot-btn:focus-visible {
    background: color-mix(in srgb, var(--neon-c1) 22%, transparent);
    color: var(--primary-text-color);
    outline: none;
  }
  .foot-btn ha-icon {
    --mdc-icon-size: 20px;
  }
  .foot-btn--close {
    flex: 0 0 32px;
    max-width: 32px;
  }
  .control-icon {
    --mdc-icon-size: 20px;
    flex: none;
    color: var(--neon-c1);
  }
  .control-value {
    flex: none;
    min-width: 4ch;
    text-align: right;
    font-size: 11px;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .slider {
    flex: 1 1 auto;
    min-width: 40px;
    height: 10px;
    margin: 0;
    border-radius: 5px;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    /* El gesto horizontal es de la barra; el vertical sigue desplazando el dashboard. */
    touch-action: pan-y;
  }
  .slider--brightness {
    background: linear-gradient(90deg, color-mix(in srgb, var(--neon-c1) 15%, transparent), var(--neon-c1));
  }
  .slider--color_temp {
    background: linear-gradient(90deg, #ff9d3d, #ffe9c4 50%, #a8d0ff);
  }
  .slider--color {
    background: linear-gradient(90deg, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00);
  }
  .slider::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--neon-c1);
    box-shadow: 0 0 6px color-mix(in srgb, var(--neon-c1) 60%, transparent);
  }
  .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--neon-c1);
    box-shadow: 0 0 6px color-mix(in srgb, var(--neon-c1) 60%, transparent);
  }
  .slider::-moz-range-track {
    background: transparent;
  }
`;
