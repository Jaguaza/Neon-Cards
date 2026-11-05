import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * ¿Define este Home Assistant `ha-formfield`? La 2026.11 lo eliminó (frontend
 * #54200): `ha-checkbox` y `ha-switch` pintan ya su propia etiqueta, la que
 * se les pone dentro. Las versiones anteriores todavía lo definen y es lo
 * único que dibuja la etiqueta.
 */
export function hasFormfield(): boolean {
  return typeof customElements !== 'undefined' && customElements.get('ha-formfield') !== undefined;
}

/**
 * Un `ha-checkbox` o `ha-switch` con su etiqueta, valga la versión de Home
 * Assistant que valga. `control` recibe lo que debe ir dentro del control: la
 * etiqueta, si este HA ya no tiene `ha-formfield`, o `nothing` si lo tiene
 * (entonces el control se envuelve en un `ha-formfield` con la etiqueta, y
 * ponerla dentro también la repetiría).
 *
 * ```ts
 * labeledControl('Solo activos', (label) => html`<ha-checkbox .checked=${on}>${label}</ha-checkbox>`)
 * ```
 */
export function labeledControl(label: string, control: (slotted: string | typeof nothing) => TemplateResult): TemplateResult {
  if (hasFormfield()) return html`<ha-formfield label=${label}>${control(nothing)}</ha-formfield>`;
  return control(label);
}
