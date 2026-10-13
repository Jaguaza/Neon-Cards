// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTION_FLASH_MS } from './constants';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Card = HTMLElement & {
  setConfig(c: unknown): void;
  hass: unknown;
  updateComplete: Promise<boolean>;
};

function hassWith(state: string, language = 'es') {
  return {
    locale: { language },
    states: { 'lock.puerta': { entity_id: 'lock.puerta', state, last_changed: '', last_updated: '', attributes: { friendly_name: 'Puerta' } } },
    callService: async () => undefined,
  };
}

async function mount(config: Record<string, unknown>, hass: unknown = hassWith('locked')): Promise<Card> {
  await import('./index');
  const el = document.createElement('neon-lock-card') as Card;
  el.setConfig({ entity: 'lock.puerta', ...config });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const card = (el: Card) => el.shadowRoot!.querySelector('ha-card')!;
const icon = (el: Card) => el.shadowRoot!.querySelector('ha-icon')!.getAttribute('icon');
const subtitle = (el: Card) => el.shadowRoot!.querySelector('.subtitle')?.textContent?.trim();

const active = (el: Card) => card(el).classList.contains('neon-halo-active');
const click = (el: Card) => card(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('NeonLockCard', () => {
  it('cerrada: en reposo sin halo, icono de candado y estado traducido', async () => {
    const el = await mount({});
    expect(active(el)).toBe(false);
    expect(card(el).classList.contains('neon-halo-error')).toBe(false);
    expect(icon(el)).toBe('mdi:lock');
    expect(subtitle(el)).toBe('Cerrada');
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Puerta');
  });

  it('abierta: en reposo sin halo e icono de candado abierto', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(active(el)).toBe(false);
    expect(icon(el)).toBe('mdi:lock-open-variant');
    expect(subtitle(el)).toBe('Abierta');
  });

  it('en movimiento (cerrando, abriendo): halo encendido y clase de pulso', async () => {
    for (const state of ['locking', 'unlocking', 'opening']) {
      const el = await mount({}, hassWith(state));
      expect(active(el)).toBe(true);
      expect(card(el).classList.contains('lock-moving')).toBe(true);
    }
  });

  it('al pulsar una acción enciende el halo y lo apaga pasado ACTION_FLASH_MS', async () => {
    vi.useFakeTimers();
    const el = await mount({});
    expect(active(el)).toBe(false);
    click(el);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(ACTION_FLASH_MS - 1);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(1);
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('una acción none no enciende el halo', async () => {
    const el = await mount({ tap_action: { action: 'none' } });
    click(el);
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('sin entidad válida pulsar no enciende el halo (solo la alerta roja)', async () => {
    const el = await mount({}, hassWith('unavailable'));
    click(el);
    await el.updateComplete;
    expect(active(el)).toBe(false);
    expect(card(el).classList.contains('neon-halo-error')).toBe(true);
  });

  it('atascada: halo rojo e icono de alerta', async () => {
    const el = await mount({}, hassWith('jammed'));
    expect(card(el).classList.contains('neon-halo-error')).toBe(true);
    expect(icon(el)).toBe('mdi:lock-alert');
  });

  it('entidad no disponible o inexistente: halo rojo, mdi:close y "No disponible"', async () => {
    const caida = await mount({}, hassWith('unavailable'));
    expect(card(caida).classList.contains('neon-halo-error')).toBe(true);
    expect(icon(caida)).toBe('mdi:close');
    expect(subtitle(caida)).toBe('No disponible');
    const sinEntidad = await mount({ entity: undefined });
    expect(icon(sinEntidad)).toBe('mdi:close');
  });

  it('traduce el estado al idioma de hass', async () => {
    const el = await mount({}, hassWith('locked', 'en'));
    expect(subtitle(el)).toBe('Locked');
  });

  it('subtitle_type: custom usa el texto libre y none lo oculta', async () => {
    const custom = await mount({ subtitle_type: 'custom', subtitle: 'Entrada' });
    expect(subtitle(custom)).toBe('Entrada');
    const none = await mount({ subtitle_type: 'none' });
    expect(none.shadowRoot!.querySelector('.subtitle')).toBeNull();
  });

  it('name de la config gana al friendly_name', async () => {
    const el = await mount({ name: 'Portal' });
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Portal');
  });

  it('un toque despacha hass-action con toggle por defecto y la entidad', async () => {
    const el = await mount({});
    let detail: { config: Record<string, unknown>; action: string } | undefined;
    el.addEventListener('hass-action', (ev) => {
      detail = (ev as CustomEvent).detail;
    });
    card(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(detail?.action).toBe('tap');
    expect(detail?.config.entity).toBe('lock.puerta');
    expect(detail?.config.tap_action).toEqual({ action: 'toggle' });
    expect(detail?.config.hold_action).toEqual({ action: 'more-info' });
  });

  it('getStubConfig elige una lock de hass o un ejemplo', () => {
    const Ctor = customElements.get('neon-lock-card') as unknown as {
      getStubConfig(h?: unknown, e?: string[]): { entity: string };
    };
    expect(Ctor.getStubConfig(hassWith('locked')).entity).toBe('lock.puerta');
    expect(Ctor.getStubConfig(undefined, ['light.a', 'lock.b']).entity).toBe('lock.b');
    expect(Ctor.getStubConfig().entity).toBe('lock.example_lock');
  });
});
