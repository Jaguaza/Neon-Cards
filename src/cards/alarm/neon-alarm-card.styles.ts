import { css } from 'lit';

/**
 * Estilos propios de la Alarm Card. Misma base visual que Button y Lock
 * (ha-card compacto, icono de 40px, nombre + subtítulo, estado con punto de
 * color y pie con línea de neón) para que convivan en la misma rejilla;
 * `neon-alarm-card.ts` los combina con `NEON_HALO_STYLES` y
 * `NEON_RING_SPLIT_STYLES` (de `shared/`).
 */
export const NEON_ALARM_CARD_STYLES = css`
  :host {
    display: block;
    height: 100%;
  }
  ha-card {
    box-sizing: border-box;
    padding: 14px 16px;
    height: auto;
    max-height: 100%;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
    transition: transform 150ms ease;
  }
  ha-card:active {
    transform: scale(0.98);
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: auto;
    transition: opacity 150ms ease-out;
  }
  .header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }
  .header > .text {
    flex: 1 1 auto;
    align-self: center;
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    font-size: 18px;
    line-height: 22px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subtitle {
    font-size: 11px;
    line-height: 14px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .top-right {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 0 0 auto;
    margin: -6px -8px 0 0;
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    line-height: 16px;
    color: var(--primary-text-color);
    white-space: nowrap;
    --dot-color: #39e07a;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    box-shadow: 0 0 6px var(--dot-color);
  }
  /* Un color por estado: desarmada verde, un tono por cada modo armado,
     un tono por cada transición, rojo para disparada y caída. */
  .status[data-state='armed_home'] {
    --dot-color: #ffb02e;
  }
  .status[data-state='armed_away'] {
    --dot-color: #ff7a3d;
  }
  .status[data-state='armed_night'] {
    --dot-color: #7c6cff;
  }
  .status[data-state='armed_vacation'] {
    --dot-color: #1ecdf2;
  }
  .status[data-state='armed_custom_bypass'] {
    --dot-color: #d36cff;
  }
  .status[data-state='pending'] {
    --dot-color: #ffd84a;
  }
  .status[data-state='arming'] {
    --dot-color: #ff9f43;
  }
  .status[data-state='disarming'] {
    --dot-color: #4fd1c5;
  }
  .status[data-state='triggered'],
  .status[data-state='unavailable'],
  .status[data-state='error'] {
    --dot-color: #ff5c5c;
  }
  .menu-spacer {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
  }
  .menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: background 150ms ease-out, color 150ms ease-out;
  }
  .menu:hover,
  .menu:focus-visible {
    background: color-mix(in srgb, var(--neon-c1) 18%, transparent);
    color: var(--primary-text-color);
    outline: none;
  }
  .menu ha-icon {
    --mdc-icon-size: 20px;
    margin: 0;
    color: inherit;
  }
  /* Pie: línea de neón y hasta tres tipos de sensor. */
  .footer {
    position: relative;
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    row-gap: 8px;
    padding-top: 12px;
  }
  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, color-mix(in srgb, var(--neon-c1) 85%, transparent), color-mix(in srgb, var(--neon-c2) 55%, transparent) 60%, transparent);
  }
  /* Cada dato es un botón sin aspecto de botón: reparte a partes iguales el
     ancho sobrante y centra su contenido. */
  .item {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    padding: 0 12px;
    border: 0;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .item:focus-visible {
    outline: 1.5px solid var(--neon-c1);
    outline-offset: 2px;
    border-radius: 8px;
  }
  .item + .item {
    border-left: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent);
  }
  .item ha-icon {
    --mdc-icon-size: 22px;
    flex: 0 0 auto;
    margin: 0;
    color: var(--primary-text-color);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c1) 55%, transparent));
  }
  .item-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .item-label {
    font-size: 10px;
    line-height: 12px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-value {
    font-size: 13px;
    line-height: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* En reposo se lee «En reposo», no «0 En reposo»: el número solo se enseña donde el texto no cabe. */
  .item-value.is-idle .count {
    display: none;
  }
  .item--warn ha-icon,
  .item--warn .item-value {
    color: #ffb02e;
  }
  .item--muted ha-icon,
  .item--muted .item-value {
    color: var(--secondary-text-color);
  }
  .content--hidden {
    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms ease-out, visibility 0s linear 150ms;
  }
`;
