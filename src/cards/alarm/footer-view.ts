import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { FooterSensorView } from './alarm-sensors';

export interface FooterItemContext {
  label: string;
  activeText: string;
  onOpen: (type: string) => void;
}

const stop = (ev: Event) => ev.stopPropagation();

/**
 * Un dato del pie: icono, tipo de sensor y cuántos están activos. Es un
 * botón: al pulsarlo abre la lista (sin disparar la acción de la tarjeta).
 * Con al menos uno activo se pinta en ámbar.
 */
export function renderFooterSensor(sensor: FooterSensorView, ctx: FooterItemContext): TemplateResult {
  const tone = sensor.activeCount > 0 ? 'warn' : sensor.total === 0 ? 'muted' : 'normal';
  return html`
    <button
      type="button"
      class="item item--${tone}"
      data-type=${sensor.type}
      aria-label=${`${ctx.label}: ${ctx.activeText}`}
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
        <span class="item-value">${ctx.activeText}</span>
      </div>
    </button>
  `;
}
