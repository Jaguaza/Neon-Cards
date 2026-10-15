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
    padding: 4px 20px;
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
    align-items: flex-start;
    gap: 5px;
    height: auto;
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
    width: 100%;
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
  /* Vista «¿Abrir?»: fondo oscuro sobre la tarjeta, con el halo del aro
     encendido y botones de contorno neón (--neon-c1/c2 de la paleta).
     Se separa 3px del borde para no tapar el aro (trazo de 2,4px). Sin
     backdrop-filter: en WebKit (iOS) las capas compuestas nuevas dan
     problemas con las transiciones del aro. */
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
    background: color-mix(in srgb, var(--ha-card-background, var(--card-background-color, #1c1c1c)) 94%, transparent);
    cursor: default;
    animation: confirm-in 180ms ease-out;
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
