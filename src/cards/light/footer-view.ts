import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { FOOTER_ICONS } from './constants';
import type { FavoriteColor } from './favorites';
import type { FooterControl, FooterItem } from './types';

/** El pie recoge sus propios gestos: sin cortarlos, un toque en un icono o en la barra llegaría al `ha-card` como pulsación de la tarjeta. */
const stop = (ev: Event) => ev.stopPropagation();

const readValue = (ev: Event): number => Number((ev.target as HTMLInputElement).value);

export interface FooterButtonsContext {
  label: (item: FooterItem) => string;
  onSelect: (item: FooterItem) => void;
  /** Si no caben todos los iconos, avanza el carrusel una posición; sin él no hay flecha. */
  onNext?: () => void;
  nextLabel: string;
}

export interface SliderSpec {
  control: FooterControl;
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
}

/** Un color favorito con la marca de si es el color que tiene ahora la luz. */
export interface FavoriteSwatch extends FavoriteColor {
  active: boolean;
}

export interface FavoritesContext {
  /** Texto accesible de cada muestra, antes del hexadecimal. */
  swatchLabel: string;
  closeLabel: string;
  onPick: (favorite: FavoriteColor) => void;
  onClose: () => void;
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

/** Fila de iconos: brillo, temperatura, color y efectos, los que ofrezca la luz y quepan; con `onNext`, la flecha del carrusel al final. */
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
      ${ctx.onNext ? renderNextButton(ctx.nextLabel, ctx.onNext) : nothing}
    </div>
  `;
}

function renderNextButton(label: string, onNext: () => void): TemplateResult {
  return html`
    <button type="button" class="foot-btn foot-btn--next" data-action="next" aria-label=${label} title=${label} @click=${() => onNext()}>
      <ha-icon icon=${FOOTER_ICONS.next}></ha-icon>
    </button>
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

/** Los colores favoritos en el sitio de los iconos: icono de estrella, una muestra por color (un toque y la luz lo toma) y cerrar. */
export function renderFooterFavorites(swatches: FavoriteSwatch[], ctx: FavoritesContext): TemplateResult {
  return html`
    <div class="control" data-control="favorites">
      <ha-icon class="control-icon" icon=${FOOTER_ICONS.favorites}></ha-icon>
      <div class="swatches">
        ${swatches.map(
          (swatch) => html`
            <button
              type="button"
              class="swatch ${swatch.active ? 'swatch--on' : ''}"
              data-color=${swatch.hex}
              style=${`background: ${swatch.hex}`}
              aria-label=${`${ctx.swatchLabel} ${swatch.hex}`}
              title=${swatch.hex}
              aria-pressed=${swatch.active ? 'true' : 'false'}
              @click=${() => ctx.onPick(swatch)}
            ></button>
          `
        )}
      </div>
      <button type="button" class="foot-btn foot-btn--close" data-action="close" aria-label=${ctx.closeLabel} title=${ctx.closeLabel} @click=${() => ctx.onClose()}>
        <ha-icon icon=${FOOTER_ICONS.close}></ha-icon>
      </button>
    </div>
  `;
}
