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
    flex: 0 0 auto;
    /* Tan estrecho como su palabra más larga: la etiqueta «Posición actual»
       baja a dos líneas en lugar de quitar sitio al dial. */
    width: min-content;
  }

  .position-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .position-value {
    font-size: 36px;
    font-weight: 600;
    line-height: 1.05;
    color: var(--cover-color);
    transition: color 300ms ease-out;
  }

  .position-value .unit {
    font-size: 18px;
    margin-left: 2px;
  }

  /* El arco (barrido de 180°) solo dibuja en la mitad superior de la caja
     cuadrada del viewBox: se recorta el alto del contenedor a esa franja y
     el <svg> cuadrado desborda por debajo sin reservar espacio. */
  .dial-wrap {
    position: relative;
    /* 150x88 como el del termostato siempre que cabe; en tarjetas estrechas
       cede ancho (hasta 52px) en lugar de pisar al porcentaje, que nunca se
       encoge. El alto sale de la proporción. */
    flex: 0 1 150px;
    min-width: 52px;
    aspect-ratio: 150 / 88;
  }

  .dial-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1;
    overflow: visible;
    touch-action: none;
    /* Solo el arco y el punto (más abajo) capturan el puntero: el resto del
       cuadrado desbordado taparía los controles de debajo. */
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

  /* Deslizadores. El alto de la banda (--slider-h) es lo que ocupa en la
     tarjeta; la zona de toque es mucho mayor (36px) gracias a un margen
     negativo, porque con el dedo el punto de 16px es muy difícil de acertar.
     El punto mide 32px (borde transparente de 8px) y solo se ve el disco
     central de 16px, el mismo que el punto del dial circular. El tramo
     recorrido (--frac, de 0 a 1) acaba justo en el centro del punto. Sin
     scroll táctil en la banda: un gesto algo diagonal ya no lo cancela. */
  .slider {
    --slider-h: 18px;
    --thumb: 32px;
    --stop: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--frac, 0));
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 36px;
    margin: calc((var(--slider-h) - 36px) / 2) 0;
    background: transparent;
    cursor: pointer;
    touch-action: none;
  }

  .slider:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .slider::-webkit-slider-runnable-track {
    height: 5px;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--neon-c2) 0, var(--cover-color) var(--stop), color-mix(in srgb, var(--primary-text-color) 14%, transparent) var(--stop));
  }

  .slider::-moz-range-track {
    height: 5px;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--neon-c2) 0, var(--cover-color) var(--stop), color-mix(in srgb, var(--primary-text-color) 14%, transparent) var(--stop));
  }

  /* Mismo punto que el del dial: disco de color con aro del fondo y halo. */
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    margin-top: -13.5px;
    border: 8px solid transparent;
    border-radius: 50%;
    background: var(--cover-color);
    background-clip: padding-box;
    box-shadow: inset 0 0 0 2.25px var(--card-background-color, #1c1c1c);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--cover-color) 90%, transparent));
  }

  .slider::-moz-range-thumb {
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    border: 8px solid transparent;
    border-radius: 50%;
    background: var(--cover-color);
    background-clip: padding-box;
    box-shadow: inset 0 0 0 2.25px var(--card-background-color, #1c1c1c);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--cover-color) 90%, transparent));
  }

  .slider:focus-visible {
    outline: none;
  }

  .slider:focus-visible::-webkit-slider-thumb {
    filter: drop-shadow(0 0 3px var(--cover-color)) drop-shadow(0 0 8px var(--cover-color));
  }

  .scale {
    display: flex;
    justify-content: space-between;
    margin: -4px 0 0;
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .tilt-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 2px 0 -6px;
  }

  .tilt-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }

  .tilt-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--cover-color);
  }

  @container (max-width: 380px) {
    .position-value {
      font-size: 30px;
    }
  }

  /* Muy estrecha (9 columnas de la grande en un móvil): menos hueco y el
     porcentaje algo menor para que el dial siga cabiendo, aunque pequeño. */
  @container (max-width: 309px) {
    .position-row {
      gap: 8px;
    }

    .position-value {
      font-size: 26px;
    }

    .position-value .unit {
      font-size: 15px;
    }
  }

  /* Ni así cabe el dial mínimo: se quita (el deslizador de debajo hace lo mismo). */
  @container (max-width: 255px) {
    .dial-wrap {
      display: none;
    }
  }
`;
