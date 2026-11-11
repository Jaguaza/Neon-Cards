import { css } from 'lit';

/**
 * Estilos de la tarjeta compacta («Compacta - Mediana»): una fila con el icono
 * a la izquierda y el nombre y el subtítulo a su lado, sin pie. Van DESPUÉS de
 * los de la grande para sobrescribirlos. El icono conserva el relleno de abajo
 * arriba, el color de la luz y el borde, y la tarjeta el halo.
 */
export const NEON_LIGHT_SIZE_STYLES = css`
  .size-compact {
    padding: 10px 16px;
  }
  .size-compact .content {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  .size-compact .light-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 0;
  }
  .size-compact .light-icon ha-icon {
    --mdc-icon-size: 36px;
  }
  .size-compact .text {
    flex: 1 1 0;
    width: auto;
  }
  .size-compact .name {
    font-size: 15px;
    line-height: 20px;
  }
  /* Tarjeta muy estrecha: en una fila el texto casi no tendría sitio, así que
     el nombre y el subtítulo pasan debajo del icono. */
  @container (max-width: 110px) {
    .size-compact .content {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .size-compact .text {
      flex: none;
      width: 100%;
    }
  }
`;
