import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { live } from 'lit/directives/live.js';

/**
 * Píldora-selector de la tarjeta (modo HVAC, preset, ventilador): un
 * `<select>` nativo transparente encima de una píldora que enseña el
 * valor actual. El nativo da gratis el desplegable del sistema (en
 * móvil, el selector de rueda) y la accesibilidad.
 */
export interface SelectorPillOptions {
  icon: string;
  /** Texto visible en la píldora (el valor actual ya formateado). */
  display: string;
  ariaLabel: string;
  /** Valor actual; `live()` mantiene el `<select>` sincronizado con el
      estado real aunque el usuario lo haya cambiado a mano antes. */
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  /** Color del icono (var `--current-color`). */
  color: string;
  onSelect: (value: string) => void;
}

export function renderSelectorPill(o: SelectorPillOptions): TemplateResult {
  return html`
    <div class="mode-selector-wrap" style="--current-color: ${o.color}">
      <div class="mode-selector-display">
        <ha-icon icon=${o.icon}></ha-icon>
        <span>${o.display}</span>
        <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
      </div>
      <select
        class="mode-selector-native"
        aria-label=${o.ariaLabel}
        .value=${live(o.value)}
        @change=${(ev: Event) => o.onSelect((ev.target as HTMLSelectElement).value)}
      >
        ${o.options.map((opt) => html`<option value=${opt.value}>${opt.label}</option>`)}
      </select>
    </div>
  `;
}
