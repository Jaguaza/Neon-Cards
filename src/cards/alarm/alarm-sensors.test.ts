import { describe, expect, it, vi } from 'vitest';
import { SensorIndex, allSensorsOfType, footerSensorView, normalizeExcluded, normalizeFooterTypes, sensorsOfType, visibleFooterViews } from './alarm-sensors';
import { hassWith } from './neon-alarm-card.fixtures';
import type { HomeAssistant } from '../../ha/types';

const hass = hassWith('disarmed', {
  extraStates: {
    'binary_sensor.mov_salon': { state: 'on', attributes: { device_class: 'motion', friendly_name: 'Movimiento salón' } },
    'binary_sensor.mov_cocina': { state: 'off', attributes: { device_class: 'motion', friendly_name: 'Movimiento cocina' } },
    'binary_sensor.mov_roto': { state: 'unavailable', attributes: { device_class: 'motion' } },
    'binary_sensor.puerta': { state: 'on', attributes: { device_class: 'door', friendly_name: 'Puerta' } },
    'binary_sensor.sin_clase': { state: 'on', attributes: {} },
    'sensor.mov_falso': { state: 'on', attributes: { device_class: 'motion' } },
    'lock.entrada': { state: 'locked', attributes: { friendly_name: 'Entrada' } },
    'lock.garaje': { state: 'unlocked', attributes: { friendly_name: 'Garaje' } },
  },
}) as unknown as HomeAssistant;

describe('normalizeFooterTypes', () => {
  it('quita repetidos, vacíos y no textos, y recorta al máximo del tamaño', () => {
    expect(normalizeFooterTypes(['motion', 'motion', ' ', 3, 'door', 'window', 'lock', 'smoke'], 'large')).toEqual(['motion', 'door', 'window', 'lock']);
    expect(normalizeFooterTypes(['motion', 'door', 'window', 'lock', 'smoke'], 'medium')).toEqual(['motion', 'door', 'window']);
    expect(normalizeFooterTypes(['motion'], 'compact')).toEqual([]);
  });

  it('un valor que no es lista da lista vacía', () => {
    expect(normalizeFooterTypes('motion', 'large')).toEqual([]);
    expect(normalizeFooterTypes(undefined, 'large')).toEqual([]);
  });
});

describe('sensorsOfType', () => {
  it('encuentra todos los binary_sensor de esa device_class con estado válido, los activos primero', () => {
    const entries = sensorsOfType(hass, 'motion');
    expect(entries.map((e) => e.entityId)).toEqual(['binary_sensor.mov_salon', 'binary_sensor.mov_cocina']);
    expect(entries.map((e) => e.active)).toEqual([true, false]);
  });

  it('ignora sensores de otra clase, entidades que no son binary_sensor y estados no válidos', () => {
    const ids = sensorsOfType(hass, 'motion').map((e) => e.entityId);
    expect(ids).not.toContain('binary_sensor.puerta');
    expect(ids).not.toContain('sensor.mov_falso');
    expect(ids).not.toContain('binary_sensor.mov_roto');
  });

  it('lock reúne las cerraduras: activa la que no está cerrada con llave', () => {
    const entries = sensorsOfType(hass, 'lock');
    expect(entries.map((e) => [e.entityId, e.active])).toEqual([
      ['lock.garaje', true],
      ['lock.entrada', false],
    ]);
  });

  it('sin hass o sin sensores de ese tipo devuelve lista vacía; acepta cualquier device_class', () => {
    expect(sensorsOfType(undefined, 'motion')).toEqual([]);
    expect(sensorsOfType(hass, 'vibration')).toEqual([]);
    expect(sensorsOfType(hass, 'door').map((e) => e.entityId)).toEqual(['binary_sensor.puerta']);
  });
});

describe('footerSensorView', () => {
  it('cuenta los activos y usa el icono de activo o de reposo', () => {
    const motion = footerSensorView(hass, 'motion');
    expect([motion.total, motion.activeCount, motion.icon]).toEqual([2, 1, 'mdi:motion-sensor']);
    const idle = footerSensorView(hassWith('disarmed') as unknown as HomeAssistant, 'motion');
    expect([idle.total, idle.activeCount, idle.icon]).toEqual([0, 0, 'mdi:motion-sensor-off']);
  });

  it('un tipo sin iconos propios usa los genéricos', () => {
    expect(footerSensorView(hass, 'inventado').icon).toBe('mdi:check-circle-outline');
  });
});

