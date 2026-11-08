import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { FOOTER_ICONS } from './constants';
import type { FooterControl, FooterItem } from './types';

/** El pie recoge sus propios gestos: sin cortarlos, un toque en un icono o en la barra llegaría al `ha-card` como pulsación de la tarjeta. */
const stop = (ev: Event) => ev.stopPropagation();

const readValue = (ev: Event): number => Number((ev.target as HTMLInputElement).value);

export interface FooterButtonsContext {
  label: (item: FooterItem) => string;
  onSelect: (item: FooterItem) => void;
}

export interface SliderSpec {
  control: FooterControl;
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
}

export interface SliderContext {
  closeLabel: string;
  onClose: () => void;
  /** Mientras se arrastra (cada movimiento). */
  onPreview: (value: number) => void;
  /** Al soltar: es cuando se manda la orden. */
  onCommit: (value: number) => void;
}

/** Divisor y pie de alto fijo: lo que cambia dentro (iconos o barra) nunca cambia el alto de la tarjeta. */
export function renderFooterShell(content: TemplateResult): TemplateResult {
  return html`
    <div class="divider"></div>
    <div class="footer" @pointerdown=${stop} @pointerup=${stop} @pointercancel=${stop} @click=${stop}>${content}</div>
  `;
}

/** Fila de iconos: brillo, temperatura, color y efectos, los que ofrezca la luz. */
export function renderFooterButtons(items: FooterItem[], ctx: FooterButtonsContext): TemplateResult {
  return html`
    <div class="footer-buttons">
      ${items.map(
        (item) => html`
          <button type="button" class="foot-btn" data-item=${item} aria-label=${ctx.label(item)} title=${ctx.label(item)} @click=${() => ctx.onSelect(item)}>
            <ha-icon icon=${FOOTER_ICONS[item]}></ha-icon>
          </button>
        `
      )}
    </div>
  `;
}

/** La barra de un control en el sitio de los iconos: icono del control, barra, valor y cerrar. */
export function renderFooterSlider(spec: SliderSpec, ctx: SliderContext): TemplateResult {
  return html`
    <div class="control" data-control=${spec.control}>
      <ha-icon class="control-icon" icon=${FOOTER_ICONS[spec.control]}></ha-icon>
      <input
        type="range"
        class="slider slider--${spec.control}"
        min=${spec.min}
        max=${spec.max}
        step="1"
        .value=${String(spec.value)}
        aria-label=${spec.label}
        @input=${(ev: Event) => ctx.onPreview(readValue(ev))}
        @change=${(ev: Event) => ctx.onCommit(readValue(ev))}
      />
      <span class="control-value">${spec.value}${spec.unit}</span>
      <button type="button" class="foot-btn foot-btn--close" data-action="close" aria-label=${ctx.closeLabel} title=${ctx.closeLabel} @click=${() => ctx.onClose()}>
        <ha-icon icon=${FOOTER_ICONS.close}></ha-icon>
      </button>
    </div>
  `;
}
