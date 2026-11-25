import { css } from 'lit';

/**
 * Estilos de la tarjeta mediana: el nombre arriba y, debajo, el estado y el
 * porcentaje a la izquierda y el icono grande a la derecha, subido hasta la
 * altura del estado. Los deslizadores son los mismos que en la grande; solo se
 * ajustan los huecos y el pie para que la mediana sea más baja.
 *
 * La cabecera (`.header` y `.header-text`) pasa a `display: contents` para que
 * el nombre, el estado y los tres puntos sean celdas de la misma rejilla que el
 * porcentaje y el icono.
 */
export const NEON_COVER_MEDIUM_STYLES = css`
  .medium-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 16px;
    align-items: start;
    min-width: 0;
  }

  ha-card[data-cover-size='medium'] .header,
  ha-card[data-cover-size='medium'] .header-text {
    display: contents;
  }

  /* El nombre ocupa las dos columnas (el icono va por debajo) y solo deja
     sitio a la derecha para los tres puntos. */
  ha-card[data-cover-size='medium'] .name {
    grid-column: 1 / -1;
    grid-row: 1;
    padding-right: 28px;
  }

  ha-card[data-cover-size='medium'] .menu {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  ha-card[data-cover-size='medium'] .status {
    grid-column: 1;
    grid-row: 2;
  }

  ha-card[data-cover-size='medium'] .position-block {
    grid-column: 1;
    grid-row: 3;
    margin-top: 6px;
  }

  ha-card[data-cover-size='medium'] .hero-icon {
    grid-column: 2;
    grid-row: 2 / span 2;
  }

  ha-card[data-cover-size='medium'] {
    gap: 8px;
  }

  ha-card[data-cover-size='medium'] .position-value {
    font-size: 40px;
  }

  /* Pie más bajo: botones y línea superior con menos relleno vertical. */
  ha-card[data-cover-size='medium'] .controls {
    padding-top: 2px;
  }

  ha-card[data-cover-size='medium'] .control {
    padding-top: 2px;
    padding-bottom: 2px;
  }
`;
