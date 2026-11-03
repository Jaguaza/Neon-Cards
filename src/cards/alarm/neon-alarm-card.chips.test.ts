// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { VIEW_REVEAL_MS } from '../../shared';
import { card, hassWith, mount, view } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const hass = () =>
  hassWith('armed_home', {
    extraStates: {
      'binary_sensor.mov_salon': { state: 'on', attributes: { device_class: 'motion', friendly_name: 'Movimiento salón' } },
      'binary_sensor.mov_cocina': { state: 'on', attributes: { device_class: 'motion', friendly_name: 'Movimiento cocina' } },
      'binary_sensor.puerta': { state: 'off', attributes: { device_class: 'door', friendly_name: 'Puerta' } },
      'binary_sensor.vib': { state: 'on', attributes: { device_class: 'vibration', friendly_name: 'Vibración garaje' } },
      'lock.entrada': { state: 'locked', attributes: { friendly_name: 'Entrada' } },
    },
  });

const chips = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.footer .chip'));
const count = (chip: Element) => chip.querySelector('.chip-count')!.textContent;
const types = ['motion', 'door', 'vibration'];

describe('tarjeta mediana · sensores en fichas', () => {
  it('el pie es una sola línea de fichas, una por tipo y en el orden configurado, y no hay filas', async () => {
    const el = await mount({ size: 'medium', footer_sensors: types }, hass());
    expect(el.shadowRoot!.querySelector('.footer')!.classList.contains('footer--chips')).toBe(true);
    expect(chips(el).map((c) => c.dataset.type)).toEqual(types);
    expect(el.shadowRoot!.querySelectorAll('.footer .item').length).toBe(0);
  });

  it('cada ficha lleva solo el icono y el número de sensores activos de su tipo', async () => {
    const el = await mount({ size: 'medium', footer_sensors: types }, hass());
    expect(chips(el).map(count)).toEqual(['2', '0', '1']);
    for (const chip of chips(el)) {
      expect(chip.querySelector('ha-icon')).not.toBeNull();
      expect(chip.querySelector('.item-label')).toBeNull();
    }
  });

  it('con alguno activo la ficha va en ámbar; en reposo normal; sin sensores del tipo atenuada con «—»', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['motion', 'door', 'smoke'] }, hass());
    const [motion, door, smoke] = chips(el);
    expect(motion.classList.contains('chip--warn')).toBe(true);
    expect(door.classList.contains('chip--warn') || door.classList.contains('chip--muted')).toBe(false);
    expect(smoke.classList.contains('chip--muted')).toBe(true);
    expect(count(smoke)).toBe('—');
  });

  it('el nombre del tipo y el recuento completo van en la etiqueta accesible y en el tooltip', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['motion', 'door'] }, hass());
    expect(chips(el)[0].getAttribute('aria-label')).toBe('Movimiento: 2 activos');
    expect(chips(el)[0].getAttribute('title')).toBe('Movimiento: 2 activos');
    expect(chips(el)[1].getAttribute('aria-label')).toBe('Puertas: 0 En reposo');
  });

  it('el recuento sigue a hass', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['door'] }, hass());
    expect(count(chips(el)[0])).toBe('0');
    const next = hass();
    (next.states['binary_sensor.puerta'] as { state: string }).state = 'on';
    el.hass = next;
    await el.updateComplete;
    expect(count(chips(el)[0])).toBe('1');
  });

  it('pulsar una ficha abre la lista de ese tipo, sin disparar la acción de la tarjeta', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['motion'] }, hass());
    const actions: string[] = [];
    el.addEventListener('hass-action', (ev) => actions.push((ev as CustomEvent).detail.action));
    chips(el)[0].click();
    await new Promise((r) => setTimeout(r, VIEW_REVEAL_MS + 20));
    await el.updateComplete;
    expect(view(el)).not.toBeNull();
    expect(card(el).classList.contains('viewing')).toBe(true);
    const names = Array.from(el.shadowRoot!.querySelectorAll('.sensor-row .sensor-name')).map((n) => n.textContent);
    expect(names).toEqual(['Movimiento cocina', 'Movimiento salón']);
    expect(actions).toEqual([]);
  });

  it('«solo activos» quita las fichas de los tipos en reposo y, si no queda ninguna, el pie entero', async () => {
    const el = await mount({ size: 'medium', footer_sensors: types, footer_only_active: true }, hass());
    expect(chips(el).map((c) => c.dataset.type)).toEqual(['motion', 'vibration']);
    const quiet = await mount({ size: 'medium', footer_sensors: ['door', 'lock'], footer_only_active: true }, hass());
    expect(quiet.shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('los sensores excluidos no cuentan en la ficha', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['motion'], footer_excluded: ['binary_sensor.mov_salon'] }, hass());
    expect(count(chips(el)[0])).toBe('1');
  });

  it('el color de sensores activos de la config llega a las fichas', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['motion'], sensor_active_color: '#ff00aa' }, hass());
    expect(card(el).getAttribute('style')).toContain('--alarm-sensor-active: #ff00aa');
  });

  it('la grande sigue con filas y la compacta sin pie', async () => {
    const large = await mount({ footer_sensors: ['motion'] }, hass());
    expect(large.shadowRoot!.querySelectorAll('.footer .item').length).toBe(1);
    expect(large.shadowRoot!.querySelectorAll('.footer .chip').length).toBe(0);
    const compact = await mount({ size: 'compact', footer_sensors: ['motion'] }, hass());
    expect(compact.shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('la mediana admite como mucho tres tipos: un cuarto configurado por YAML no sale', async () => {
    const el = await mount({ size: 'medium', footer_sensors: ['motion', 'door', 'vibration', 'lock'] }, hass());
    expect(chips(el).map((c) => c.dataset.type)).toEqual(['motion', 'door', 'vibration']);
  });
});
