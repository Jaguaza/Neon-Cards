import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { FooterSensorView } from './alarm-sensors';

export interface FooterItemContext {
  label: string;
  /** Recuento que se muestra: el número de sensores activos, «0» en reposo o «—» si no hay sensores. */
  count: string;
  /** Texto junto al recuento («activos», «En reposo»); vacío si no hay sensores. */
  word: string;
  onOpen: (type: string) => void;
}

const stop = (ev: Event) => ev.stopPropagation();

/**
 * Un dato del pie: icono, tipo de sensor y cuántos están activos. Es un
 * botón: al pulsarlo abre la lista (sin disparar la acción de la tarjeta).
 * Con al menos uno activo se pinta en ámbar. El recuento y el texto van en
 * elementos propios: en la tarjeta mediana estrecha solo se deja el número.
 */
export function renderFooterSensor(sensor: FooterSensorView, ctx: FooterItemContext): TemplateResult {
  const tone = sensor.activeCount > 0 ? 'warn' : sensor.total === 0 ? 'muted' : 'normal';
  const idle = sensor.activeCount === 0 && ctx.word !== '';
  return html`
    <button
      type="button"
      class="item item--${tone}"
      data-type=${sensor.type}
      aria-label=${`${ctx.label}: ${ctx.count} ${ctx.word}`.trim()}
      @pointerdown=${stop}
      @pointerup=${stop}
      @pointercancel=${stop}
      @click=${(ev: Event) => {
        ev.stopPropagation();
        ctx.onOpen(sensor.type);
      }}
    >
      <ha-icon icon=${sensor.icon}></ha-icon>
      <div class="item-text">
        <span class="item-label">${ctx.label}</span>
        <span class="item-value ${idle ? 'is-idle' : ''}"><span class="count">${ctx.count}</span>${ctx.word ? html`<span class="word"> ${ctx.word}</span>` : nothing}</span>
      </div>
    </button>
  `;
}
