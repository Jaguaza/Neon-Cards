// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTION_PENDING_MS, CONFIRM_REVEAL_MS, STATUS_DOT_DEFAULTS } from './constants';
import { NEON_LOCK_CARD_STYLES } from './neon-lock-card.styles';
import { active, click, hassWith, mount, status, subtitle } from './neon-lock-card.fixtures';
import type { Card } from './neon-lock-card.fixtures';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('NeonLockCard', () => {
  describe('cabecera: icono, nombre y estado con los tres puntos', () => {
    const dot = (el: Card) => el.shadowRoot!.querySelector('.status')!.getAttribute('data-state');
    const menu = (el: Card) => el.shadowRoot!.querySelector<HTMLButtonElement>('.menu');

    it('el nombre y el subtítulo van al lado del icono, y el estado con los tres puntos a la derecha', async () => {
      const el = await mount({ subtitle_type: 'custom', subtitle: 'Cerradura inteligente' });
      const header = el.shadowRoot!.querySelector('.header')!;
      expect(Array.from(header.children).map((c) => (c.getAttribute('class') ?? '').split(' ')[0])).toEqual(['lock-icon', 'text', 'top-right']);
      expect(header.querySelector('.text .name')!.textContent).toBe('Puerta');
      expect(header.querySelector('.text .subtitle')!.textContent).toBe('Cerradura inteligente');
      expect(Array.from(header.querySelector('.top-right')!.children).map((c) => c.className)).toEqual(['status', 'menu']);
    });

    it('por defecto no hay subtítulo (el estado ya va arriba a la derecha)', async () => {
      const el = await mount({});
      expect(subtitle(el)).toBeUndefined();
      expect(status(el)).toBe('Cerrada');
    });

    it('subtitle_type: state sigue repitiendo el estado bajo el nombre', async () => {
      expect(subtitle(await mount({ subtitle_type: 'state' }))).toBe('Cerrada');
    });

    it('el punto de estado: cerrada verde, desbloqueada/abriéndose ámbar, avería roja (por data-state)', async () => {
      for (const [state, expected] of [['locked', 'locked'], ['locking', 'locking'], ['unlocked', 'unlocked'], ['open', 'opening'], ['unlocking', 'unlocking'], ['jammed', 'jammed'], ['unavailable', 'error']] as const) {
        expect(dot(await mount({}, hassWith(state))), state).toBe(expected);
      }
    });

    it('los tres puntos abren «más información» de la entidad y NO disparan la acción de la tarjeta ni su confirmación', async () => {
      const el = await mount({});
      const events: { action: string; config: { entity?: string; tap_action?: { action: string } } }[] = [];
      el.addEventListener('hass-action', (ev) => events.push((ev as CustomEvent).detail));
      menu(el)!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
      menu(el)!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
      menu(el)!.click();
      await el.updateComplete;
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('tap');
      expect(events[0].config.entity).toBe('lock.puerta');
      expect(events[0].config.tap_action).toEqual({ action: 'more-info' });
      expect(el.shadowRoot!.querySelector('.confirm')).toBeNull();
      expect(active(el)).toBe(false);
    });

    it('el botón tiene etiqueta accesible y no aparece si la entidad no existe', async () => {
      const el = await mount({});
      expect(menu(el)!.getAttribute('aria-label')).toBe('Más información');
      expect(menu(await mount({}, hassWith('unavailable')))).toBeNull();
      expect(menu(await mount({ entity: 'lock.nada' }))).toBeNull();
      expect(status(await mount({ entity: 'lock.nada' }))).toBe('No disponible');
    });

    it('la cabecera ocupa media rejilla', async () => {
      const el = await mount({});
      expect(el.getGridOptions()).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
    });
  });

  describe('color del punto de estado', () => {
    const dotStyle = (el: Card) => el.shadowRoot!.querySelector('.status')!.getAttribute('style');
    const colors = { status_color_closed: '#ff00ff', status_color_open: '#00aaff', status_color_alert: '#112233' };

    it('sin colores en la config no hay estilo en línea: manda la hoja de estilos', async () => {
      expect(dotStyle(await mount({}))).toBeNull();
    });

    it('cada grupo de estados usa su color', async () => {
      for (const [state, expected] of [
        ['locked', '#ff00ff'],
        ['locking', '#ff00ff'],
        ['unlocked', '#00aaff'],
        ['unlocking', '#00aaff'],
        ['open', '#00aaff'],
        ['opening', '#00aaff'],
        ['jammed', '#112233'],
        ['unavailable', '#112233'],
      ] as const) {
        expect(dotStyle(await mount(colors, hassWith(state))), state).toBe(`--dot-color: ${expected}`);
      }
    });

    it('un color puesto solo en un grupo no afecta a los demás', async () => {
      const only = { status_color_open: '#00aaff' };
      expect(dotStyle(await mount(only, hassWith('locked')))).toBeNull();
      expect(dotStyle(await mount(only, hassWith('unlocked')))).toBe('--dot-color: #00aaff');
    });

    it('acepta rgb(), hsl(), nombres y var(--x)', async () => {
      for (const color of ['rgb(1, 2, 3)', 'hsl(120 50% 50%)', 'orange', 'var(--primary-color)']) {
        expect(dotStyle(await mount({ status_color_closed: color })), color).toBe(`--dot-color: ${color}`);
      }
    });

    it('un valor inválido o malicioso se ignora y no llega al estilo', async () => {
      for (const bad of ['red; background: url(https://x.test/a.png)', 'red}', 'expression(1)', '<b>', 5]) {
        expect(dotStyle(await mount({ status_color_closed: bad as never })), String(bad)).toBeNull();
      }
    });

    it('se actualiza al cambiar la config', async () => {
      const el = await mount({ status_color_closed: '#ff00ff' });
      expect(dotStyle(el)).toBe('--dot-color: #ff00ff');
      el.setConfig({ entity: 'lock.puerta' });
      await el.updateComplete;
      expect(dotStyle(el)).toBeNull();
    });

    it('los colores por defecto de la hoja de estilos coinciden con STATUS_DOT_DEFAULTS (lo que muestra el editor)', () => {
      const css = NEON_LOCK_CARD_STYLES.cssText;
      expect(css).toContain(`--dot-color: ${STATUS_DOT_DEFAULTS.closed};`);
      expect(css).toContain(`--dot-color: ${STATUS_DOT_DEFAULTS.open};`);
      expect(css).toContain(`--dot-color: ${STATUS_DOT_DEFAULTS.alert};`);
    });
  });
});

