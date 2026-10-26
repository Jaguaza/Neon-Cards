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
  .size-medium .footer {
    flex-wrap: nowrap;
    row-gap: 0;
  }
  .size-medium .item {
    gap: 6px;
    padding: 0 8px;
  }
  .size-medium .item ha-icon {
    --mdc-icon-size: 20px;
  }
  @container (max-width: 200px) {
    .size-medium .item {
      gap: 4px;
      padding: 0 4px;
    }
    .size-medium .item ha-icon {
      --mdc-icon-size: 18px;
    }
    .size-medium .item-label {
      display: none;
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
