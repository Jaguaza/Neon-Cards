// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { card, hassWith, mount, view } from './neon-alarm-card.fixtures';
import type { Card } from './neon-alarm-card.fixtures';
import { VIEW_REVEAL_MS } from './constants';

afterEach(() => {
  document.body.innerHTML = '';
});

const hass = () =>
  hassWith('armed_home', {
    extraStates: {
      'binary_sensor.mov_salon': { state: 'on', attributes: { device_class: 'motion', friendly_name: 'Movimiento salón' } },
      'binary_sensor.mov_cocina': { state: 'off', attributes: { device_class: 'motion', friendly_name: 'Movimiento cocina' } },
      'binary_sensor.puerta': { state: 'off', attributes: { device_class: 'door', friendly_name: 'Puerta' } },
      'lock.entrada': { state: 'unlocked', attributes: { friendly_name: 'Entrada' } },
    },
  });

const items = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.footer .item'));
const text = (item: Element) => item.querySelector('.item-value')!.textContent!.trim();
const word = (item: Element) => item.querySelector('.word')?.textContent?.trim();
const count = (item: Element) => item.querySelector('.count')!.textContent;

describe('pie con sensores', () => {
  it('sin footer_sensors no hay pie', async () => {
    expect((await mount({}, hass())).shadowRoot!.querySelector('.footer')).toBeNull();
  });

  it('un dato por tipo, en el orden configurado, con su nombre traducido', async () => {
    const el = await mount({ footer_sensors: ['motion', 'door', 'lock'] }, hass());
    expect(items(el).map((i) => i.dataset.type)).toEqual(['motion', 'door', 'lock']);
    expect(items(el).map((i) => i.querySelector('.item-label')!.textContent)).toEqual(['Movimiento', 'Puertas', 'Cerraduras']);
  });

  it('cuenta los sensores activos de cada tipo: ámbar con alguno activo, en reposo si ninguno', async () => {
    const el = await mount({ footer_sensors: ['motion', 'door'] }, hass());
    const [motion, door] = items(el);
    expect(text(motion)).toBe('1 activo');
    expect(motion.classList.contains('item--warn')).toBe(true);
    expect([count(door), word(door)]).toEqual(['0', 'En reposo']);
    expect(door.querySelector('.item-value')!.classList.contains('is-idle')).toBe(true);
    expect(door.classList.contains('item--warn')).toBe(false);
  });

  it('un tipo sin sensores muestra una raya y va atenuado; un tipo desconocido usa su nombre', async () => {
    const el = await mount({ footer_sensors: ['vibration', 'inventado'] }, hass());
    const [vibration, other] = items(el);
    expect(text(vibration)).toBe('—');
    expect(word(vibration)).toBeUndefined();
    expect(vibration.classList.contains('item--muted')).toBe(true);
    expect(other.querySelector('.item-label')!.textContent).toBe('inventado');
  });

  it('el recuento sigue a hass: al activarse otro sensor sube', async () => {
    const el = await mount({ footer_sensors: ['motion'] }, hass());
    const next = hass();
    (next.states['binary_sensor.mov_cocina'] as { state: string }).state = 'on';
    el.hass = next;
    await el.updateComplete;
    expect(text(items(el)[0])).toBe('2 activos');
  });

  it('con un solo sensor activo el texto va en singular; con varios, en plural', async () => {
    const el = await mount({ footer_sensors: ['motion', 'door'] }, hass());
    expect(word(items(el)[0])).toBe('activo');
    const next = hass();
    (next.states['binary_sensor.puerta'] as { state: string }).state = 'on';
    (next.states['binary_sensor.mov_cocina'] as { state: string }).state = 'on';
    el.hass = next;
    await el.updateComplete;
    expect(items(el).map((i) => word(i))).toEqual(['activos', 'activo']);
  });
});

describe('lista al pulsar el dato', () => {
  const open = async (el: Card) => {
    items(el)[0].click();
    await new Promise((r) => setTimeout(r, VIEW_REVEAL_MS + 20));
    await el.updateComplete;
  };

  it('abre la lista de ese tipo con los activos primero, sin disparar la acción de la tarjeta', async () => {
    const el = await mount({ footer_sensors: ['motion'] }, hass());
    const actions: string[] = [];
    el.addEventListener('hass-action', (ev) => actions.push((ev as CustomEvent).detail.action));
    await open(el);
    expect(view(el)).not.toBeNull();
    expect(card(el).classList.contains('viewing')).toBe(true);
    const rows = Array.from(el.shadowRoot!.querySelectorAll('.sensor-row'));
    expect(rows.map((r) => r.querySelector('.sensor-name')!.textContent)).toEqual(['Movimiento salón', 'Movimiento cocina']);
    expect(rows.map((r) => r.querySelector('.sensor-state')!.textContent)).toEqual(['Activo', 'En reposo']);
    expect(actions).toEqual([]);
  });

  it('las cerraduras hablan de «sin cerrar»', async () => {
    const el = await mount({ footer_sensors: ['lock'] }, hass());
    await open(el);
    expect(el.shadowRoot!.querySelector('.sensor-state')!.textContent).toBe('Sin cerrar');
  });

  it('la ✕ cierra la lista', async () => {
    const el = await mount({ footer_sensors: ['motion'] }, hass());
    await open(el);
    el.shadowRoot!.querySelector<HTMLButtonElement>('.view .cancel')!.click();
    await el.updateComplete;
    expect(view(el)).toBeNull();
    expect(card(el).classList.contains('viewing')).toBe(false);
  });

  it('un tipo sin sensores avisa de que no hay', async () => {
    const el = await mount({ footer_sensors: ['vibration'] }, hass());
    await open(el);
    expect(el.shadowRoot!.querySelector('.sensor-empty')!.textContent).toBe('No hay sensores de este tipo');
  });
});
