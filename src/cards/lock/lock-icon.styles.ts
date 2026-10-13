import { css } from 'lit';

/**
 * Estilos del candado animado (ver `lock-icon.ts`).
 *
 * Abrir: primero sube el arco (240 ms) y después gira sobre la pata larga
 * (420 ms). Cerrar: el mismo recorrido a la inversa — primero gira de
 * vuelta (420 ms) y después baja (240 ms). Para eso las transiciones
 * llevan el retardo cruzado: el valor de `transition` que cuenta es el
 * del estado DESTINO, así que el estado cerrado (reglas base) retrasa la
 * bajada y el estado `.is-open` retrasa el giro.
 *
 * El giro es un `scaleX(1)` -> `scaleX(-1)` alrededor de x=8,5 (el eje de
 * la pata larga). Con la curva `cubic-bezier(0.37, 0, 0.63, 1)` (ease in
 * out sine) el factor de escala sigue cos(θ) con θ lineal en el tiempo,
 * es decir, el arco se estrecha y se ensancha como en un giro real en 3D.
 *
 * `vector-effect: non-scaling-stroke` mantiene el grosor del alambre
 * mientras el arco se estrecha (un alambre se ve igual de grueso de canto
 * que de frente); por eso el grosor se da en px y sale de
 * `--lock-icon-size`: 2,2 unidades del viewBox de 24.
 *
 * `transform-origin` y el desplazamiento van en unidades del viewBox
 * (24x24); `transform-box: view-box` lo hace explícito en todos los
 * navegadores.
 */
export const NEON_LOCK_ICON_STYLES = css`
  .lock-icon {
    --lock-icon-size: 40px;
    width: var(--lock-icon-size);
    height: var(--lock-icon-size);
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
    stroke-width: calc(var(--lock-icon-size) * 2.2 / 24);
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .shackle-lift {
    transform: translateY(0);
    transition: transform 240ms ease-in 420ms;
  }
  .shackle-turn {
    transform-box: view-box;
    transform-origin: 8.5px 12px;
    transform: scaleX(1);
    transition: transform 420ms cubic-bezier(0.37, 0, 0.63, 1) 0ms;
  }
  .lock-icon.is-open .shackle-lift {
    transform: translateY(-3.4px);
    transition: transform 240ms ease-out 0ms;
  }
  .lock-icon.is-open .shackle-turn {
    transform: scaleX(-1);
    transition: transform 420ms cubic-bezier(0.37, 0, 0.63, 1) 240ms;
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
