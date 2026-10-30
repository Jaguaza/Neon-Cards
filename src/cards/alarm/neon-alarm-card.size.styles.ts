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
  /* Compacta: solo escudo, nombre y estado, en columna (el escudo arriba y
     debajo el nombre y el estado a todo el ancho), como la compacta de la Lock
     Card. Con tan poco ancho el texto no se corta con puntos suspensivos: se
     parte en varias líneas (el nombre, hasta dos). Sin pie ni tres puntos. */
  .size-compact {
    container-type: inline-size;
    padding: 12px;
  }
  .size-compact .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .size-compact .header > .text {
    align-self: stretch;
  }
  .size-compact .name {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 15px;
    line-height: 18px;
    white-space: normal;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  .size-compact .status {
    align-items: flex-start;
    white-space: normal;
  }
  .size-compact .status-dot {
    margin-top: 4px;
  }
  .size-compact .status-text {
    overflow: visible;
    text-overflow: clip;
    overflow-wrap: anywhere;
  }
  /* Compacta muy estrecha (un hueco de 3 columnas en una pantalla pequeña):
     letra un punto menor para que las palabras largas («Desarmada») no se
     partan a mitad. */
  @container (max-width: 112px) {
    .size-compact .name {
      font-size: 14px;
      line-height: 17px;
    }
    .size-compact .status {
      gap: 4px;
      font-size: 11px;
    }
  }
`;