describe('sensores excluidos', () => {
  it('normalizeExcluded deja solo textos únicos y no vacíos', () => {
    expect(normalizeExcluded(['binary_sensor.a', 'binary_sensor.a', ' ', 3, ' lock.b '])).toEqual(['binary_sensor.a', 'lock.b']);
    expect(normalizeExcluded('x')).toEqual([]);
    expect(normalizeExcluded(undefined)).toEqual([]);
  });

  it('sensorsOfType no devuelve los excluidos', () => {
    const ids = sensorsOfType(hass, 'motion', ['binary_sensor.mov_salon']).map((e) => e.entityId);
    expect(ids).toEqual(['binary_sensor.mov_cocina']);
  });

  it('el recuento y el total no cuentan los excluidos', () => {
    const view = footerSensorView(hass, 'motion', { excluded: ['binary_sensor.mov_salon'] });
    expect([view.total, view.activeCount, view.icon]).toEqual([1, 0, 'mdi:motion-sensor-off']);
  });

  it('allSensorsOfType lista todos los del tipo, también los caídos, por nombre y sin mirar exclusiones', () => {
    // El caído no tiene friendly_name: se ordena por su entity_id.
    expect(allSensorsOfType(hass, 'motion').map((e) => e.entityId)).toEqual(['binary_sensor.mov_roto', 'binary_sensor.mov_cocina', 'binary_sensor.mov_salon']);
    expect(allSensorsOfType(undefined, 'motion')).toEqual([]);
  });
});

describe('solo sensores activos', () => {
  it('footerSensorView con onlyActive deja en la lista solo los activos, pero el total sigue siendo el de todos', () => {
    const view = footerSensorView(hass, 'motion', { onlyActive: true });
    expect(view.entries.map((e) => e.entityId)).toEqual(['binary_sensor.mov_salon']);
    expect([view.total, view.activeCount]).toEqual([2, 1]);
  });

  it('visibleFooterViews quita los tipos sin ningún sensor activo solo con onlyActive', () => {
    const types = ['motion', 'door', 'lock', 'vibration'];
    expect(visibleFooterViews(hass, types).map((v) => v.type)).toEqual(types);
    expect(visibleFooterViews(hass, types, { onlyActive: true }).map((v) => v.type)).toEqual(['motion', 'door', 'lock']);
  });

  it('un tipo cuyos sensores activos están todos excluidos desaparece con onlyActive', () => {
    expect(visibleFooterViews(hass, ['door'], { onlyActive: true, excluded: ['binary_sensor.puerta'] })).toEqual([]);
  });
});

function withStates(states: HomeAssistant['states']): HomeAssistant {
  return { ...hass, states };
}

describe('SensorIndex', () => {
  it('da los mismos sensores que recorrer todas las entidades', () => {
    const index = new SensorIndex();
    for (const type of ['motion', 'door', 'lock']) {
      expect(sensorsOfType(hass, type, [], index)).toEqual(sensorsOfType(hass, type));
    }
  });

  it('no recorre las entidades mientras no cambie su número, pero lee el estado nuevo de los sensores', () => {
    const index = new SensorIndex();
    expect(footerSensorView(hass, 'motion', { index }).activeCount).toBe(1);
    const values = vi.spyOn(Object, 'values');
    const next = withStates({ ...hass.states, 'binary_sensor.mov_cocina': { ...hass.states['binary_sensor.mov_cocina'], state: 'on' } });
    expect(footerSensorView(next, 'motion', { index }).activeCount).toBe(2);
    expect(values).not.toHaveBeenCalled();
    values.mockRestore();
  });

  it('un sensor nuevo (cambia el número de entidades) entra en el recuento', () => {
    const index = new SensorIndex();
    expect(footerSensorView(hass, 'door', { index }).total).toBe(1);
    const next = withStates({ ...hass.states, 'binary_sensor.puerta_garaje': { entity_id: 'binary_sensor.puerta_garaje', state: 'off', attributes: { device_class: 'door' } } as never });
    expect(footerSensorView(next, 'door', { index }).total).toBe(2);
  });

  it('un sensor que desaparece deja de contarse', () => {
    const index = new SensorIndex();
    expect(footerSensorView(hass, 'door', { index }).total).toBe(1);
    const rest = { ...hass.states };
    delete rest['binary_sensor.puerta'];
    expect(footerSensorView(withStates(rest), 'door', { index }).total).toBe(0);
  });
});

describe('entries del pie', () => {
  it('se ordenan al leerlas: activos primero y luego por nombre, también con «solo activos»', () => {
    expect(footerSensorView(hass, 'motion').entries.map((e) => e.name)).toEqual(['Movimiento salón', 'Movimiento cocina']);
    expect(footerSensorView(hass, 'motion', { onlyActive: true }).entries.map((e) => e.name)).toEqual(['Movimiento salón']);
  });

  it('contar no ordena, y la lista se ordena una sola vez', () => {
    const compare = vi.spyOn(String.prototype, 'localeCompare');
    const view = footerSensorView(hass, 'motion');
    expect(view.total).toBe(2);
    expect(compare).not.toHaveBeenCalled();
    expect(view.entries).toBe(view.entries);
    compare.mockRestore();
  });
});
