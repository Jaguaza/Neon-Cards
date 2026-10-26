import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { cancelButton, viewDialog } from './flow-views';
import type { ViewContext } from './flow-views';

/** Teclas del teclado numérico, en filas de tres. */
const DIGIT_ROWS: readonly (readonly string[])[] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export interface KeypadContext extends ViewContext {
  code: string;
  error: boolean;
  format: 'number' | 'text';
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onText: (value: string) => void;
  onAccept: () => void;
}

function digitKey(ctx: KeypadContext, digit: string): TemplateResult {
  return html`<button type="button" class="key" data-key=${digit} @click=${() => ctx.onDigit(digit)}>${digit}</button>`;
}

/** Puntos que muestran cuántos caracteres lleva el código, sin enseñarlos. */
function codeDots(ctx: KeypadContext): TemplateResult {
  const dots = Array.from({ length: ctx.code.length }, () => html`<span class="dot"></span>`);
  return html`<div class="code-dots" aria-live="polite">${dots}</div>`;
}

function keypadGrid(ctx: KeypadContext): TemplateResult {
  const backspace = ctx.translate('code_delete');
  const accept = ctx.translate('code_accept');
  return html`
    <div class="keypad">
      ${DIGIT_ROWS.map((row) => row.map((digit) => digitKey(ctx, digit)))}
      <button type="button" class="key key--action" data-key="backspace" aria-label=${backspace} title=${backspace} @click=${ctx.onBackspace}><ha-icon icon="mdi:backspace-outline"></ha-icon></button>
      ${digitKey(ctx, '0')}
      <button type="button" class="key key--accept" data-key="accept" aria-label=${accept} title=${accept} ?disabled=${ctx.code === ''} @click=${ctx.onAccept}><ha-icon icon="mdi:check"></ha-icon></button>
    </div>
  `;
}

function textField(ctx: KeypadContext): TemplateResult {
  const accept = ctx.translate('code_accept');
  return html`
    <div class="code-text">
      <input
        type="password"
        class="code-input"
        autocomplete="off"
        placeholder=${ctx.translate('code_placeholder')}
        .value=${ctx.code}
        @input=${(ev: InputEvent) => ctx.onText((ev.target as HTMLInputElement).value)}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === 'Enter' && ctx.code !== '') ctx.onAccept();
        }}
      />
      <button type="button" class="view-btn accept" aria-label=${accept} title=${accept} ?disabled=${ctx.code === ''} @click=${ctx.onAccept}><ha-icon icon="mdi:check"></ha-icon></button>
    </div>
  `;
}

/**
 * Teclado de código. `number` dibuja un teclado numérico con puntos para lo
 * escrito; `text` (alarmas con código alfanumérico) un campo de contraseña.
 * Un código rechazado lo avisa en la misma cabecera y vacía lo escrito.
 */
export function renderKeypadView(ctx: KeypadContext): TemplateResult {
  const title = ctx.translate(ctx.error ? 'code_error' : 'code_title');
  return viewDialog(
    `view view--keypad ${ctx.error ? 'has-error' : ''}`,
    title,
    ctx.onCancel,
    html`
      <div class="keypad-head">
        <span class="view-title ${ctx.error ? 'is-error' : ''}">${title}</span>
        ${cancelButton(ctx)}
      </div>
      ${ctx.format === 'number' ? html`${codeDots(ctx)}${keypadGrid(ctx)}` : textField(ctx)}
    `
  );
}
