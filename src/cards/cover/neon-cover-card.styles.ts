import { css } from 'lit';

/**
 * Estilos de la carcasa y la cabecera de la Neón Cover Card. Las reglas
 * realmente reutilizables (halo, aro) viven en `src/shared`; el cuerpo y los
 * botones, en `cover-body.styles.ts` y `cover-controls.styles.ts`.
 */
export const NEON_COVER_CARD_STYLES = css`
  :host {
    display: block;
  }

  ha-card {
    box-sizing: border-box;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
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

  .header {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  /* Icono dentro de una caja redondeada que brilla con el color de la
     tarjeta mientras la persiana no está cerrada. */
  .icon-box {
    display: inline-flex;
    flex: 0 0 auto;
    padding: 10px;
    border-radius: 16px;
    border: 1.5px solid color-mix(in srgb, var(--primary-text-color) 22%, transparent);
    transition: border-color 300ms ease-out, box-shadow 300ms ease-out;
  }

  .icon-box.neon-halo-active {
    border-color: var(--neon-c1);
    box-shadow: 0 0 10px color-mix(in srgb, var(--neon-c1) 55%, transparent);
  }

  .header-icon {
    --mdc-icon-size: 40px;
    color: var(--state-icon-color, var(--secondary-text-color));
  }

  /* El centro del icono queda blanco y solo brilla el contorno, como el
     resto de la colección (ver la Thermostat). */
  .icon-box.neon-halo-active .header-icon.neon-halo-icon {
    color: var(--primary-text-color);
    filter: drop-shadow(0 0 2px var(--neon-c1)) drop-shadow(0 0 6px var(--neon-c1));
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
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
    align-self: flex-start;
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
