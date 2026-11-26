import { css } from 'lit';

/**
 * Estilos de la tarjeta compacta (de 3 a 6 columnas): un icono pequeño, el
 * nombre, el estado con su punto, el porcentaje y el pie de botones con solo el
 * icono. No lleva dial, deslizadores, inclinación ni «Posición actual» a la
 * vista (la etiqueta sigue ahí, oculta, para los lectores de pantalla).
 *
 * La cabecera (`.header` y `.header-text`) pasa a `display: contents` para que
 * el nombre y el estado sean celdas de la misma rejilla que el porcentaje y el
 * icono; los tres puntos flotan en la esquina. Tres niveles según el ancho de
 * la tarjeta: ≥180px (6 columnas) icono a la izquierda y texto a la derecha;
 * ≤179px (4 o 5) lo mismo algo menor; ≤125px (3) vertical, con el icono y el
 * porcentaje arriba y el nombre y el estado debajo.
 */
export const NEON_COVER_COMPACT_STYLES = css`
  ha-card[data-cover-size='compact'] {
    gap: 2px;
    padding: 10px 12px 5px;
  }

  .compact-main {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 10px;
    align-items: start;
    min-width: 0;
  }

  ha-card[data-cover-size='compact'] .header,
  ha-card[data-cover-size='compact'] .header-text {
    display: contents;
  }

  ha-card[data-cover-size='compact'] .hero-icon {
    grid-column: 1;
    grid-row: 1 / span 3;
    width: 40px;
  }

  ha-card[data-cover-size='compact'] .name {
    grid-column: 2;
    grid-row: 1;
    padding-right: 18px;
    font-size: 15px;
    line-height: 20px;
  }

  ha-card[data-cover-size='compact'] .status {
    grid-column: 2;
    grid-row: 2;
    font-size: 12px;
    line-height: 16px;
    gap: 5px;
  }

  ha-card[data-cover-size='compact'] .status-dot {
    width: 8px;
    height: 8px;
  }

  ha-card[data-cover-size='compact'] .position-block {
    grid-column: 2;
    grid-row: 3;
    margin-top: 2px;
  }

  /* Visualmente oculta, pero leída por los lectores de pantalla. */
  ha-card[data-cover-size='compact'] .position-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  ha-card[data-cover-size='compact'] .position-value {
    font-size: 22px;
    line-height: 24px;
    font-weight: 700;
  }

  ha-card[data-cover-size='compact'] .position-value .unit {
    font-size: 12px;
  }

  /* Los tres puntos flotan en la esquina: no ocupan sitio en la rejilla. */
  /* Por encima del halo (el aro se dibuja en el borde de la tarjeta) y separados de él. */
  ha-card[data-cover-size='compact'] .menu {
    position: absolute;
    z-index: 1;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    margin: 0;
  }

  /* Pie justo: botones sin relleno vertical y la línea superior pegada. */
  ha-card[data-cover-size='compact'] .controls {
    margin-top: 2px;
    padding-top: 3px;
  }

  ha-card[data-cover-size='compact'] .control {
    padding-top: 0;
    padding-bottom: 0;
  }

  /* 4 o 5 columnas. */
  @container (max-width: 179px) {
    ha-card[data-cover-size='compact'] {
      padding-left: 10px;
      padding-right: 10px;
    }

    .compact-main {
      column-gap: 8px;
    }

    ha-card[data-cover-size='compact'] .hero-icon {
      width: 34px;
    }

    ha-card[data-cover-size='compact'] .name {
      padding-right: 16px;
      font-size: 13px;
      line-height: 18px;
    }

    ha-card[data-cover-size='compact'] .status {
      font-size: 11px;
    }

    ha-card[data-cover-size='compact'] .position-value {
      font-size: 20px;
      line-height: 22px;
    }

    ha-card[data-cover-size='compact'] .menu {
      top: 5px;
      right: 4px;
    }
  }

  /* 3 columnas: vertical, con el icono y el porcentaje arriba y el nombre y el estado debajo. */
  @container (max-width: 125px) {
    ha-card[data-cover-size='compact'] {
      padding-top: 10px;
    }

    .compact-main {
      grid-template-columns: auto minmax(0, 1fr);
      column-gap: 4px;
    }

    ha-card[data-cover-size='compact'] .hero-icon {
      grid-row: 1;
      width: 30px;
    }

    ha-card[data-cover-size='compact'] .position-block {
      grid-column: 2;
      grid-row: 1;
      align-self: end;
      justify-self: end;
      margin-top: 0;
    }

    ha-card[data-cover-size='compact'] .name {
      grid-column: 1 / -1;
      grid-row: 2;
      margin-top: 4px;
      padding-right: 0;
      font-size: 12px;
      line-height: 16px;
    }

    ha-card[data-cover-size='compact'] .status {
      grid-column: 1 / -1;
      grid-row: 3;
    }

    ha-card[data-cover-size='compact'] .position-value {
      line-height: 20px;
    }

    ha-card[data-cover-size='compact'] .menu {
      top: 5px;
      right: 4px;
      width: 18px;
      height: 18px;
    }
  }
`;
