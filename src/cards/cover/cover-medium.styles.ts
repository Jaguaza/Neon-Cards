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

  /* El porcentaje baja hasta la base del icono (que ocupa las filas 2 y 3). */
  ha-card[data-cover-size='medium'] .position-block {
    grid-column: 1;
    grid-row: 3;
    align-self: end;
  }

  ha-card[data-cover-size='medium'] .hero-icon {
    grid-column: 2;
    grid-row: 2 / span 2;
  }

  /* Huecos mínimos entre icono, deslizadores, escala y pie, y poco relleno
     arriba y, sobre todo, debajo de los botones del pie. */
  ha-card[data-cover-size='medium'] {
    gap: 2px;
    padding-top: 10px;
    padding-bottom: 5px;
  }

  /* Los tres puntos no pasan de la altura del nombre (24px). */
  ha-card[data-cover-size='medium'] .menu {
    margin-top: -8px;
  }

  /* Banda del deslizador más baja (el punto de 16px sobresale sin problema; la zona de toque no cambia). */
  ha-card[data-cover-size='medium'] .slider {
    --slider-h: 14px;
  }

  ha-card[data-cover-size='medium'] .scale {
    margin-top: 0;
    line-height: 13px;
  }

  ha-card[data-cover-size='medium'] .tilt-row {
    margin-bottom: 0;
  }

  ha-card[data-cover-size='medium'] .position-value {
    font-size: 40px;
  }

  /* Pie justo: los botones miden lo que el icono y el texto, sin relleno
     vertical, y la línea superior queda pegada. */
  ha-card[data-cover-size='medium'] .controls {
    margin-top: 2px;
    padding-top: 3px;
  }

  ha-card[data-cover-size='medium'] .control {
    padding-top: 0;
    padding-bottom: 0;
  }

  /* Proyector y TV en una mediana estrecha (6 columnas): el icono baja del
     lado del estado al hueco de debajo del texto, centrado, para no pisarlo. */
  @container (max-width: 260px) {
    ha-card[data-cover-size='medium'][data-cover-type='projector'] .hero-icon,
    ha-card[data-cover-size='medium'][data-cover-type='tv'] .hero-icon {
      grid-column: 1 / -1;
      grid-row: 3;
      justify-self: center;
      margin-top: 4px;
    }
  }
`;
