import { css } from 'lit';

/**
 * Estilos propios de Sensor Card (acuerdo nº7: separados del componente).
 * El tamaño (compacta / normal / grande) sale del ancho real de la
 * tarjeta con `@container`, sin JavaScript: no hace falta indicar un
 * `size` en la config.
 */
export const NEON_SENSOR_CARD_STYLES = css`
  :host {
    display: block;
    height: 100%;
  }
  ha-card {
    container-type: inline-size;
    box-sizing: border-box;
    height: 100%;
    padding: 14px 18px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    border: 1.5px solid var(--neon-c1);
    box-shadow:
      0 0 6px color-mix(in srgb, var(--neon-c1) 55%, transparent),
      0 0 18px color-mix(in srgb, var(--neon-c1) 22%, transparent),
      inset 0 0 14px color-mix(in srgb, var(--neon-c1) 10%, transparent);
    transition: border-color 300ms ease-out, box-shadow 300ms ease-out;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon-ring {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1.5px solid var(--neon-c1);
    display: grid;
    place-items: center;
    box-shadow: 0 0 8px color-mix(in srgb, var(--neon-c1) 40%, transparent);
  }
  .icon-ring ha-icon {
    --mdc-icon-size: 24px;
  }
  .texts {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .kind {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }
  .menu {
    flex: none;
    border: 0;
    padding: 4px;
    background: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
  }

  .body {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .reading {
    flex: none;
    display: flex;
    align-items: baseline;
    gap: 6px;
    white-space: nowrap;
  }
  .value {
    font-size: 2.2em;
    font-weight: 600;
    line-height: 1.1;
    color: var(--primary-text-color);
  }
  .unit {
    font-size: 1.1em;
    color: var(--secondary-text-color);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95em;
    color: var(--neon-c1);
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--neon-c1);
    box-shadow: 0 0 6px var(--neon-c1);
  }

  /* ---- Gráfico: trazo de monitor de constantes vitales ---- */
  .graph {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 46px;
  }
  .graph svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .trace {
    fill: none;
    stroke-width: 3px;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  /* Huella tenue de toda la serie: el trazo "apagado" que el barrido
     vuelve a encender. */
  .trace-base {
    opacity: 0.2;
  }
  /* Capa viva: se extiende más allá del gráfico para que el halo no se
     recorte con la máscara. La máscara deja ver solo una ventana que
     barre de izquierda a derecha: cabeza nítida, estela que se apaga
     detrás y nada por delante, como un monitor. El filtro va ANTES de
     la máscara, así que el halo viaja con el barrido. */
  .sweep {
    position: absolute;
    inset: -10px -6px;
    filter: drop-shadow(0 0 3px var(--neon-c1))
      drop-shadow(0 0 9px color-mix(in srgb, var(--neon-c1) 70%, transparent));
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent 30%,
      rgba(0, 0, 0, 0.25) 42%,
      #000 49%,
      transparent 50%
    );
    mask-image: linear-gradient(90deg, transparent 30%, rgba(0, 0, 0, 0.25) 42%, #000 49%, transparent 50%);
    -webkit-mask-size: 300% 100%;
    mask-size: 300% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    animation: monitor-sweep 5s linear infinite;
  }
  .sweep svg {
    inset: 10px 6px;
    width: calc(100% - 12px);
    height: calc(100% - 20px);
  }
  @keyframes monitor-sweep {
    from {
      -webkit-mask-position: 75% 0;
      mask-position: 75% 0;
    }
    to {
      -webkit-mask-position: -5% 0;
      mask-position: -5% 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sweep {
      animation: none;
      -webkit-mask-image: none;
      mask-image: none;
    }
  }

  /* ---- Tamaños ---- */
  @container (max-width: 229px) {
    .graph {
      display: none;
    }
    .value {
      font-size: 1.9em;
    }
  }
  @container (min-width: 380px) {
    .icon-ring {
      width: 52px;
      height: 52px;
    }
    .icon-ring ha-icon {
      --mdc-icon-size: 28px;
    }
    .value {
      font-size: 3em;
    }
    .graph {
      height: 64px;
    }
    .trace {
      stroke-width: 3.5px;
    }
  }
`;
