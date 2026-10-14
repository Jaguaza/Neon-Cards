import { html } from 'lit';
import type { LockIconDef } from './types';
import { POSE_TOTAL_MS, shacklePath } from './padlock-geometry';

/**
 * Icono «candado»: el arco SUBE sacando la pata corta del cuerpo y después
 * GIRA sobre el eje de la pata larga, que sigue unida; al cerrar hace el
 * recorrido inverso. La geometría está en `padlock-geometry.ts`.
 *
 * El template dibuja el cuerpo fijo y el arco SIN el atributo `d`: `paint`
 * lo escribe para cada instante (ver `types.ts` sobre por qué no hay
 * transiciones CSS). Las patas bajan por dentro del cuerpo (que se dibuja
 * encima), así al subir el arco no queda cortado en el borde.
 */
export const PADLOCK_ICON: LockIconDef = {
  durationMs: POSE_TOTAL_MS,
  template: (open) => html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="shackle"></path>
      <path
        class="body"
        fill-rule="evenodd"
        d="M7.2 12h9.6A2.2 2.2 0 0 1 19 14.2v5.6a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 19.8v-5.6A2.2 2.2 0 0 1 7.2 12ZM12 14.6a1.7 1.7 0 0 1 .85 3.17L13.3 20H10.7l.45-2.23A1.7 1.7 0 0 1 12 14.6Z"
      ></path>
    </svg>
  `,
  paint: (svg, s) => svg.querySelector('.shackle')?.setAttribute('d', shacklePath(s)),
};
