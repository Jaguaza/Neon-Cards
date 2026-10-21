import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { nothing } from 'lit';
import { COMMAND_ICONS } from './constants';
import type { LockCommand } from './lock-state';
import type { LockTranslations } from './translations';

/** Lo que la vista «¿Abrir?» necesita de la tarjeta que la muestra. */
export interface ConfirmViewContext {
  choices: LockCommand[];
  name: string;
  translate: (key: keyof LockTranslations) => string;
  onCancel: () => void;
  onAccept: (command?: LockCommand) => void;
}

/**
 * La vista «¿Abrir?» cuelga encima del contenido y recoge sus propios
 * gestos: sin cortar la propagación, el clic en un botón llegaría al
 * `ha-card` y se interpretaría como otra pulsación (y otra confirmación).
 */
const stop = (ev: Event) => ev.stopPropagation();

function confirmDialog(className: string, title: string, onCancel: () => void, content: TemplateResult): TemplateResult {
  return html`
    <div
      class=${className}
      role="alertdialog"
      aria-label=${title}
      @pointerdown=${stop}
      @pointerup=${stop}
      @pointercancel=${stop}
      @click=${stop}
      @keydown=${(ev: KeyboardEvent) => {
        if (ev.key === 'Escape') onCancel();
      }}
    >
      ${content}
    </div>
  `;
}

function iconButton(role: 'cancel' | 'accept', label: string, icon: string, onClick: () => void, command?: LockCommand): TemplateResult {
  return html`
    <button type="button" class="confirm-btn ${role}" data-command=${command ?? nothing} aria-label=${label} title=${label} @click=${onClick}>
      <ha-icon icon=${icon}></ha-icon>
    </button>
  `;
}

/**
 * Compacta: sin texto visible; la orden se elige con iconos de candado
 * (el texto queda como aria-label y tooltip).
 */
export function renderCompactConfirm(ctx: ConfirmViewContext): TemplateResult {
  const { choices, translate: t } = ctx;
  const multi = choices.length > 1;
  const accepts = multi
    ? choices.map((command) => iconButton('accept', t(`command_${command}`), COMMAND_ICONS[command], () => ctx.onAccept(command), command))
    : [iconButton('accept', t('confirm_accept'), COMMAND_ICONS.unlock, () => ctx.onAccept())];
  return confirmDialog(
    'confirm confirm--compact',
    t(multi ? 'confirm_choose' : 'confirm_title'),
    ctx.onCancel,
    html`<div class="confirm-actions">${iconButton('cancel', t('confirm_cancel'), 'mdi:close', () => ctx.onCancel())}${accepts}</div>`
  );
}

/** Grande y mediana: título, nombre y botones con texto. */
export function renderFullConfirm(ctx: ConfirmViewContext): TemplateResult {
  const { choices, translate: t } = ctx;
  const multi = choices.length > 1;
  const title = t(multi ? 'confirm_choose' : 'confirm_title');
  const accepts = multi
    ? choices.map(
        (command) => html`<button type="button" class="confirm-btn accept" data-command=${command} @click=${() => ctx.onAccept(command)}>${t(`command_${command}`)}</button>`
      )
    : html`<button type="button" class="confirm-btn accept" @click=${() => ctx.onAccept()}>${t('confirm_accept')}</button>`;
  return confirmDialog(
    `confirm ${multi ? 'confirm--multi' : ''}`,
    title,
    ctx.onCancel,
    html`
      <div class="confirm-text">
        <span class="confirm-title">${title}</span>
        <span class="confirm-name">${ctx.name}</span>
      </div>
      <div class="confirm-actions">
        <button type="button" class="confirm-btn cancel" aria-label=${t('confirm_cancel')} title=${t('confirm_cancel')} @click=${() => ctx.onCancel()}>${multi ? html`<ha-icon icon="mdi:close"></ha-icon>` : t('confirm_cancel')}</button>
        ${accepts}
      </div>
    `
  );
}
