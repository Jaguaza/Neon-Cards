// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTION_PENDING_MS } from './constants';
import { POSE_TOTAL_MS, shacklePath } from './icons/padlock-geometry';
import { active, card, click, errorIcon, hassWith, isOpen, mount, padlock, shackleD, status, subtitle, xIcon } from './neon-lock-card.fixtures';

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
    expect(xIcon(el)).toBeNull();
    expect(status(el)).toBe('Cerrada');
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Puerta');
  });

  it('abierta: halo encendido y con el arco del candado abierto', async () => {
    const el = await mount({}, hassWith('unlocked'));
    expect(active(el)).toBe(true);
    expect(card(el).classList.contains('lock-moving')).toBe(false);
    expect(isOpen(el)).toBe(true);
    expect(status(el)).toBe('Desbloqueada');
  });

  it('los textos de estado en español (sin sensor de puerta): el estado open es «Abriendo puerta…», nunca «Puerta abierta»', async () => {
    const texts: Record<string, string> = {
      locked: 'Cerrada',
      unlocked: 'Desbloqueada',
      open: 'Abriendo puerta…',
      locking: 'Cerrando…',
      unlocking: 'Desbloqueando…',
      opening: 'Abriendo puerta…',
      jammed: 'Atascada',
    };
    for (const [state, text] of Object.entries(texts)) {
      expect(status(await mount({}, hassWith(state))), state).toBe(text);
    }
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
    const cards = [await mount({ lock_icon: 'padlock', confirm_open: false }), await mount({ lock_icon: 'door', confirm_open: false }), await mount({ lock_icon: 'garage_roller', confirm_open: false })];
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
    const el = await mount({ confirm_open: false });
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
    const el = await mount({ confirm_open: false });
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

  it('atascada: halo rojo, la X de error en lugar del icono y estado «Atascada»', async () => {
    const el = await mount({}, hassWith('jammed'));
    expect(card(el).classList.contains('neon-halo-error')).toBe(true);
    expect(xIcon(el)!.getAttribute('icon')).toBe('mdi:close');
    expect(padlock(el)).toBeNull();
    expect(status(el)).toBe('Atascada');
  });

  it('al salir de un error el icono vuelve a su pose sin saltos raros', async () => {
    const el = await mount({}, hassWith('jammed'));
    el.hass = hassWith('unlocked');
    await el.updateComplete;
    expect(xIcon(el)).toBeNull();
    expect(isOpen(el)).toBe(true);
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
    expect(status(caida)).toBe('No disponible');
    const sinEntidad = await mount({ entity: undefined });
    expect(errorIcon(sinEntidad)).toBe('mdi:close');
  });

  it('traduce el estado al idioma de hass', async () => {
    const el = await mount({}, hassWith('locked', 'en'));
    expect(status(el)).toBe('Locked');
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
    const el = await mount({ confirm_open: false });
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
      const el = await mount({ confirm_open: false });
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
    const el = await mount({ confirm_open: false });
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
});
