import { describe, expect, it } from 'vitest';
import { STATUS_DOT_DEFAULTS } from './constants';
import { LOCK_FOOTER_ITEM_TYPES, batteryIcon, formatAccessTime, normalizeFooterItems, resolveFooterItems } from './footer';

const NOW = new Date('2026-10-15T12:00:00');
const iso = (d: string) => new Date(d).toISOString();

const entity = (state: string, attributes: Record<string, unknown> = {}, last_changed = iso('2026-10-15T08:42:00'), last_updated = last_changed) => ({
  entity_id: 'x.y',
  state,
  attributes,
  last_changed,
  last_updated,
});

const hassOf = (states: Record<string, ReturnType<typeof entity>>, language = 'es') =>
  ({ locale: { language }, states, callService: async () => undefined }) as never;

describe('normalizeFooterItems', () => {
  it('deja los tipos válidos, sin repetidos y como mucho tres', () => {
    expect(normalizeFooterItems(['battery', 'door', 'last_user'])).toEqual(['battery', 'door', 'last_user']);
    expect(normalizeFooterItems(['door', 'door', 'battery'])).toEqual(['door', 'battery']);
    expect(normalizeFooterItems(['door', 'x', 3, 'battery'])).toEqual(['door', 'battery']);
    expect(normalizeFooterItems(['door', 'battery', 'last_user', 'door'])).toHaveLength(3);
  });
  it('lo que no es una lista no da nada', () => {
    for (const v of [undefined, null, 'door', 5, {}]) expect(normalizeFooterItems(v)).toEqual([]);
    expect(LOCK_FOOTER_ITEM_TYPES).toEqual(['door', 'battery', 'last_user']);
  });
});

describe('batteryIcon', () => {
  it('elige el icono mdi más cercano al nivel', () => {
    expect(batteryIcon(100)).toBe('mdi:battery');
    expect(batteryIcon(95)).toBe('mdi:battery');
    expect(batteryIcon(85)).toBe('mdi:battery-90');
    expect(batteryIcon(84)).toBe('mdi:battery-80');
    expect(batteryIcon(50)).toBe('mdi:battery-50');
    expect(batteryIcon(10)).toBe('mdi:battery-10');
    expect(batteryIcon(9)).toBe('mdi:battery-alert');
    expect(batteryIcon(0)).toBe('mdi:battery-alert');
    expect(batteryIcon(undefined)).toBe('mdi:battery-unknown');
  });
});

describe('formatAccessTime', () => {
  it('de hoy: solo la hora; de otro día: fecha y hora', () => {
    expect(formatAccessTime(iso('2026-10-15T08:42:00'), 'es', NOW)).toMatch(/^0?8:42$/);
    const other = formatAccessTime(iso('2026-10-12T21:05:00'), 'es', NOW);
    expect(other).toContain(', ');
    expect(other).toMatch(/21:05$/);
  });
  it('sin fecha o con una fecha inválida no da nada', () => {
    expect(formatAccessTime(undefined, 'es', NOW)).toBe('');
    expect(formatAccessTime('no es una fecha', 'es', NOW)).toBe('');
  });
});

