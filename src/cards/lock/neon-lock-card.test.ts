// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTION_PENDING_MS } from './constants';
import { POSE_TOTAL_MS, shacklePath } from './icons/padlock-geometry';
import { DOOR_DURATION_MS, doorLeafPath } from './icons/door';
import { GARAGE_ROLLER_DURATION_MS, rollerGeometry, slatsPath } from './icons/garage-roller';
import { GARAGE_SLIDING_DURATION_MS, panelPath, slidingGeometry } from './icons/garage-sliding';

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
const padlock = (el: Card) => el.shadowRoot!.querySelector('svg.lock-icon');
const isOpen = (el: Card) => !!padlock(el)?.classList.contains('is-open');
const errorIcon = (el: Card) => el.shadowRoot!.querySelector('ha-icon')?.getAttribute('icon');
const subtitle = (el: Card) => el.shadowRoot!.querySelector('.subtitle')?.textContent?.trim();

const shackleD = (el: Card) => el.shadowRoot!.querySelector('path.shackle')!.getAttribute('d');
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
    expect(padlock(el)).not.toBeNull();
    expect(isOpen(el)).toBe(false);
    expect(el.shadowRoot!.querySelector('ha-icon')).toBeNull();
    expect(subtitle(el)).toBe('Cerrada');
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Puerta');
  });

  it('abierta: halo encendido y con el arco del candado abierto', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(active(el)).toBe(true);
    expect(card(el).classList.contains('lock-moving')).toBe(false);
    expect(isOpen(el)).toBe(true);
    expect(subtitle(el)).toBe('Abierta');
  });

  it('en movimiento (cerrando, abriendo): halo encendido y clase de pulso', async () => {
    for (const state of ['locking', 'unlocking', 'opening']) {
      const el = await mount({}, hassWith(state));
      expect(active(el)).toBe(true);
      expect(card(el).classList.contains('lock-moving')).toBe(true);
    }
  });

  it('el halo sigue al estado: encendido si está abierta o moviéndose, apagado si está cerrada o atascada', async () => {
    for (const [state, halo] of [['locked', false], ['unlocked', true], ['open', true], ['unlocking', true], ['opening', true], ['locking', true], ['jammed', false]] as const) {
      const el = await mount({}, hassWith(state));
      expect(active(el), state).toBe(halo);
    }
  });

  it('el halo permanece encendido mientras está abierta y se apaga solo al llegar a cerrada', async () => {
    vi.useFakeTimers();
    const el = await mount({}, hassWith('unlocked'));
    vi.advanceTimersByTime(60_000); // por mucho que pase el tiempo, sigue encendido
    await el.updateComplete;
    expect(active(el)).toBe(true);
    el.hass = hassWith('locking');
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(60_000);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    el.hass = hassWith('locked');
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('todas las tarjetas de la misma entidad muestran el halo a la vez, la pulse quien la pulse', async () => {
    const cards = [await mount({ lock_icon: 'padlock' }), await mount({ lock_icon: 'door' }), await mount({ lock_icon: 'garage_roller' })];
    click(cards[0]);
    for (const el of cards) {
      el.hass = hassWith('unlocked'); // salta de locked a unlocked sin estado intermedio
      await el.updateComplete;
    }
    expect(cards.map(active)).toEqual([true, true, true]);
    for (const el of cards) {
      el.hass = hassWith('locked');
      await el.updateComplete;
    }
    expect(cards.map(active)).toEqual([false, false, false]);
  });

  it('al pulsar para operar la cerradura el halo se enciende ya y espera el cambio de estado, sin hueco ni rebote', async () => {
    vi.useFakeTimers();
    const el = await mount({});
    click(el);
    // La cerradura tarda 2,1 s en cambiar de estado: nunca hay un instante apagado.
    for (let ms = 0; ms < 2100; ms += 100) {
      await el.updateComplete;
      expect(active(el)).toBe(true);
      vi.advanceTimersByTime(100);
    }
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    expect(active(el)).toBe(true); // ahora lo mantiene el estado
    vi.advanceTimersByTime(ACTION_PENDING_MS * 2);
    await el.updateComplete;
    expect(active(el)).toBe(true);
  });

  it('al cerrar una cerradura abierta el halo sigue hasta `locked` y se apaga en ese momento, sin esperas', async () => {
    vi.useFakeTimers();
    const el = await mount({}, hassWith('unlocked'));
    click(el);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(2100);
    el.hass = hassWith('locking');
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(2100);
    el.hass = hassWith('locked');
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('si tras pulsar el estado no cambia, el halo se apaga al agotarse ACTION_PENDING_MS', async () => {
    vi.useFakeTimers();
    const el = await mount({});
    click(el);
    vi.advanceTimersByTime(ACTION_PENDING_MS - 1);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(1);
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('una acción que no opera la cerradura (más info) no enciende el halo', async () => {
    const el = await mount({ tap_action: { action: 'more-info' } });
    click(el);
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

  it('atascada: halo rojo y candado cerrado', async () => {
    const el = await mount({}, hassWith('jammed'));
    expect(card(el).classList.contains('neon-halo-error')).toBe(true);
    expect(isOpen(el)).toBe(false);
  });

  it('la pose del arco anticipa el destino: unlocking/opening abiertos, locking cerrado', async () => {
    expect(isOpen(await mount({}, hassWith('unlocking')))).toBe(true);
    expect(isOpen(await mount({}, hassWith('opening')))).toBe(true);
    expect(isOpen(await mount({}, hassWith('locking')))).toBe(false);
  });

  it('al cambiar de estado reutiliza el mismo SVG para que el navegador anime el arco', async () => {
    const el = await mount({});
    const before = padlock(el);
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    expect(padlock(el)).toBe(before);
    expect(isOpen(el)).toBe(true);
    el.hass = hassWith('locked');
    await el.updateComplete;
    expect(padlock(el)).toBe(before);
    expect(isOpen(el)).toBe(false);
  });

  it('entidad no disponible o inexistente: halo rojo, mdi:close (sin candado) y "No disponible"', async () => {
    const caida = await mount({}, hassWith('unavailable'));
    expect(card(caida).classList.contains('neon-halo-error')).toBe(true);
    expect(errorIcon(caida)).toBe('mdi:close');
    expect(padlock(caida)).toBeNull();
    expect(subtitle(caida)).toBe('No disponible');
    const sinEntidad = await mount({ entity: undefined });
    expect(errorIcon(sinEntidad)).toBe('mdi:close');
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

  it('el arco se pinta cerrado, se mueve hasta abierto y vuelve a cerrado', async () => {
    vi.useFakeTimers();
    const el = await mount({});
    expect(shackleD(el)).toBe(shacklePath(0));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(POSE_TOTAL_MS / 2);
    expect(shackleD(el)).not.toBe(shacklePath(0));
    expect(shackleD(el)).not.toBe(shacklePath(1));
    vi.advanceTimersByTime(POSE_TOTAL_MS);
    expect(shackleD(el)).toBe(shacklePath(1));
    el.hass = hassWith('locked');
    await el.updateComplete;
    vi.advanceTimersByTime(POSE_TOTAL_MS * 2);
    expect(shackleD(el)).toBe(shacklePath(0));
  });

  it('arrancar ya abierta pinta el arco abierto sin animar', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(shackleD(el)).toBe(shacklePath(1));
  });

  it('abrir-cerrar-abrir en ráfaga termina en la pose correcta', async () => {
    vi.useFakeTimers();
    const el = await mount({});
    for (const state of ['unlocked', 'locked', 'unlocked', 'locked', 'unlocked']) {
      el.hass = hassWith(state);
      await el.updateComplete;
      vi.advanceTimersByTime(90);
    }
    vi.advanceTimersByTime(POSE_TOTAL_MS * 2);
    expect(shackleD(el)).toBe(shacklePath(1));
    expect(isOpen(el)).toBe(true);
  });

  it('una espera cuyo temporizador no llegó a dispararse se da por vencida con la siguiente actualización de hass', async () => {
    let now = 1000;
    const spy = vi.spyOn(performance, 'now').mockImplementation(() => now);
    try {
      const el = await mount({});
      click(el);
      await el.updateComplete;
      expect(active(el)).toBe(true);
      now += ACTION_PENDING_MS + 1; // pasa el tiempo, pero el temporizador real no se dispara
      el.hass = hassWith('locked'); // llega una actualización de HA sin cambio de estado
      await el.updateComplete;
      expect(active(el)).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });

  it('el halo sigue al estado también tras cambiar de entidad en la config o volver de error', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(active(el)).toBe(true);
    el.hass = hassWith('unavailable');
    await el.updateComplete;
    expect(active(el)).toBe(false);
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    expect(active(el)).toBe(true);
    el.setConfig({ entity: 'lock.otra' });
    el.hass = { ...hassWith('locked'), states: { 'lock.otra': { entity_id: 'lock.otra', state: 'locked', last_changed: '', last_updated: '', attributes: {} } } };
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('desconectar y reconectar a mitad de la espera la retoma y la termina a su hora', async () => {
    vi.useFakeTimers();
    const el = await mount({});
    click(el);
    await el.updateComplete;
    vi.advanceTimersByTime(500);
    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(active(el)).toBe(true);
    vi.advanceTimersByTime(ACTION_PENDING_MS - 500);
    await el.updateComplete;
    expect(active(el)).toBe(false);
  });

  it('lock_icon por defecto o inválido es el candado', async () => {
    const def = await mount({});
    expect(def.shadowRoot!.querySelector('.shackle')).not.toBeNull();
    const bad = await mount({ lock_icon: 'puerta-rara' });
    expect(bad.shadowRoot!.querySelector('.shackle')).not.toBeNull();
  });

  it('lock_icon: door dibuja la puerta y la abre con su propia duración', async () => {
    vi.useFakeTimers();
    const el = await mount({ lock_icon: 'door' });
    const leaf = () => el.shadowRoot!.querySelector('.leaf')!.getAttribute('d');
    expect(el.shadowRoot!.querySelector('.shackle')).toBeNull();
    expect(leaf()).toBe(doorLeafPath(0));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(DOOR_DURATION_MS / 2);
    expect(leaf()).not.toBe(doorLeafPath(0));
    expect(leaf()).not.toBe(doorLeafPath(1));
    vi.advanceTimersByTime(DOOR_DURATION_MS);
    expect(leaf()).toBe(doorLeafPath(1));
  });

  it('lock_icon: garage_roller enrolla la puerta', async () => {
    vi.useFakeTimers();
    const el = await mount({ lock_icon: 'garage_roller' });
    const slats = () => el.shadowRoot!.querySelector('.slats')!.getAttribute('d');
    expect(slats()).toBe(slatsPath(rollerGeometry(0).slats));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(GARAGE_ROLLER_DURATION_MS + 50);
    expect(slats()).toBe(slatsPath(rollerGeometry(1).slats));
  });

  it('lock_icon: garage_sliding desliza el panel', async () => {
    vi.useFakeTimers();
    const el = await mount({ lock_icon: 'garage_sliding' });
    const panel = () => el.shadowRoot!.querySelector('.panel')!.getAttribute('d');
    expect(panel()).toBe(panelPath(slidingGeometry(0)));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    vi.advanceTimersByTime(GARAGE_SLIDING_DURATION_MS + 50);
    expect(panel()).toBe(panelPath(slidingGeometry(1)));
  });

  it('cambiar de icono desde la config coloca el nuevo en la pose actual sin animar', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(el.shadowRoot!.querySelector('.shackle')).not.toBeNull();
    el.setConfig({ entity: 'lock.puerta', lock_icon: 'door' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.shackle')).toBeNull();
    expect(el.shadowRoot!.querySelector('.leaf')!.getAttribute('d')).toBe(doorLeafPath(1));
  });

  it('con cualquier icono, entidad no disponible muestra mdi:close y no el dibujo', async () => {
    for (const lock_icon of ['door', 'garage_roller', 'garage_sliding']) {
      const el = await mount({ lock_icon }, hassWith('unavailable'));
      expect(el.shadowRoot!.querySelector('svg.lock-icon')).toBeNull();
      expect(el.shadowRoot!.querySelector('ha-icon')?.getAttribute('icon')).toBe('mdi:close');
    }
  });

  it('abrir-cerrar-abrir en ráfaga termina en la pose correcta con cada icono', async () => {
    for (const lock_icon of ['door', 'garage_roller', 'garage_sliding']) {
      vi.useFakeTimers();
      const el = await mount({ lock_icon });
      const fresh = await mount({ lock_icon }, hassWith('unlocked'));
      for (const state of ['unlocked', 'locked', 'unlocked', 'locked', 'unlocked']) {
        el.hass = hassWith(state);
        await el.updateComplete;
        vi.advanceTimersByTime(90);
      }
      vi.advanceTimersByTime(3000);
      expect(el.shadowRoot!.querySelector('svg.lock-icon')!.innerHTML).toBe(fresh.shadowRoot!.querySelector('svg.lock-icon')!.innerHTML);
      vi.useRealTimers();
    }
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
