// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTION_PENDING_MS, VIEW_REVEAL_MS, VIEW_TIMEOUT_MS } from './constants';
import { active, card, click, hassWith, mount, view, viewButtons } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

/** Pulsa la tarjeta y deja pasar el retardo con el que se muestra la vista. */
async function tap(el: Card) {
  click(el);
  vi.advanceTimersByTime(VIEW_REVEAL_MS);
  await el.updateComplete;
}
const flush = async (el: Card) => {
  await vi.advanceTimersByTimeAsync(0);
  await el.updateComplete;
};
const title = (el: Card) => el.shadowRoot!.querySelector('.view-title')?.textContent;

describe('armar: selección de modo', () => {
  it('desarmada con varios modos: muestra solo los que soporta la entidad, con el halo encendido y sin lanzar nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('disarmed', { calls, attributes: { supported_features: 3 } }));
    await tap(el);
    expect(view(el)!.getAttribute('role')).toBe('alertdialog');
    expect(title(el)).toBe('¿Qué modo?');
    expect(viewButtons(el).map((b) => b.dataset.command)).toEqual(['armed_home', 'armed_away']);
    expect(viewButtons(el).map((b) => b.textContent!.trim())).toEqual(['En casa', 'Fuera']);
    expect(card(el).classList.contains('viewing')).toBe(true);
    expect(active(el)).toBe(true);
    expect(calls).toEqual([]);
  });

  it('con todos los modos los ofrece en orden', async () => {
    const el = await mount({});
    await tap(el);
    expect(viewButtons(el).map((b) => b.dataset.command)).toEqual(['armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass']);
  });

  it('elegir un modo llama a su servicio con la entidad', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('disarmed', { calls }));
    await tap(el);
    viewButtons(el).find((b) => b.dataset.command === 'armed_night')!.click();
    await flush(el);
    expect(calls).toEqual([['alarm_control_panel', 'alarm_arm_night', { entity_id: 'alarm_control_panel.casa' }]]);
    expect(view(el)).toBeNull();
  });

  it('cada modo usa su servicio alarm_arm_*', async () => {
    const services: Record<string, string> = { armed_home: 'alarm_arm_home', armed_away: 'alarm_arm_away', armed_vacation: 'alarm_arm_vacation', armed_custom_bypass: 'alarm_arm_custom_bypass' };
    for (const [command, service] of Object.entries(services)) {
      const calls: unknown[][] = [];
      const el = await mount({}, hassWith('disarmed', { calls }));
      await tap(el);
      viewButtons(el).find((b) => b.dataset.command === command)!.click();
      await flush(el);
      expect(calls[0][1], command).toBe(service);
    }
  });

  it('con un solo modo soportado arma directamente, sin preguntar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('disarmed', { calls, attributes: { supported_features: 2 } }));
    click(el);
    await flush(el);
    expect(view(el)).toBeNull();
    expect(calls).toEqual([['alarm_control_panel', 'alarm_arm_away', { entity_id: 'alarm_control_panel.casa' }]]);
  });

  it('cancelar con la ✕ cierra la vista sin lanzar nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('disarmed', { calls }));
    await tap(el);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.view .cancel')!.click();
    await el.updateComplete;
    expect(view(el)).toBeNull();
    expect(calls).toEqual([]);
  });

  it('la vista se cierra sola tras el tiempo de espera', async () => {
    const el = await mount({});
    await tap(el);
    vi.advanceTimersByTime(VIEW_TIMEOUT_MS);
    await el.updateComplete;
    expect(view(el)).toBeNull();
  });

  it('la compacta ofrece los modos solo con iconos (el texto queda como etiqueta)', async () => {
    const el = await mount({ size: 'compact' });
    await tap(el);
    expect(viewButtons(el).every((b) => b.querySelector('ha-icon') && b.textContent!.trim() === '')).toBe(true);
    expect(viewButtons(el)[0].getAttribute('aria-label')).toBe('En casa');
  });
});

describe('desarmar', () => {
  it('armada y sin código: pulsar desarma directamente', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('armed_away', { calls }));
    click(el);
    await flush(el);
    expect(calls).toEqual([['alarm_control_panel', 'alarm_disarm', { entity_id: 'alarm_control_panel.casa' }]]);
  });

  it('en transición o disparada también desarma', async () => {
    for (const state of ['pending', 'arming', 'triggered']) {
      const calls: unknown[][] = [];
      const el = await mount({}, hassWith(state, { calls }));
      click(el);
      await flush(el);
      expect(calls[0]?.[1], state).toBe('alarm_disarm');
    }
  });

  it('con la entidad caída o sin entidad, pulsar no hace nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('unavailable', { calls }));
    click(el);
    await flush(el);
    expect(calls).toEqual([]);
    expect(view(el)).toBeNull();
  });

  it('tras lanzar una orden el halo se mantiene encendido esperando el cambio y se apaga si no llega', async () => {
    const el = await mount({}, hassWith('disarmed', { attributes: { supported_features: 2 } }));
    click(el);
    await flush(el);
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(ACTION_PENDING_MS + 10);
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });
});

describe('confirmación (opción confirmation)', () => {
  it('desactivada por defecto: desarmar no pregunta', async () => {
    const el = await mount({}, hassWith('armed_home'));
    await tap(el);
    expect(view(el)).toBeNull();
  });

  it('activada: pregunta antes de desarmar, con el foco en «Cancelar», y no lanza nada hasta aceptar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ confirmation: true }, hassWith('armed_home', { calls }));
    await tap(el);
    expect(title(el)).toBe('¿Desarmar?');
    expect(calls).toEqual([]);
    expect(el.shadowRoot!.activeElement?.classList.contains('cancel')).toBe(true);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.view .accept')!.click();
    await flush(el);
    expect(calls).toEqual([['alarm_control_panel', 'alarm_disarm', { entity_id: 'alarm_control_panel.casa' }]]);
  });

  it('activada y con un solo modo: pregunta «¿Armar?» antes de armar', async () => {
    const el = await mount({ confirmation: true }, hassWith('disarmed', { attributes: { supported_features: 1 } }));
    await tap(el);
    expect(title(el)).toBe('¿Armar?');
  });

  it('elegir un modo ya es una decisión: no vuelve a preguntar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ confirmation: true }, hassWith('disarmed', { calls }));
    await tap(el);
    viewButtons(el)[0].click();
    await flush(el);
    expect(calls.length).toBe(1);
  });

  it('cancelar no lanza nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ confirmation: true }, hassWith('armed_home', { calls }));
    await tap(el);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.view .cancel')!.click();
    await flush(el);
    expect(calls).toEqual([]);
    expect(view(el)).toBeNull();
  });
});

describe('cambio de estado con una vista abierta', () => {
  it('si la alarma cambia mientras se pregunta, la vista se cierra', async () => {
    const el = await mount({}, hassWith('disarmed'));
    await tap(el);
    el.hass = hassWith('armed_away');
    await el.updateComplete;
    expect(view(el)).toBeNull();
  });
});
