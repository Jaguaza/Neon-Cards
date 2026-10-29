import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { COMMAND_ICONS } from './constants';
import type { AlarmTranslations } from './translations';
import type { AlarmCommand } from './types';

/** Lo que las vistas necesitan de la tarjeta que las muestra. */
export interface ViewContext {
  name: string;
  compact: boolean;
  translate: (key: keyof AlarmTranslations) => string;
  onCancel: () => void;
}

/**
 * Las vistas cuelgan encima del contenido y recogen sus propios gestos: sin
 * cortar la propagación, el clic en un botón llegaría al `ha-card` y se
 * interpretaría como otra pulsación de la tarjeta.
 */
const stop = (ev: Event) => ev.stopPropagation();

export function viewDialog(className: string, title: string, onCancel: () => void, content: TemplateResult): TemplateResult {
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

/** Botón de la vista: en la compacta solo icono (el texto queda como aria-label y tooltip). */
export function viewButton(role: string, label: string, icon: string, compact: boolean, onClick: () => void, command?: AlarmCommand): TemplateResult {
  return html`
    <button type="button" class="view-btn ${role}" data-command=${command ?? nothing} aria-label=${label} title=${label} @click=${onClick}>
      ${compact ? html`<ha-icon icon=${icon}></ha-icon>` : label}
    </button>
  `;
}

/** Botón redondo de ✕ (cancelar) que lleva todas las vistas. */
export function cancelButton(ctx: ViewContext): TemplateResult {
  const label = ctx.translate('view_cancel');
  return html`<button type="button" class="view-btn cancel icon-only" aria-label=${label} title=${label} @click=${ctx.onCancel}><ha-icon icon="mdi:close"></ha-icon></button>`;
}

/** Selección del modo de armado: un botón por cada modo que soporta la entidad. */
export function renderModesView(ctx: ViewContext, choices: AlarmCommand[], onPick: (command: AlarmCommand) => void): TemplateResult {
  const title = ctx.translate('mode_title');
  const buttons = choices.map((command) => viewButton('accept', ctx.translate(`command_${command}`), COMMAND_ICONS[command], ctx.compact, () => onPick(command), command));
  return viewDialog(
    'view view--modes',
    title,
    ctx.onCancel,
    html`
      ${ctx.compact ? nothing : html`<div class="view-text"><span class="view-title">${title}</span><span class="view-name">${ctx.name}</span></div>`}
      <div class="view-actions">${cancelButton(ctx)}${buttons}</div>
    `
  );
}