describe('resolveFooterItems · puerta', () => {
  const door = (state: string, attributes = {}) => hassOf({ 'binary_sensor.puerta': entity(state, attributes) });
  const cfg = { entity: 'lock.p', footer_items: ['door' as const], door_entity: 'binary_sensor.puerta' };

  it('off es cerrada (sin color propio) y on es abierta (con el color del estado «abierta»), con su icono', () => {
    expect(resolveFooterItems(cfg, door('off'), undefined, NOW)).toEqual([{ type: 'door', icon: 'mdi:door-closed', text: 'Cerrada', tone: 'normal' }]);
    expect(resolveFooterItems(cfg, door('on'), undefined, NOW)).toEqual([{ type: 'door', icon: 'mdi:door-open', text: 'Abierta', tone: 'warn', color: STATUS_DOT_DEFAULTS.open }]);
  });
  it('abierta usa el color elegido para «desbloqueada o abierta»; cerrada no lleva ninguno aunque se haya elegido el de «cerrada»', () => {
    const custom = { ...cfg, status_color_open: '#00aaff', status_color_closed: '#ff00ff' };
    expect(resolveFooterItems(custom, door('on'), undefined, NOW)[0].color).toBe('#00aaff');
    expect('color' in resolveFooterItems(custom, door('off'), undefined, NOW)[0]).toBe(false);
  });
  it('un color inválido en la config se ignora y abierta usa el de por defecto', () => {
    expect(resolveFooterItems({ ...cfg, status_color_open: 'red; x: y' }, door('on'), undefined, NOW)[0].color).toBe(STATUS_DOT_DEFAULTS.open);
  });
  it('sin dato (no disponible, sin sensor) no hay color: se queda en gris', () => {
    expect('color' in resolveFooterItems(cfg, door('unavailable'), undefined, NOW)[0]).toBe(false);
    expect('color' in resolveFooterItems({ ...cfg, door_entity: undefined }, door('on'), undefined, NOW)[0]).toBe(false);
  });
  it('batería y último acceso no llevan color propio', () => {
    const lock = entity('locked', { battery_level: 85, changed_by: 'Jorge' });
    const out = resolveFooterItems({ entity: 'lock.p', footer_items: ['battery', 'last_user'] }, hassOf({}), lock, NOW);
    expect(out.every((i) => !('color' in i))).toBe(true);
  });
  it('el icono sigue la device_class (garaje, ventana)', () => {
    expect(resolveFooterItems(cfg, door('on', { device_class: 'garage_door' }), undefined, NOW)[0].icon).toBe('mdi:garage-open');
    expect(resolveFooterItems(cfg, door('off', { device_class: 'garage_door' }), undefined, NOW)[0].icon).toBe('mdi:garage');
    expect(resolveFooterItems(cfg, door('on', { device_class: 'window' }), undefined, NOW)[0].icon).toBe('mdi:window-open');
  });
  it('en inglés', () => {
    const en = hassOf({ 'binary_sensor.puerta': entity('on') }, 'en');
    expect(resolveFooterItems(cfg, en, undefined, NOW)[0].text).toBe('Open');
  });
  it('sensor no disponible → «No disponible»; sin entidad configurada o inexistente → «—»; siempre en gris', () => {
    expect(resolveFooterItems(cfg, door('unavailable'), undefined, NOW)[0]).toMatchObject({ text: 'No disponible', tone: 'muted' });
    expect(resolveFooterItems({ ...cfg, door_entity: undefined }, door('on'), undefined, NOW)[0]).toMatchObject({ text: '—', tone: 'muted' });
    expect(resolveFooterItems({ ...cfg, door_entity: 'binary_sensor.nada' }, door('on'), undefined, NOW)[0]).toMatchObject({ text: '—', tone: 'muted' });
  });
});

describe('resolveFooterItems · batería', () => {
  const cfg = { entity: 'lock.p', footer_items: ['battery' as const] };

  it('sin entidad usa el atributo battery_level de la cerradura (o battery)', () => {
    const lock = entity('locked', { battery_level: 85 });
    expect(resolveFooterItems(cfg, hassOf({}), lock, NOW)).toEqual([{ type: 'battery', icon: 'mdi:battery-90', text: '85 %', tone: 'normal' }]);
    expect(resolveFooterItems(cfg, hassOf({}), entity('locked', { battery: 40 }), NOW)[0].text).toBe('40 %');
  });
  it('con battery_entity manda esa entidad', () => {
    const hass = hassOf({ 'sensor.bat': entity('62.4') });
    const out = resolveFooterItems({ ...cfg, battery_entity: 'sensor.bat' }, hass, entity('locked', { battery_level: 5 }), NOW);
    expect(out[0]).toMatchObject({ text: '62 %', icon: 'mdi:battery-60', tone: 'normal' });
  });
  it('batería baja (20 % o menos) en rojo', () => {
    expect(resolveFooterItems(cfg, hassOf({}), entity('locked', { battery_level: 20 }), NOW)[0].tone).toBe('alert');
    expect(resolveFooterItems(cfg, hassOf({}), entity('locked', { battery_level: 21 }), NOW)[0].tone).toBe('normal');
  });
  it('se acota a 0-100 y un dato que no es número es «—» en gris', () => {
    expect(resolveFooterItems(cfg, hassOf({}), entity('locked', { battery_level: 140 }), NOW)[0].text).toBe('100 %');
    for (const bad of ['unknown', '', null, undefined, 'abc']) {
      expect(resolveFooterItems(cfg, hassOf({}), entity('locked', { battery_level: bad }), NOW)[0], String(bad)).toMatchObject({ text: '—', tone: 'muted', icon: 'mdi:battery-unknown' });
    }
    expect(resolveFooterItems(cfg, hassOf({}), undefined, NOW)[0].text).toBe('—');
  });
});

