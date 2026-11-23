import { css } from 'lit';

/** Estilos del cuerpo: porcentaje, dial en arco y deslizadores de posición e inclinación. */
export const NEON_COVER_BODY_STYLES = css`
  .position-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .position-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .position-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .position-value {
    font-size: 56px;
    font-weight: 600;
    line-height: 1.05;
    color: var(--cover-color);
    transition: color 300ms ease-out;
  }

  .position-value .unit {
    font-size: 26px;
    margin-left: 2px;
  }

  /* El arco (barrido de 180°) solo dibuja en la mitad superior de la caja
     cuadrada del viewBox: se recorta el alto del contenedor a esa franja y
     el <svg> cuadrado desborda por debajo sin reservar espacio. */
  .dial-wrap {
    position: relative;
    flex: 0 0 auto;
    width: 170px;
    height: 100px;
  }

  .dial-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 170px;
    height: 170px;
    overflow: visible;
    touch-action: none;
    /* Solo el arco y el punto (más abajo) capturan el puntero: el resto del
       cuadrado desbordado taparía los controles de debajo. */
    pointer-events: none;
  }

  .dial-track {
    fill: none;
    stroke: color-mix(in srgb, var(--primary-text-color) 12%, transparent);
    stroke-width: 3.5;
    stroke-linecap: round;
    pointer-events: none;
  }

  .dial-arc {
    fill: none;
    stroke-width: 3.5;
    stroke-linecap: round;
    pointer-events: none;
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--cover-color) 75%, transparent));
  }

  .dial-dot {
    fill: var(--cover-color);
    stroke: var(--card-background-color, #1c1c1c);
    stroke-width: 1.5;
    pointer-events: none;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--cover-color) 90%, transparent));
  }

  /* Zonas de toque invisibles, más anchas que el trazo y el punto. El
     extremo es recto para no invadir lo que hay debajo. */
  .dial-hit {
    fill: none;
    stroke: transparent;
    stroke-width: 34;
    stroke-linecap: butt;
    pointer-events: stroke;
    cursor: pointer;
  }

  .dial-hit-dot {
    fill: transparent;
    pointer-events: all;
    cursor: pointer;
  }

  /* Deslizadores: pista con el tramo recorrido relleno por --pct. */
  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 22px;
    margin: 0;
    background: transparent;
    cursor: pointer;
    touch-action: pan-y;
  }

  .slider:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .slider::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--neon-c2) 0, var(--cover-color) var(--pct), color-mix(in srgb, var(--primary-text-color) 14%, transparent) var(--pct));
  }

  .slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--neon-c2) 0, var(--cover-color) var(--pct), color-mix(in srgb, var(--primary-text-color) 14%, transparent) var(--pct));
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    margin-top: -7px;
    border-radius: 50%;
    border: 3px solid var(--cover-color);
    background: var(--card-background-color, #1c1c1c);
    box-shadow: 0 0 8px color-mix(in srgb, var(--cover-color) 80%, transparent);
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid var(--cover-color);
    background: var(--card-background-color, #1c1c1c);
    box-shadow: 0 0 8px color-mix(in srgb, var(--cover-color) 80%, transparent);
  }

  .slider:focus-visible {
    outline: none;
  }

  .slider:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--cover-color) 35%, transparent), 0 0 8px var(--cover-color);
  }

  .scale {
    display: flex;
    justify-content: space-between;
    margin: -4px 0 2px;
    font-size: 13px;
    color: var(--secondary-text-color);
  }

  .tilt-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 6px 0 -8px;
  }

  .tilt-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .tilt-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--cover-color);
  }
`;
