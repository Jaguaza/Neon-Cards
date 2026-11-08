import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { renderAlertDialog } from '../../shared';
import { FOOTER_ICONS } from './constants';

export interface EffectsViewContext {
  title: string;
  closeLabel: string;
  effects: string[];
  /** Efecto activo, si lo hay. */
  current?: string;
  onPick: (effect: string) => void;
  onCancel: () => void;
}

/**
 * Lista de efectos de la luz, flotando sobre la tarjeta (nunca la hace más
 * alta). Los nombres son los que declara la entidad, tal cual.
 */
export function renderEffectsView(ctx: EffectsViewContext): TemplateResult {
  return renderAlertDialog(
    'view',
    ctx.title,
    ctx.onCancel,
    html`
      <div class="view-head">
        <span class="view-title">${ctx.title}</span>
        <button type="button" class="view-close" aria-label=${ctx.closeLabel} title=${ctx.closeLabel} @click=${() => ctx.onCancel()}>
          <ha-icon icon=${FOOTER_ICONS.close}></ha-icon>
        </button>
      </div>
      <div class="view-list">
        ${ctx.effects.map(
          (effect) => html`<button type="button" class="effect ${effect === ctx.current ? 'effect--on' : ''}" aria-pressed=${effect === ctx.current ? 'true' : 'false'} @click=${() => ctx.onPick(effect)}>${effect}</button>`
        )}
      </div>
    `
  );
}
