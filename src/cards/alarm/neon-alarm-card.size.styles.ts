import { css } from 'lit';

/**
 * Estilos por tamaño de la Alarm Card (mediana y compacta). Van DESPUÉS de
 * `NEON_ALARM_CARD_STYLES` en `static styles`: comparten especificidad con
 * las reglas base y el orden importa.
 */
export const NEON_ALARM_SIZE_STYLES = css`
  .size-medium {
    container-type: inline-size;
  }
  .size-medium .header {
    position: relative;
  }
  /* Los tres puntos van en posición absoluta: el estado, una línea más abajo,
     usa todo el ancho. El nombre deja libre esa esquina. */
  .size-medium .name {
    padding-right: 28px;
  }
  .size-medium .menu {
    position: absolute;
    top: -6px;
    right: -8px;
  }
  .size-medium .status,
  .size-compact .status {
    min-width: 0;
  }
  .size-medium .status-text,
  .size-compact .status-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .size-medium .status-dot,
  .size-compact .status-dot {
    flex: none;
  }
  .size-medium .item {
    gap: 8px;
  }
  .size-medium .item ha-icon {
    --mdc-icon-size: 20px;
  }
  /* Mediana muy estrecha: el nombre del tipo cede sitio al recuento, y de este
     solo el número si ni así cabe. */
  @container (max-width: 150px) {
    .size-medium .item-label {
      display: none;
    }
    .size-medium .item-text {
      justify-content: flex-start;
    }
  }
  @container (max-width: 120px) {
    .size-medium .item-value .word {
      display: none;
    }
    .size-medium .item-value.is-idle .count {
      display: inline;
    }
  }
  /* Compacta: solo icono, nombre y estado. El menú de tres puntos tampoco va. */
  .size-compact {
    padding: 12px 14px;
  }
  .size-compact .name {
    font-size: 16px;
    line-height: 20px;
  }
`;
