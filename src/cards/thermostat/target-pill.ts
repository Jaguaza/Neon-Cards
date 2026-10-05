import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { ThermostatSize } from './types';

export interface TargetPillOptions {
  color: string;
  variant: ThermostatSize;
  displayTarget: number | null;
  /** -1 / +1: un paso de consigna (el paso real lo resuelve la tarjeta). */
  onStep: (direction: -1 | 1) => void;
}

/** Píldora −/valor/+ de la consigna; la comparten las tres vistas. */
export function renderTargetPill(o: TargetPillOptions): TemplateResult {
  return html`
    <div class="target-pill target-pill--${o.variant}" style="--current-color: ${o.color}">
      <button class="target-pill-btn" @click=${() => o.onStep(-1)}>
        <ha-icon icon="mdi:minus"></ha-icon>
      </button>
      <span class="target-value">${o.displayTarget ?? '--'}°</span>
      <button class="target-pill-btn" @click=${() => o.onStep(1)}>
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>
    </div>
  `;
}
