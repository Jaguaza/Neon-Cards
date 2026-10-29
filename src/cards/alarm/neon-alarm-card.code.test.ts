// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEW_REVEAL_MS } from './constants';
import { click, hassWith, key, mount, view, viewButtons } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

async function tap(el: Card) {
  click(el);
  vi.advanceTimersByTime(VIEW_REVEAL_MS);
  await el.updateComplete;
}
const flush = async (el: Card) => {
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
};
const press = async (el: Card, ...names: string[]) => {
  for (const name of names) {
    key(el, name).click();
    await el.updateComplete;
  }
};
const dots = (el: Card) => el.shadowRoot!.querySelectorAll('.code-dots .dot').length;
const title = (el: Card) => el.shadowRoot!.querySelector('.view-title')?.textContent;
const numeric = { code_format: 'number' };

describe('teclado numérico', () => {
  it('si la entidad exige código, desarmar abre el teclado y no lanza nada todavía', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls, attributes: numeric }));
    await tap(el);
    expect(title(el)).toBe('Introduce el código');
    expect(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', 'accept'].every((k) => key(el, k))).toBe(true);
    expect(calls).toEqual([]);
  });

  it('las teclas escriben el código (solo se ven puntos) y Aceptar lo envía con la orden', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls, attributes: numeric }));
    await tap(el);
    await press(el, '1', '2', '3', '4');
    expect(dots(el)).toBe(4);
    expect(el.shadowRoot!.querySelector('.code-dots')!.textContent!.trim()).toBe('');
    await press(el, 'accept');
    await flush(el);
    expect(calls).toEqual([['alarm_control_panel', 'alarm_disarm', { entity_id: 'alarm_control_panel.casa', code: '1234' }]]);
    expect(view(el)).toBeNull();
  });

  it('borrar quita el último dígito y Aceptar está desactivado sin código', async () => {
    const el = await mount({}, hassWith('armed_home', { attributes: numeric }));
    await tap(el);
    expect(key(el, 'accept').disabled).toBe(true);
    await press(el, '7', '8', 'backspace');
    expect(dots(el)).toBe(1);
    await press(el, 'backspace');
    expect(dots(el)).toBe(0);
    expect(key(el, 'accept').disabled).toBe(true);
  });

  it('armar con código: primero se elige el modo y después sale el teclado; el servicio lleva el código', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('disarmed', { calls, attributes: numeric }));
    await tap(el);
    viewButtons(el).find((b) => b.dataset.command === 'armed_away')!.click();
    vi.advanceTimersByTime(VIEW_REVEAL_MS);
    await el.updateComplete;
    expect(title(el)).toBe('Introduce el código');
    await press(el, '0', '0', '0', '0', 'accept');
    await flush(el);
    expect(calls).toEqual([['alarm_control_panel', 'alarm_arm_away', { entity_id: 'alarm_control_panel.casa', code: '0000' }]]);
  });

  it('code_arm_required: false arma sin pedir código pero desarmar sí lo pide', async () => {
    const calls: unknown[][] = [];
    const attributes = { ...numeric, code_arm_required: false, supported_features: 2 };
    const armed = await mount({}, hassWith('disarmed', { calls, attributes }));
    click(armed);
    await flush(armed);
    expect(view(armed)).toBeNull();
    expect(calls[0][1]).toBe('alarm_arm_away');
    const disarm = await mount({}, hassWith('armed_away', { attributes }));
    await tap(disarm);
    expect(title(disarm)).toBe('Introduce el código');
  });

  it('un código rechazado por HA lo avisa, vacía lo escrito y deja la vista abierta para reintentar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls, attributes: numeric, reject: new Error('Invalid alarm code provided') }));
    await tap(el);
    await press(el, '9', '9', 'accept');
    await flush(el);
    expect(view(el)).not.toBeNull();
    expect(title(el)).toBe('Código incorrecto');
    expect(dots(el)).toBe(0);
    expect(calls.length).toBe(1);
    await press(el, '1');
    expect(title(el)).toBe('Introduce el código');
  });

  it('cancelar con la ✕ cierra el teclado sin lanzar nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls, attributes: numeric }));
    await tap(el);
    await press(el, '1');
    el.shadowRoot!.querySelector<HTMLButtonElement>('.view .cancel')!.click();
    await el.updateComplete;
    expect(view(el)).toBeNull();
    expect(calls).toEqual([]);
  });
});

describe('código de texto', () => {
  it('muestra un campo de contraseña en lugar del teclado y envía lo escrito con Intro', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls, attributes: { code_format: 'text' } }));
    await tap(el);
    expect(el.shadowRoot!.querySelector('.keypad')).toBeNull();
    const input = el.shadowRoot!.querySelector<HTMLInputElement>('.code-input')!;
    expect(input.type).toBe('password');
    input.value = 'abc123';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await flush(el);
    expect(calls).toEqual([['alarm_control_panel', 'alarm_disarm', { entity_id: 'alarm_control_panel.casa', code: 'abc123' }]]);
  });
});
