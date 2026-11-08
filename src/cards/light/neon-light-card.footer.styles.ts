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
  .footer-buttons {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
  }
  /* La fila de la barra encoge con la tarjeta: la barra cede ancho antes de
     que nada se salga (ver el @container del final). */
  .control {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    gap: 6px;
  }
  /* Los iconos se reparten todo el ancho del pie a partes iguales. */
  .foot-btn {
    flex: 1 1 0;
    min-width: 0;
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
    flex: 0 0 28px;
    max-width: 28px;
  }
  .control-icon {
    --mdc-icon-size: 20px;
    flex: none;
    color: var(--neon-c1);
  }
  .control-value {
    flex: none;
    min-width: 3.5ch;
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

  /* Tarjeta muy estrecha: la barra necesita su ancho, así que el icono del
     control (que ya identifica el color de la barra) deja su sitio al valor. */
  @container (max-width: 160px) {
    .control-icon {
      display: none;
    }
  }

  /* Por debajo de esto ya no cabe ni el valor: queda la barra y cerrar. */
  @container (max-width: 110px) {
    .control-value {
      display: none;
    }
  }
`;