describe('resolveFooterItems · último acceso', () => {
  const cfg = { entity: 'lock.p', footer_items: ['last_user' as const] };

  it('sin entidad usa changed_by y el last_changed de la cerradura', () => {
    const lock = entity('locked', { changed_by: 'Jorge' }, iso('2026-10-15T08:42:00'));
    const [item] = resolveFooterItems(cfg, hassOf({}), lock, NOW);
    expect(item).toMatchObject({ type: 'last_user', icon: 'mdi:account', label: 'Último acceso', tone: 'normal' });
    expect(item.text).toMatch(/^Jorge · 0?8:42$/);
  });
  it('con last_user_entity manda esa entidad (nombre = estado, hora = last_updated)', () => {
    const hass = hassOf({ 'sensor.quien': entity('Ana', {}, iso('2026-10-01T00:00:00'), iso('2026-10-15T10:15:00')) });
    const [item] = resolveFooterItems({ ...cfg, last_user_entity: 'sensor.quien' }, hass, entity('locked', { changed_by: 'Jorge' }), NOW);
    expect(item.text).toMatch(/^Ana · 10:15$/);
  });
  it('un acceso de otro día lleva la fecha', () => {
    const lock = entity('locked', { changed_by: 'Jorge' }, iso('2026-10-12T21:05:00'));
    expect(resolveFooterItems(cfg, hassOf({}), lock, NOW)[0].text).toMatch(/^Jorge · .+, 21:05$/);
  });
  it('sin usuario conocido es «—» en gris (unknown, unavailable, vacío o sin changed_by)', () => {
    expect(resolveFooterItems(cfg, hassOf({}), entity('locked'), NOW)[0]).toMatchObject({ text: '—', tone: 'muted' });
    expect(resolveFooterItems(cfg, hassOf({}), entity('locked', { changed_by: '  ' }), NOW)[0].text).toBe('—');
    for (const state of ['unknown', 'unavailable', '']) {
      const hass = hassOf({ 'sensor.quien': entity(state) });
      expect(resolveFooterItems({ ...cfg, last_user_entity: 'sensor.quien' }, hass, undefined, NOW)[0].text, state).toBe('—');
    }
  });
  it('en inglés la etiqueta es «Last access»', () => {
    expect(resolveFooterItems(cfg, hassOf({}, 'en'), entity('locked', { changed_by: 'Jorge' }), NOW)[0].label).toBe('Last access');
  });
});

describe('resolveFooterItems · conjunto', () => {
  it('respeta el orden configurado, sin repetidos y con tres como máximo', () => {
    const cfg = { entity: 'lock.p', footer_items: ['last_user', 'battery', 'door', 'door', 'battery'] as never, door_entity: 'binary_sensor.puerta' };
    const hass = hassOf({ 'binary_sensor.puerta': entity('off') });
    expect(resolveFooterItems(cfg, hass, entity('locked', { battery_level: 85, changed_by: 'Jorge' }), NOW).map((i) => i.type)).toEqual(['last_user', 'battery', 'door']);
  });
  it('sin footer_items no hay nada', () => {
    expect(resolveFooterItems({ entity: 'lock.p' }, hassOf({}), entity('locked'), NOW)).toEqual([]);
  });
});
