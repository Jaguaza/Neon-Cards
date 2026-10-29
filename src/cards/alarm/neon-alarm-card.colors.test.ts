// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { statusColorGroup, sensorActiveColor, statusDotColor } from './alarm-state';
import { STATUS_COLOR_GROUPS } from './constants';
import { card, hassWith, mount } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const dot = (el: Card) => el.shadowRoot!.querySelector('.status')!;

describe('grupos de color del punto de estado', () => {
  it('cada estado pertenece a su grupo; las transiciones comparten uno y «sin entidad» va con «no disponible»', () => {
    expect(['disarmed', 'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'triggered', 'unavailable'].map((s) => statusColorGroup(s as never))).toEqual(['disarmed', 'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'triggered', 'unavailable']);
    expect(['pending', 'arming', 'disarming'].map((s) => statusColorGroup(s as never))).toEqual(['transition', 'transition', 'transition']);
    expect(statusColorGroup('error')).toBe('unavailable');
  });

  it('hay nueve grupos: desarmada, cinco modos armados, transición, disparada y no disponible', () => {
    expect(STATUS_COLOR_GROUPS).toEqual(['disarmed', 'armed_home', 'armed_away', 'armed_night', 'armed_vacation', 'armed_custom_bypass', 'transition', 'triggered', 'unavailable']);
  });
});

describe('statusDotColor y sensorActiveColor', () => {
  it('devuelven el color configurado, recortado, solo si es válido', () => {
    expect(statusDotColor({ status_color_armed_away: ' #123456 ' }, 'armed_away')).toBe('#123456');
    expect(statusDotColor({ status_color_transition: 'rgb(1, 2, 3)' }, 'arming')).toBe('rgb(1, 2, 3)');
    expect(statusDotColor({ status_color_unavailable: 'orange' }, 'error')).toBe('orange');
    expect(sensorActiveColor({ sensor_active_color: 'var(--accent-color)' })).toBe('var(--accent-color)');
  });

  it('un color inválido, ausente o que intenta colar otra propiedad se ignora', () => {
    expect(statusDotColor({ status_color_armed_away: 'red; background: url(x)' }, 'armed_away')).toBeUndefined();
    expect(statusDotColor({ status_color_armed_away: 5 as never }, 'armed_away')).toBeUndefined();
    expect(statusDotColor({}, 'armed_away')).toBeUndefined();
    expect(statusDotColor(undefined, 'armed_away')).toBeUndefined();
    expect(sensorActiveColor({ sensor_active_color: 'x}' })).toBeUndefined();
  });

  it('el color de un grupo no afecta a los demás', () => {
    expect(statusDotColor({ status_color_armed_home: '#111111' }, 'armed_away')).toBeUndefined();
  });
});

describe('punto de estado en la tarjeta', () => {
  it('sin configurar no lleva color propio: vale el de la hoja de estilos', async () => {
    const el = await mount({}, hassWith('armed_away'));
    expect(dot(el).getAttribute('style')).toBeNull();
  });

  it('el color configurado de cada estado se aplica al punto', async () => {
    const colors = {
      status_color_disarmed: '#010101',
      status_color_armed_home: '#020202',
      status_color_armed_away: '#030303',
      status_color_armed_night: '#040404',
      status_color_armed_vacation: '#050505',
      status_color_armed_custom_bypass: '#060606',
      status_color_transition: '#070707',
      status_color_triggered: '#080808',
      status_color_unavailable: '#090909',
    };
    const expected: Record<string, string> = {
      disarmed: '#010101',
      armed_home: '#020202',
      armed_away: '#030303',
      armed_night: '#040404',
      armed_vacation: '#050505',
      armed_custom_bypass: '#060606',
      pending: '#070707',
      arming: '#070707',
      disarming: '#070707',
      triggered: '#080808',
      unavailable: '#090909',
    };
    for (const [state, color] of Object.entries(expected)) {
      const el = await mount(colors, hassWith(state));
      expect(dot(el).getAttribute('style'), state).toBe(`--dot-color: ${color}`);
    }
  });

  it('«sin entidad» usa el color de no disponible', async () => {
    const el = await mount({ entity: undefined, status_color_unavailable: '#abcdef' });
    expect(dot(el).getAttribute('style')).toBe('--dot-color: #abcdef');
  });

  it('un color inválido en el YAML no se escribe en el estilo', async () => {
    const el = await mount({ status_color_armed_away: 'red; background: url(x)' }, hassWith('armed_away'));
    expect(dot(el).getAttribute('style')).toBeNull();
  });
});

describe('color de los sensores activos', () => {
  const hass = () => hassWith('armed_home', { extraStates: { 'binary_sensor.m': { state: 'on', attributes: { device_class: 'motion' } } } });

  it('sin configurar la tarjeta no define la variable (vale el ámbar por defecto)', async () => {
    const el = await mount({ footer_sensors: ['motion'] }, hass());
    expect(card(el).getAttribute('style')).not.toContain('--alarm-sensor-active');
  });

  it('configurado, la tarjeta lo pone en una variable que usan el pie y la lista, sin perder las del halo', async () => {
    const el = await mount({ footer_sensors: ['motion'], sensor_active_color: '#ff00aa' }, hass());
    const style = card(el).getAttribute('style')!;
    expect(style).toContain('--alarm-sensor-active: #ff00aa');
    expect(style).toContain('--neon-c1');
  });

  it('un color inválido no llega al estilo', async () => {
    const el = await mount({ footer_sensors: ['motion'], sensor_active_color: 'red; x:y' }, hass());
    expect(card(el).getAttribute('style')).not.toContain('--alarm-sensor-active');
  });
});
