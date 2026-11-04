// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOUBLE_TAP_DELAY_MS, HOLD_DELAY_MS } from '../../core';
import { VIEW_REVEAL_MS } from '../../shared';
import { active, card, click, hassWith, mount, view } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

interface Fired {
  action: string;
  config: Record<string, { action: string } | string | undefined>;
}

/** Recoge los eventos `hass-action` que la tarjeta lanza hacia Home Assistant. */
function listen(el: Card): Fired[] {
  const fired: Fired[] = [];
  el.addEventListener('hass-action', (ev) => fired.push((ev as CustomEvent<Fired>).detail));
  return fired;
}

const pointer = (el: Card, type: 'pointerdown' | 'pointerup') => card(el).dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true }));
const flush = async (el: Card) => {
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
};

describe('gestos y acciones de la tarjeta', () => {
  it('getCardSize devuelve 3', async () => {
    const el = await mount({});
    expect((el as unknown as { getCardSize(): number }).getCardSize()).toBe(3);
  });

  it('mantener pulsado lanza hold_action, por defecto «más información», sin armar ni desarmar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls }));
    const fired = listen(el);
    pointer(el, 'pointerdown');
    vi.advanceTimersByTime(HOLD_DELAY_MS);
    expect(fired.map((f) => f.action)).toEqual(['hold']);
    expect(fired[0].config.hold_action).toEqual({ action: 'more-info' });
    expect(calls).toEqual([]);
    expect(view(el)).toBeNull();
  });

  it('respeta la hold_action configurada', async () => {
    const el = await mount({ hold_action: { action: 'navigate', navigation_path: '/alarma' } });
    const fired = listen(el);
    pointer(el, 'pointerdown');
    vi.advanceTimersByTime(HOLD_DELAY_MS);
    expect(fired[0].config.hold_action).toEqual({ action: 'navigate', navigation_path: '/alarma' });
  });

  it('soltar antes de tiempo cancela el mantener pulsado', async () => {
    const el = await mount({});
    const fired = listen(el);
    pointer(el, 'pointerdown');
    vi.advanceTimersByTime(HOLD_DELAY_MS - 1);
    pointer(el, 'pointerup');
    vi.advanceTimersByTime(HOLD_DELAY_MS);
    expect(fired).toEqual([]);
  });

  it('con double_tap_action, dos toques seguidos lanzan esa acción y no la de tap', async () => {
    const el = await mount({ double_tap_action: { action: 'more-info' } });
    const fired = listen(el);
    click(el);
    click(el);
    vi.advanceTimersByTime(DOUBLE_TAP_DELAY_MS + VIEW_REVEAL_MS);
    await el.updateComplete;
    expect(fired.map((f) => f.action)).toEqual(['double_tap']);
    expect(fired[0].config.double_tap_action).toEqual({ action: 'more-info' });
    expect(view(el)).toBeNull();
  });

  it('con double_tap_action, un toque suelto espera y entonces hace la acción de tap', async () => {
    const el = await mount({ double_tap_action: { action: 'more-info' } });
    click(el);
    vi.advanceTimersByTime(DOUBLE_TAP_DELAY_MS - 1);
    expect(view(el)).toBeNull();
    vi.advanceTimersByTime(1 + VIEW_REVEAL_MS);
    await el.updateComplete;
    expect(view(el)).not.toBeNull();
  });

  it('una tap_action distinta de toggle se lanza hacia Home Assistant y no abre vistas ni llama a servicios', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ tap_action: { action: 'more-info' } }, hassWith('disarmed', { calls }));
    const fired = listen(el);
    click(el);
    await el.updateComplete;
    expect(fired.map((f) => f.action)).toEqual(['tap']);
    expect(fired[0].config.tap_action).toEqual({ action: 'more-info' });
    expect(view(el)).toBeNull();
    expect(calls).toEqual([]);
  });
});

describe('vistas abiertas', () => {
  it('pulsar la tarjeta con el teclado abierto no lo reinicia: el código a medias se conserva', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_home', { calls, attributes: { code_format: 'number' } }));
    const dots = () => el.shadowRoot!.querySelectorAll('.code-dots .dot').length;
    click(el);
    vi.advanceTimersByTime(VIEW_REVEAL_MS);
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLButtonElement>('.key[data-key="1"]')!.click();
    await el.updateComplete;
    expect(dots()).toBe(1);
    vi.advanceTimersByTime(DOUBLE_TAP_DELAY_MS); // para que no cuente como doble toque
    click(el);
    vi.advanceTimersByTime(VIEW_REVEAL_MS);
    await el.updateComplete;
    expect(dots()).toBe(1);
    expect(el.shadowRoot!.querySelectorAll('.view').length).toBe(1);
    expect(calls).toEqual([]);
  });

  it('Escape cierra la vista y apaga el halo', async () => {
    const el = await mount({});
    click(el);
    vi.advanceTimersByTime(VIEW_REVEAL_MS);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    view(el)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await el.updateComplete;
    expect(view(el)).toBeNull();
    expect(active(el)).toBe(false);
  });

  it('otra tecla no cierra la vista', async () => {
    const el = await mount({});
    click(el);
    vi.advanceTimersByTime(VIEW_REVEAL_MS);
    await el.updateComplete;
    view(el)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, composed: true }));
    await el.updateComplete;
    expect(view(el)).not.toBeNull();
  });
});

describe('si el servicio falla', () => {
  it('sin código de por medio, el halo de espera se apaga y no queda ninguna vista', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('disarmed', { calls, attributes: { supported_features: 1, code_arm_required: false }, reject: new Error('sin conexión') }));
    click(el);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    expect(calls.length).toBe(1);
    await flush(el);
    expect(active(el)).toBe(false);
    expect(view(el)).toBeNull();
  });
});

describe('subtítulo con fechas', () => {
  const stateWith = (changed: string, updated: string) => {
    const hass = hassWith('armed_home');
    const entity = (hass.states as Record<string, { last_changed: string; last_updated: string }>)['alarm_control_panel.casa'];
    entity.last_changed = changed;
    entity.last_updated = updated;
    return hass;
  };
  const relative = (el: Card) => el.shadowRoot!.querySelector('.subtitle ha-relative-time') as (HTMLElement & { datetime?: string }) | null;

  it('«último cambio» y «última actualización» muestran la fecha correspondiente de la entidad', async () => {
    const hass = stateWith('2026-11-03T08:00:00Z', '2026-11-03T09:30:00Z');
    expect(relative(await mount({ subtitle_type: 'last-changed' }, hass))!.datetime).toBe('2026-11-03T08:00:00Z');
    document.body.innerHTML = '';
    expect(relative(await mount({ subtitle_type: 'last-updated' }, hass))!.datetime).toBe('2026-11-03T09:30:00Z');
  });

  it('sin entidad válida no muestra ninguna fecha', async () => {
    const el = await mount({ entity: 'alarm_control_panel.no_existe', subtitle_type: 'last-changed' });
    expect(relative(el)).toBeNull();
  });
});

describe('avisos en modo desarrollo', () => {
  afterEach(() => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    vi.restoreAllMocks();
  });

  it('avisa si falta la entidad o no es de alarm_control_panel, y solo en desarrollo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await mount({ entity: '' });
    await mount({ entity: 'sensor.temperatura' });
    expect(warn).not.toHaveBeenCalled();
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    await mount({ entity: '' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('falta `entity:`');
    await mount({ entity: 'sensor.temperatura' });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[1][0]).toContain('no es del dominio alarm_control_panel');
    await mount({ entity: 'alarm_control_panel.casa' });
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
