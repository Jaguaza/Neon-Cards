import { html } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * Candado propio en SVG (en lugar de un icono `mdi`) para poder animar
 * la apertura real: el cuerpo queda fijo y el arco se mueve en dos
 * tiempos — `.shackle-lift` lo sube y `.shackle-turn` lo gira alrededor
 * de su pata izquierda hasta quedar abierto. Al cerrar hace el recorrido
 * inverso. Las transiciones están en `lock-icon.styles.ts`; este
 * template solo alterna la clase `is-open` y, como Lit reutiliza el
 * mismo nodo SVG entre renders, el navegador anima el cambio.
 *
 * El arco baja 3,5 unidades por dentro del cuerpo (que se dibuja
 * encima) para que, al subir, las patas no queden cortadas en el borde.
 */
export function lockIconTemplate(open: boolean): TemplateResult {
  return html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <g class="shackle-lift">
        <g class="shackle-turn">
          <path class="shackle" d="M8 15.5V10a4 4 0 0 1 8 0v5.5"></path>
        </g>
      </g>
      <path
        class="body"
        fill-rule="evenodd"
        d="M7.2 12h9.6A2.2 2.2 0 0 1 19 14.2v5.6a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 19.8v-5.6A2.2 2.2 0 0 1 7.2 12ZM12 14.6a1.7 1.7 0 0 1 .85 3.17L13.3 20H10.7l.45-2.23A1.7 1.7 0 0 1 12 14.6Z"
      ></path>
    </svg>
  `;
}
