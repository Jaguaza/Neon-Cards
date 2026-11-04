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

/**
 * Botón de la vista grande y mediana: texto e icono. El icono solo se ve
 * cuando la tarjeta es tan estrecha que los botones pasan a ser redondos
 * (ver `neon-lock-card.size.styles.ts`); sin hueco entre ambos para que el
 * `textContent` del botón siga siendo solo su texto.
 */
function labelledButton(role: 'cancel' | 'accept', label: string, icon: string, onClick: () => void, extra: { command?: LockCommand; iconOnly?: boolean } = {}): TemplateResult {
  const text = extra.iconOnly ? nothing : html`<span class="confirm-btn-label">${label}</span>`;
  return html`<button type="button" class="confirm-btn ${role}" data-command=${extra.command ?? nothing} aria-label=${label} title=${label} @click=${onClick}><ha-icon class="confirm-btn-icon" icon=${icon}></ha-icon>${text}</button>`;
}

/** Grande y mediana: título, nombre y botones con texto (iconos redondos si la tarjeta es muy estrecha). */
export function renderFullConfirm(ctx: ConfirmViewContext): TemplateResult {
  const { choices, translate: t } = ctx;
  const multi = choices.length > 1;
  const title = t(multi ? 'confirm_choose' : 'confirm_title');
  const accepts = multi
    ? choices.map((command) => labelledButton('accept', t(`command_${command}`), COMMAND_ICONS[command], () => ctx.onAccept(command), { command }))
    : labelledButton('accept', t('confirm_accept'), COMMAND_ICONS.unlock, () => ctx.onAccept());
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
        ${labelledButton('cancel', t('confirm_cancel'), 'mdi:close', () => ctx.onCancel(), { iconOnly: multi })} ${accepts}
      </div>
    `
  );
}
