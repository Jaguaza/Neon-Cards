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
  @media (prefers-reduced-motion: reduce) {
    .lock-moving .neon-halo-icon {
      animation: none;
    }
  }
`;