describe('rótulo de estado, sensor de puerta y «Abriendo puerta…»', () => {
  const DOOR = 'binary_sensor.puerta';
  const OPEN = { supported_features: 1 };

  /** Cerradura `lock.puerta` más, si se indica, el sensor `binary_sensor.puerta`. */
  function hassWithDoor(lockState: string, doorState: string | undefined, attributes: Record<string, unknown> = {}, calls: unknown[][] = []) {
    const hass = hassWith(lockState, 'es', attributes, calls);
    if (doorState !== undefined) {
      (hass.states as Record<string, unknown>)[DOOR] = { entity_id: DOOR, state: doorState, last_changed: '', last_updated: '', attributes: {} };
    }
    return hass;
  }
  const dot = (el: Card) => el.shadowRoot!.querySelector('.status')!.getAttribute('data-state');

  it('sin sensor de puerta «Puerta abierta» no sale con ningún estado', async () => {
    for (const state of ['locked', 'unlocked', 'locking', 'unlocking', 'jammed', 'open', 'opening']) {
      expect(status(await mount({}, hassWith(state))), state).not.toBe('Puerta abierta');
    }
  });

  it('con el sensor de puerta activo sale «Puerta abierta» si la cerradura no está cerrada con llave', async () => {
    for (const state of ['unlocked', 'unlocking', 'open', 'opening']) {
      const el = await mount({ door_entity: DOOR }, hassWithDoor(state, 'on'));
      expect(status(el), state).toBe('Puerta abierta');
      expect(dot(el), state).toBe('open');
    }
  });

  it('el sensor activo no cambia el rótulo de cerrada, cerrando ni atascada', async () => {
    const texts: Record<string, string> = { locked: 'Cerrada', locking: 'Cerrando…', jammed: 'Atascada' };
    for (const [state, text] of Object.entries(texts)) {
      expect(status(await mount({ door_entity: DOOR }, hassWithDoor(state, 'on'))), state).toBe(text);
    }
  });

  it('con el sensor de puerta inactivo, open es «Abriendo puerta…» y desbloqueada sigue siendo «Desbloqueada»', async () => {
    expect(status(await mount({ door_entity: DOOR }, hassWithDoor('open', 'off')))).toBe('Abriendo puerta…');
    expect(status(await mount({ door_entity: DOOR }, hassWithDoor('opening', 'off')))).toBe('Abriendo puerta…');
    expect(status(await mount({ door_entity: DOOR }, hassWithDoor('unlocked', 'off')))).toBe('Desbloqueada');
  });

  it('un sensor configurado que no existe o no da dato (unavailable, unknown) cuenta como sin sensor', async () => {
    for (const door of [undefined, 'unavailable', 'unknown']) {
      for (const state of ['open', 'unlocked']) {
        const el = await mount({ door_entity: DOOR }, hassWithDoor(state, door));
        expect(status(el), `${state} / ${String(door)}`).toBe(state === 'open' ? 'Abriendo puerta…' : 'Desbloqueada');
      }
    }
  });

  it('el sensor de puerta se tiene en cuenta aunque el pie no lo muestre', async () => {
    const el = await mount({ door_entity: DOOR, footer_items: ['battery'] }, hassWithDoor('unlocked', 'on'));
    expect(status(el)).toBe('Puerta abierta');
  });

  it('cuando el sensor cambia, el rótulo cambia en el acto', async () => {
    const el = await mount({ door_entity: DOOR }, hassWithDoor('unlocked', 'off'));
    expect(status(el)).toBe('Desbloqueada');
    el.hass = hassWithDoor('unlocked', 'on');
    await el.updateComplete;
    expect(status(el)).toBe('Puerta abierta');
    el.hass = hassWithDoor('unlocked', 'off');
    await el.updateComplete;
    expect(status(el)).toBe('Desbloqueada');
  });

  it('subtitle_type: state repite el rótulo mostrado', async () => {
    const el = await mount({ door_entity: DOOR, subtitle_type: 'state' }, hassWithDoor('unlocked', 'on'));
    expect(subtitle(el)).toBe('Puerta abierta');
    expect(subtitle(await mount({ subtitle_type: 'state' }, hassWithDoor('open', undefined)))).toBe('Abriendo puerta…');
  });

  it('en inglés: «Door open» y «Opening door…»', async () => {
    const door = await mount({ door_entity: DOOR }, { ...hassWithDoor('unlocked', 'on'), locale: { language: 'en' } });
    expect(status(door)).toBe('Door open');
    const opening = await mount({}, hassWith('open', 'en'));
    expect(status(opening)).toBe('Opening door…');
  });

  describe('al pulsar «Abrir»', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    const ask = async (el: Card) => {
      click(el);
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS);
      await el.updateComplete;
    };
    const choose = (el: Card, command: string) => el.shadowRoot!.querySelector<HTMLButtonElement>(`.confirm .accept[data-command="${command}"]`)!.click();

    it('el rótulo dice «Abriendo puerta…» desde ya, aunque la entidad aún no haya cambiado', async () => {
      for (const state of ['locked', 'unlocked']) {
        const el = await mount({}, hassWith(state, 'es', OPEN));
        await ask(el);
        choose(el, 'open');
        await el.updateComplete;
        expect(status(el), state).toBe('Abriendo puerta…');
        expect(dot(el), state).toBe('opening');
      }
    });

    it('cuando la entidad cambia manda su estado: open sin sensor sigue «Abriendo puerta…» y con el sensor activo pasa a «Puerta abierta»', async () => {
      const el = await mount({ door_entity: DOOR }, hassWithDoor('locked', 'off', OPEN));
      await ask(el);
      choose(el, 'open');
      await el.updateComplete;
      el.hass = hassWithDoor('open', 'off', OPEN);
      await el.updateComplete;
      expect(status(el)).toBe('Abriendo puerta…');
      el.hass = hassWithDoor('open', 'on', OPEN);
      await el.updateComplete;
      expect(status(el)).toBe('Puerta abierta');
    });

    it('si la entidad no cambia, pasado ACTION_PENDING_MS el rótulo vuelve al estado real', async () => {
      const el = await mount({}, hassWith('locked', 'es', OPEN));
      await ask(el);
      choose(el, 'open');
      await el.updateComplete;
      vi.advanceTimersByTime(ACTION_PENDING_MS + 1);
      await el.updateComplete;
      expect(status(el)).toBe('Cerrada');
    });

    it('Desbloquear o Bloquear no dicen «Abriendo puerta…»', async () => {
      for (const [state, command, expected] of [['locked', 'unlock', 'Cerrada'], ['unlocked', 'lock', 'Desbloqueada']] as const) {
        const el = await mount({}, hassWith(state, 'es', OPEN));
        await ask(el);
        choose(el, command);
        await el.updateComplete;
        expect(status(el), command).toBe(expected);
      }
    });

    it('sin soporte de abrir, el «Abrir» de la pregunta simple también dice «Abriendo puerta…»', async () => {
      const el = await mount({}, hassWith('locked', 'es', { supported_features: 0 }));
      await ask(el);
      el.shadowRoot!.querySelector<HTMLButtonElement>('.confirm .accept')!.click();
      await el.updateComplete;
      expect(status(el)).toBe('Abriendo puerta…');
    });

    it('cerrar una cerradura desbloqueada no dice «Abriendo puerta…»', async () => {
      const el = await mount({}, hassWith('unlocked', 'es', { supported_features: 0 }));
      click(el);
      await el.updateComplete;
      expect(status(el)).toBe('Desbloqueada');
    });
  });

  describe('entidad no disponible', () => {
    it('reserva el hueco de los tres puntos para que el estado quede donde en una tarjeta operativa', async () => {
      const broken = await mount({}, hassWith('unavailable'));
      expect(broken.shadowRoot!.querySelector('.top-right .menu-spacer')).not.toBeNull();
      expect(broken.shadowRoot!.querySelector('.top-right .menu')).toBeNull();
      expect(status(broken)).toBe('No disponible');
      const ok = await mount({});
      expect(ok.shadowRoot!.querySelector('.top-right .menu')).not.toBeNull();
      expect(ok.shadowRoot!.querySelector('.top-right .menu-spacer')).toBeNull();
    });
  });
});
