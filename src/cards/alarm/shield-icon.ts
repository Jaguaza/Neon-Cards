import { html, svg } from 'lit';
import type { TemplateResult } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import type { AlarmVisualState } from './types';

/** Silueta del escudo (viewBox 24×24). */
const SHIELD_PATH = 'M12 2.6 4.6 5.6v6c0 4.6 3.1 8.5 7.4 9.9 4.3-1.4 7.4-5.3 7.4-9.9v-6L12 2.6Z';

/**
 * Dibujo interior de cada estado. Cada modo armado tiene el suyo (casa,
 * check, luna, sol, ajustes) para reconocerlo de un vistazo sin leer el texto.
 */
const GLYPHS: Record<AlarmVisualState, TemplateResult> = {
  disarmed: svg`<path class="glyph line" d="M9.4 12h5.2"></path>`,
  armed_home: svg`<path class="glyph solid" d="M12 8 8.2 11.4V15h2.7v-2.5h2.2V15h2.7v-3.6L12 8Z"></path>`,
  armed_away: svg`<path class="glyph line" d="M8.8 12.2l2.2 2.2 4.2-4.6"></path>`,
  armed_night: svg`<path class="glyph solid" d="M13.4 8.3a3.8 3.8 0 1 0 2.5 5.7 3.3 3.3 0 0 1-2.5-5.7Z"></path>`,
  armed_vacation: svg`<circle class="glyph solid" cx="12" cy="12" r="2"></circle><path class="glyph line" d="M12 7.6v1.1M12 15.3v1.1M7.6 12h1.1M15.3 12h1.1M8.9 8.9l.8.8M14.3 14.3l.8.8M15.1 8.9l-.8.8M9.7 14.3l-.8.8"></path>`,
  armed_custom_bypass: svg`<path class="glyph line" d="M8.6 10h6.8M8.6 14h6.8"></path>`,
  pending: svg`<path class="glyph line" d="M12 8.3v4l2.5 1.5"></path>`,
  arming: svg`<path class="glyph line" d="M9 12.2l2.3 2.3 4-4.4"></path>`,
  disarming: svg`<path class="glyph line" d="M9.8 9.8l4.4 4.4M14.2 9.8l-4.4 4.4"></path>`,
  triggered: svg`<path class="glyph line" d="M12 7.8v4.6"></path><circle class="glyph solid" cx="12" cy="15.4" r="1"></circle>`,
  unavailable: svg`<path class="glyph line" d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"></path>`,
  error: svg`<path class="glyph line" d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"></path>`,
};

/** El escudo está relleno (suave) cuando la alarma vigila o ha saltado; vacío si está desarmada o sin datos. */
function isFilled(state: AlarmVisualState): boolean {
  return state !== 'disarmed' && state !== 'unavailable' && state !== 'error';
}

/**
 * Escudo animado de la tarjeta. El dibujo interior se vuelve a crear en cada
 * cambio de estado (`keyed`), así su animación de entrada se dispara y el
 * cambio se ve en lugar de saltar. Sin estado (todavía sin `hass`) es el
 * escudo vacío.
 */
export function renderShield(state: AlarmVisualState | undefined): TemplateResult {
  const shown = state ?? 'disarmed';
  return html`
    <svg class="alarm-icon neon-halo-icon ${isFilled(shown) ? 'is-filled' : ''}" data-state=${shown} viewBox="0 0 24 24" aria-hidden="true">
      <path class="shield" d=${SHIELD_PATH}></path>
      ${keyed(shown, GLYPHS[shown])}
    </svg>
  `;
}
