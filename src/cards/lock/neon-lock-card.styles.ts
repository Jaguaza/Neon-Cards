import { css } from 'lit';

/**
 * Estilos propios de Lock Card. Misma base visual que Button (ha-card
 * compacto, icono de 40px, nombre + subtítulo) para que las dos
 * tarjetas convivan en la misma rejilla — `neon-lock-card.ts` los
 * combina con `NEON_HALO_STYLES`/`NEON_RING_SPLIT_STYLES` (de `shared/`).
 */
export const NEON_LOCK_CARD_STYLES = css`
  :host {
    display: block;
    /* ha-card usa height:100%, que solo funciona si :host tiene una
       altura explícita (ver el mismo comentario en Button Card). */
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
  }
  /* Cabecera: icono, nombre con subtítulo a su lado y, a la derecha, el
     estado y los tres puntos. */
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
  /* Solo el icono de error (mdi:close); el candado es lock-icon.styles.ts. */
  ha-icon {
    --mdc-icon-size: 40px;
    color: var(--state-icon-color, var(--primary-text-color));
    margin-bottom: 2px;
    transition: color 300ms ease-out, filter 300ms ease-out;
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
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    box-shadow: 0 0 6px var(--dot-color);
  }
  /* Verde: cerrada. Ámbar: desbloqueada o abierta. Rojo: avería. */
  .status {
    --dot-color: #39e07a;
  }
  .status[data-state='unlocked'],
  .status[data-state='unlocking'],
  .status[data-state='open'],
  .status[data-state='opening'] {
    --dot-color: #ffb02e;
  }
  .status[data-state='jammed'],
  .status[data-state='error'] {
    --dot-color: #ff5c5c;
  }
  .lock-moving .status-dot {
    animation: lock-pulse 1.1s ease-in-out infinite;
  }
  /* Sin los tres puntos (entidad no disponible) se reserva su hueco: el
     estado queda donde está en una tarjeta operativa y no se pega a la
     esquina redondeada del borde. */
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
  /* Pie: línea de neón y hasta tres datos (puerta, batería, último acceso). */
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
  /* Cada dato reparte a partes iguales el ancho sobrante y centra su
     contenido: el pie se ve repartido por toda la tarjeta y no
     apelotonado a la izquierda. */
  .item {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    padding: 0 12px;
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
  /* Dato activo (puerta abierta): el color del punto de estado de
     «desbloqueada/abierta». --item-color lo pone la tarjeta con el elegido en
     la config; sin él vale este, igual que el punto por defecto. Cerrada
     (normal) y sin dato (muted) no lo llevan. */
  .item--warn ha-icon,
  .item--warn .item-value {
    color: var(--item-color, #ffb02e);
  }
  .item--alert ha-icon,
  .item--alert .item-value {
    color: #ff5c5c;
  }
  .item--muted ha-icon,
  .item--muted .item-value {
    color: var(--secondary-text-color);
  }
  /* Cerradura en movimiento (cerrando / abriendo): el icono pulsa
     mientras dura la transición, para que se vea que la orden se está
     ejecutando y no que la tarjeta no ha respondido. */
  .lock-moving .neon-halo-icon {
    animation: lock-pulse 1.1s ease-in-out infinite;
  }
  @keyframes lock-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }
  /* Vista «¿Abrir?»: ocupa el sitio del contenido, con el halo del aro
     encendido y botones de contorno neón (--neon-c1/c2 de la paleta).
     Se separa 3px del borde para no tapar el aro (trazo de 2,4px).
     No lleva fondo ni backdrop-filter para taparlo todo: con temas de
     cristal (tarjetas translúcidas) un fondo semitransparente deja ver el
     texto de debajo y en WebKit (iOS) el difuminado no se aplica y da
     problemas con las transiciones del aro. En su lugar se oculta el
     contenido original (.content--hidden) mientras la vista está abierta;
     el contenido sigue ocupando su sitio, así que la tarjeta no cambia de
     tamaño. */
  .confirm {
    position: absolute;
    inset: 3px;
    z-index: 2;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    row-gap: 6px;
    gap: 6px 12px;
    padding: 0 17px;
    border-radius: calc(var(--ha-card-border-radius, 12px) - 3px);
    cursor: default;
    animation: confirm-in 180ms ease-out;
  }
  .content {
    transition: opacity 150ms ease-out;
  }
  .content--hidden {
    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms ease-out, visibility 0s linear 150ms;
  }
  .confirm-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1 1 110px;
  }
  .confirm-title {
    font-size: 18px;
    line-height: 22px;
    font-weight: 600;
    color: var(--primary-text-color);
    text-shadow: 0 0 8px color-mix(in srgb, var(--neon-c1) 70%, transparent);
  }
  .confirm-name {
    font-size: 11px;
    line-height: 14px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .confirm-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    flex: 0 1 auto;
  }
  .confirm-btn {
    box-sizing: border-box;
    min-width: 64px;
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1.5px solid var(--neon-c1);
    background: transparent;
    color: var(--neon-c1);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 0 8px color-mix(in srgb, var(--neon-c1) 45%, transparent), inset 0 0 6px color-mix(in srgb, var(--neon-c1) 25%, transparent);
    transition: background 150ms ease-out, box-shadow 150ms ease-out, transform 100ms ease;
  }
  .confirm-btn:hover,
  .confirm-btn:focus-visible {
    background: color-mix(in srgb, var(--neon-c1) 22%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--neon-c1) 70%, transparent), inset 0 0 8px color-mix(in srgb, var(--neon-c1) 35%, transparent);
    outline: none;
  }
  .confirm-btn:active {
    transform: scale(0.95);
  }
  /* «Cancelar» discreto (color secundario de la paleta, sin relleno);
     «Abrir» es la acción destacada, con el relleno de neón. */
  /* Con varias órdenes (Desbloquear / Abrir…) los botones son más
     compactos y «Cancelar» pasa a ser una ✕ para que quepan en una fila. */
  .confirm--multi .confirm-btn {
    min-width: 0;
    height: 30px;
    padding: 0 11px;
    font-size: 12px;
  }
  .confirm--multi .confirm-btn.cancel {
    width: 30px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .confirm--multi .confirm-btn.cancel ha-icon {
    --mdc-icon-size: 16px;
    margin: 0;
    color: inherit;
  }
  .confirm-btn.cancel {
    border-color: color-mix(in srgb, var(--neon-c2) 55%, transparent);
    color: var(--secondary-text-color);
    box-shadow: none;
  }
  .confirm-btn.accept {
    background: color-mix(in srgb, var(--neon-c1) 18%, transparent);
  }
  @keyframes confirm-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .lock-moving .neon-halo-icon {
      animation: none;
    }
    .confirm {
      animation: none;
    }
  }
`;
