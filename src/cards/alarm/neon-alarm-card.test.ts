// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { active, card, hassWith, mount, shield, status, statusState, subtitle } from './neon-alarm-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('NeonAlarmCard · estados', () => {
  it('desarmada: sin halo, escudo vacío y estado traducido', async () => {
    const el = await mount({});
    expect(active(el)).toBe(false);
    expect(card(el).classList.contains('neon-halo-error')).toBe(false);
    expect(shield(el)).not.toBeNull();
    expect(shield(el)!.classList.contains('is-filled')).toBe(false);
    expect(status(el)).toBe('Desarmada');
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Alarma casa');
  });

  it('los textos de estado en español', async () => {
    const texts: Record<string, string> = {
      disarmed: 'Desarmada',
      armed_home: 'Armada en casa',
      armed_away: 'Armada fuera',
      armed_night: 'Armada noche',
      armed_vacation: 'Armada vacaciones',
      armed_custom_bypass: 'Armada personalizada',
      pending: 'Pendiente…',
      arming: 'Armando…',
      disarming: 'Desarmando…',
      triggered: 'Disparada',
      unavailable: 'No disponible',
    };
    for (const [state, text] of Object.entries(texts)) {
      const el = await mount({}, hassWith(state));
      expect(status(el), state).toBe(text);
      expect(statusState(el), state).toBe(state);
    }
  });

  it('los textos de estado en inglés', async () => {
    expect(status(await mount({}, hassWith('armed_away', { language: 'en' })))).toBe('Armed away');
    expect(status(await mount({}, hassWith('triggered', { language: 'en' })))).toBe('Triggered');
  });

  it('armada: halo encendido y escudo relleno con su dibujo', async () => {
    const el = await mount({}, hassWith('armed_night'));
    expect(active(el)).toBe(true);
    expect(shield(el)!.classList.contains('is-filled')).toBe(true);
    expect(shield(el)!.getAttribute('data-state')).toBe('armed_night');
    expect(el.shadowRoot!.querySelector('.glyph')).not.toBeNull();
  });

  it('cada estado tiene su propio dibujo en el escudo', async () => {
    const shapes = new Set<string>();
    for (const state of ['disarmed', 'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'pending', 'arming', 'disarming', 'triggered']) {
      const el = await mount({}, hassWith(state));
      shapes.add(el.shadowRoot!.querySelector('svg.alarm-icon')!.innerHTML.replace(/<!--.*?-->/g, ''));
    }
    expect(shapes.size).toBe(10);
  });

  it('en transición y disparada: halo encendido y clase de pulso', async () => {
    for (const state of ['pending', 'arming', 'disarming', 'triggered']) {
      const el = await mount({}, hassWith(state));
      expect(active(el), state).toBe(true);
      expect(card(el).classList.contains('alarm-moving'), state).toBe(true);
    }
    expect(card(await mount({}, hassWith('armed_home'))).classList.contains('alarm-moving')).toBe(false);
  });

  it('disparada, no disponible y sin entidad llevan el halo rojo de alerta', async () => {
    for (const state of ['triggered', 'unavailable']) {
      expect(card(await mount({}, hassWith(state))).classList.contains('neon-halo-error'), state).toBe(true);
    }
    const el = await mount({ entity: undefined });
    expect(card(el).classList.contains('neon-halo-error')).toBe(true);
    expect(status(el)).toBe('No disponible');
  });

  it('disparada: el aro y el halo se vuelven rojos aunque la paleta sea otra; en el resto manda la paleta', async () => {
    const triggered = await mount({ neon_palette: 'electric' }, hassWith('triggered'));
    expect(card(triggered).getAttribute('style')).toContain('--neon-c1: #ff3b3b');
    const armed = await mount({ neon_palette: 'electric' }, hassWith('armed_home'));
    expect(card(armed).getAttribute('style')).not.toContain('#ff3b3b');
  });

  it('un estado desconocido (unknown) se muestra como no disponible', async () => {
    const el = await mount({}, hassWith('unknown'));
    expect(status(el)).toBe('No disponible');
    expect(statusState(el)).toBe('error');
  });

  it('sin hass todavía la tarjeta se pinta neutra, sin estado', async () => {
    const el = await mount({}, null);
    expect(status(el)).toBeUndefined();
    expect(shield(el)).not.toBeNull();
  });
});

describe('NeonAlarmCard · cabecera', () => {
  it('el nombre de la config manda sobre el de la entidad', async () => {
    const el = await mount({ name: 'Mi alarma' });
    expect(el.shadowRoot!.querySelector('.name')!.textContent).toBe('Mi alarma');
  });

  it('subtítulo: ninguno por defecto, estado traducido y texto libre', async () => {
    expect(subtitle(await mount({}, hassWith('armed_home')))).toBeUndefined();
    expect(subtitle(await mount({ subtitle_type: 'state' }, hassWith('armed_home')))).toBe('Armada en casa');
    expect(subtitle(await mount({ subtitle_type: 'custom', subtitle: 'Planta baja' }))).toBe('Planta baja');
  });

  it('mediana y compacta no llevan subtítulo', async () => {
    for (const size of ['medium', 'compact']) {
      expect(subtitle(await mount({ size, subtitle_type: 'custom', subtitle: 'x' })), size).toBeUndefined();
    }
  });

  it('los tres puntos abren más información sin disparar la acción de la tarjeta', async () => {
    const el = await mount({}, hassWith('armed_home'));
    const actions: Array<{ action: string; tap: string }> = [];
    el.addEventListener('hass-action', (ev) => actions.push({ action: (ev as CustomEvent).detail.action, tap: (ev as CustomEvent).detail.config.tap_action.action }));
    el.shadowRoot!.querySelector<HTMLButtonElement>('.menu')!.click();
    expect(actions).toEqual([{ action: 'tap', tap: 'more-info' }]);
    expect(el.shadowRoot!.querySelector('.view')).toBeNull();
  });
});

describe('NeonAlarmCard · API de tarjeta', () => {
  it('getStubConfig elige una alarma de la lista o de hass', async () => {
    const el = await mount({});
    const ctor = el.constructor as unknown as { getStubConfig(h?: unknown, e?: string[]): { entity: string; tap_action: { action: string } } };
    expect(ctor.getStubConfig(undefined, ['light.x', 'alarm_control_panel.garaje']).entity).toBe('alarm_control_panel.garaje');
    expect(ctor.getStubConfig(hassWith('disarmed')).entity).toBe('alarm_control_panel.casa');
    expect(ctor.getStubConfig().entity).toBe('alarm_control_panel.example_alarm');
    expect(ctor.getStubConfig().tap_action.action).toBe('toggle');
  });

  it('el editor se registra como neon-alarm-card-editor y la tarjeta como custom card', async () => {
    const el = await mount({});
    expect((el.constructor as unknown as { getConfigElement(): HTMLElement }).getConfigElement().tagName.toLowerCase()).toBe('neon-alarm-card-editor');
    const cards = (window as unknown as { customCards: Array<{ type: string }> }).customCards;
    expect(cards.some((c) => c.type === 'neon-alarm-card')).toBe(true);
  });
});
