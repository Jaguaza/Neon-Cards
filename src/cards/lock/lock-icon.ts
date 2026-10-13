import { html } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * Candado propio en SVG (en lugar de un icono `mdi`) para animar la
 * apertura como la de un candado real:
 *
 *  1. El arco SUBE y su pata corta (la derecha) sale del cuerpo.
 *  2. Después GIRA sobre el eje vertical de la pata larga (la izquierda,
 *     que sigue metida en el cuerpo): visto de frente el arco se estrecha
 *     hasta quedar de canto y se abre hacia el otro lado.
 *
 * Al cerrar hace el recorrido inverso. `.shackle-lift` es la subida y
 * `.shackle-turn` el giro (un `scaleX` alrededor de la pata larga, que es
 * la proyección de un giro en 3D); las transiciones están en
 * `lock-icon.styles.ts`. Este template solo alterna la clase `is-open` y,
 * como Lit reutiliza el mismo nodo SVG entre renders, el navegador anima
 * el cambio.
 *
 * Geometría (viewBox 24x24, cuerpo de y=12 a y=22): la pata larga baja
 * hasta y=17,5 y la corta hasta y=13,6, ambas por dentro del cuerpo (que
 * se dibuja encima). Al subir 3,4 unidades la pata corta queda libre del
 * cuerpo mientras la larga sigue dentro.
 */
export function lockIconTemplate(open: boolean): TemplateResult {
  return html`
    <svg class="lock-icon neon-halo-icon ${open ? 'is-open' : ''}" viewBox="0 0 24 24" aria-hidden="true">
      <g class="shackle-lift">
        <g class="shackle-turn">
          <path class="shackle" d="M8.5 17.5V10a3.5 3.5 0 0 1 7 0V13.6"></path>
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
