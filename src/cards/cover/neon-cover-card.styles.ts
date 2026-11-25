import { css } from 'lit';

/**
 * Estilos de la carcasa y la cabecera de la Neón Cover Card. Las reglas
 * realmente reutilizables (halo, aro) viven en `src/shared`; el cuerpo y los
 * botones, en `cover-body.styles.ts` y `cover-controls.styles.ts`.
 */
export const NEON_COVER_CARD_STYLES = css`
  :host {
    display: block;
    /* Contenedor de consultas: la tarjeta se adapta al ancho que le da la
       rejilla de Home Assistant, no al de la ventana. */
    container-type: inline-size;
  }

  ha-card {
    box-sizing: border-box;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    /* En el editor de Lovelace HA puede fijar a la tarjeta una altura menor
       que la de su contenido: sin recorte, el sobrante invadiría a la
       tarjeta vecina. */
    overflow: hidden;
    --cover-color: var(--primary-text-color);
  }

  ha-card.neon-halo-active {
    --cover-color: var(--neon-c1);
  }

  /* Los hijos no se comprimen por flex (mismo motivo que arriba). */
  ha-card > *:not(.neon-ring-svg) {
    flex-shrink: 0;
  }

  .unavailable {
    font-size: 14px;
    color: var(--secondary-text-color);
  }

  /* Zona principal: el icono grande a la izquierda y, a su derecha, el
     nombre con el estado y la posición con su dial. */
  .hero {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
  }

  .hero-icon {
    flex: 0 0 auto;
    width: 128px;
  }

  .hero-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  @container (max-width: 380px) {
    .hero {
      gap: 12px;
    }

    .hero-icon {
      width: 92px;
    }
  }

  @container (max-width: 309px) {
    .hero {
      gap: 8px;
    }
  }

  .name {
    font-size: 20px;
    line-height: 24px;
    font-weight: 600;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    line-height: 18px;
    color: var(--primary-text-color);
    white-space: nowrap;
  }

  .status-dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--dot-color);
    box-shadow: 0 0 6px var(--dot-color);
  }

  .status[data-group='moving'] .status-dot {
    animation: cover-pulse 1.1s ease-in-out infinite;
  }

  @keyframes cover-pulse {
    50% {
      opacity: 0.35;
    }
  }

  .menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    margin: -6px -8px 0 0;
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
    color: inherit;
  }
`;
