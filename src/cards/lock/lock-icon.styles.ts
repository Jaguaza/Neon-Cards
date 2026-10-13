import { css } from 'lit';

/**
 * Estilos del candado animado (ver `lock-icon.ts`).
 *
 * Abrir: primero sube el arco (220 ms) y después gira (320 ms).
 * Cerrar: el mismo recorrido a la inversa — primero gira de vuelta
 * (320 ms) y después baja (220 ms). Para eso las transiciones llevan el
 * retardo cruzado: el valor de `transition` que cuenta es el del estado
 * DESTINO, así que el estado cerrado (reglas base) retrasa la bajada y
 * el estado `.is-open` retrasa el giro.
 *
 * `transform-origin` va en unidades del viewBox (24x24): el pivote
 * (8, 12) es la pata izquierda a la altura del borde superior del cuerpo.
 */
export const NEON_LOCK_ICON_STYLES = css`
  .lock-icon {
    width: 40px;
    height: 40px;
    flex: none;
    margin-bottom: 2px;
    overflow: visible;
    color: var(--state-icon-color, var(--primary-text-color));
  }
  .lock-icon .body {
    fill: currentColor;
  }
  .lock-icon .shackle {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
  }
  .shackle-lift {
    transform: translateY(0);
    transition: transform 220ms ease-in 320ms;
  }
  .shackle-turn {
    transform-box: view-box;
    transform-origin: 8px 12px;
    transform: rotate(0deg);
    transition: transform 320ms ease-in-out 0ms;
  }
  .lock-icon.is-open .shackle-lift {
    transform: translateY(-2.5px);
    transition: transform 220ms ease-out 0ms;
  }
  .lock-icon.is-open .shackle-turn {
    transform: rotate(-30deg);
    transition: transform 320ms ease-in-out 220ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .shackle-lift,
    .shackle-turn,
    .lock-icon.is-open .shackle-lift,
    .lock-icon.is-open .shackle-turn {
      transition: none;
    }
  }
`;
