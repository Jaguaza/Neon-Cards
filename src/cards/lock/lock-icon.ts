import { html } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * Candado propio en SVG (en lugar de un icono `mdi`) para animar la
 * apertura como la de un candado real: el arco SUBE sacando la pata corta
 * del cuerpo y después GIRA sobre el eje de la pata larga, que sigue unida.
 * Al cerrar hace el recorrido inverso.
 *
 * Este template solo dibuja el cuerpo fijo y el arco SIN el atributo `d`:
 * la forma del arco la calcula `lock-geometry.ts` para cada instante y la
 * escribe `NeonLockCard` (con `LockPoseAnimator`). El atributo `d` se pone
 * a mano, no con un binding de Lit, para repintar el arco sin re-renderizar
 * toda la tarjeta en cada fotograma. La clase `is-open` es solo el marcador
 * de la pose de destino.
 *
 * Geometría (viewBox 24x24, cuerpo de y=12 a y=22): las patas bajan por
 * dentro del cuerpo (que se dibuja encima), así al subir el arco no queda
 * cortado en el borde.
 */
export function lockIconTemplate(open: boolean): TemplateResult {
  return html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="shackle"></path>
      <path
        class="body"
        fill-rule="evenodd"
        d="M7.2 12h9.6A2.2 2.2 0 0 1 19 14.2v5.6a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 19.8v-5.6A2.2 2.2 0 0 1 7.2 12ZM12 14.6a1.7 1.7 0 0 1 .85 3.17L13.3 20H10.7l.45-2.23A1.7 1.7 0 0 1 12 14.6Z"
      ></path>
    </svg>
  `;
}
