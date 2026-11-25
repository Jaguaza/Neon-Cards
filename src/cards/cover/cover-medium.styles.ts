import { css } from 'lit';

/**
 * Estilos de la tarjeta mediana: cabecera, y debajo el porcentaje a la
 * izquierda y el icono grande a la derecha, en el sitio donde la grande lleva
 * el dial. Los deslizadores y el pie son los mismos que en la grande; solo se
 * ajustan los huecos para que la mediana sea más baja.
 */
export const NEON_COVER_MEDIUM_STYLES = css`
  .medium-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-width: 0;
  }

  /* Binario: sin porcentaje, el icono ocupa el centro. */
  .medium-main--binary {
    justify-content: center;
  }

  ha-card[data-cover-size='medium'] {
    gap: 8px;
  }

  ha-card[data-cover-size='medium'] .position-value {
    font-size: 40px;
  }
`;
