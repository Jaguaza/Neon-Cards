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
  /* Pie de la mediana: una sola línea de fichas, cada una con el icono del
     tipo de sensor y cuántos hay activos. Reparten el ancho a partes iguales. */
  .footer--chips {
    flex-direction: row;
    justify-content: space-around;
    gap: 4px;
    padding-top: 6px;
  }
  .chip {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    padding: 8px 2px;
    border: 0;
    background: transparent;
    font: inherit;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .chip:focus-visible {
    outline: 1.5px solid var(--neon-c1);
    outline-offset: 2px;
    border-radius: 8px;
  }
  .chip ha-icon {
    --mdc-icon-size: 20px;
    flex: none;
    margin: 0;
    color: inherit;
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c1) 55%, transparent));
  }
  .chip-count {
    font-size: 14px;
    line-height: 16px;
    font-weight: 600;
  }
  .chip--warn {
    color: var(--alarm-sensor-active, #ffb02e);
  }
  .chip--muted {
    color: var(--secondary-text-color);
  }
  /* Mediana estrecha (4 columnas): fichas algo más pequeñas para que quepan las cuatro. */
  @container (max-width: 150px) {
    .chip {
      gap: 3px;
    }
    .chip ha-icon {
      --mdc-icon-size: 18px;
    }
    .chip-count {
      font-size: 13px;
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
