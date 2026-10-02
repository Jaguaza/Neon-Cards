import { describe, it, expect } from 'vitest';
import { formatSensorState, getSensorDisplay } from './sensors';
import type { HomeAssistant } from './types';

function hassWith(states: HomeAssistant['states']): HomeAssistant {
  return {
    states,
    callService: async () => undefined,
  };
}

describe('formatSensorState', () => {
  it('redondea un estado numérico a los decimales indicados', () => {
    expect(formatSensorState('21.456', 1)).toBe('21.5');
    expect(formatSensorState('21.456', 0)).toBe('21');
  });

  it('usa 1 decimal por defecto si no se indica', () => {
    expect(formatSensorState('21.456')).toBe('21.5');
  });

  it('deja intacto un estado no numérico', () => {
    expect(formatSensorState('on')).toBe('on');
    expect(formatSensorState('unavailable')).toBe('unavailable');
    expect(formatSensorState('Cerrada')).toBe('Cerrada');
  });

  it('deja intacto un estado vacío', () => {
    expect(formatSensorState('')).toBe('');
  });
});

describe('getSensorDisplay', () => {
  it('devuelve null para un dominio que no es sensor/binary_sensor', () => {
    const hass = hassWith({
      'light.salon': { entity_id: 'light.salon', state: 'on', last_changed: '', last_updated: '', attributes: {} },
    });
    expect(getSensorDisplay('light.salon', hass)).toBeNull();
  });

  it('formatea estado, icono y unidad de un sensor existente', () => {
    const hass = hassWith({
      'sensor.salon_temperature': {
        entity_id: 'sensor.salon_temperature',
        state: '21.456',
        last_changed: '',
        last_updated: '',
        attributes: { device_class: 'temperature', unit_of_measurement: '°C' },
      },
    });
    const d = getSensorDisplay('sensor.salon_temperature', hass, { decimals: 1 });
    expect(d).toEqual({
      entity: 'sensor.salon_temperature',
      icon: 'mdi:thermometer',
      state: '21.5',
      unit: '°C',
      available: true,
    });
  });

  it('respeta un icon override aunque haya device_class', () => {
    const hass = hassWith({
      'sensor.salon_power': {
        entity_id: 'sensor.salon_power',
        state: '120',
        last_changed: '',
        last_updated: '',
        attributes: { device_class: 'power' },
      },
    });
    const d = getSensorDisplay('sensor.salon_power', hass, { icon: 'mdi:flash-custom' });
    expect(d?.icon).toBe('mdi:flash-custom');
  });

  it('marca available: false y no formatea el estado si la entidad no existe', () => {
    const hass = hassWith({});
    const d = getSensorDisplay('sensor.no_existe', hass);
    expect(d).toEqual({
      entity: 'sensor.no_existe',
      icon: 'mdi:eye',
      state: 'unavailable',
      unit: '',
      available: false,
    });
  });

  it('marca available: false si el estado es unavailable/unknown, sin redondear', () => {
    const hass = hassWith({
      'sensor.salon_temperature': {
        entity_id: 'sensor.salon_temperature',
        state: 'unavailable',
        last_changed: '',
        last_updated: '',
        attributes: {},
      },
    });
    const d = getSensorDisplay('sensor.salon_temperature', hass, { decimals: 1 });
    expect(d?.available).toBe(false);
    expect(d?.state).toBe('unavailable');
  });

  it('usa el icono por defecto de binary_sensor cuando no hay device_class', () => {
    const hass = hassWith({
      'binary_sensor.puerta': {
        entity_id: 'binary_sensor.puerta',
        state: 'on',
        last_changed: '',
        last_updated: '',
        attributes: {},
      },
    });
    const d = getSensorDisplay('binary_sensor.puerta', hass);
    expect(d?.icon).toBe('mdi:checkbox-blank-circle-outline');
  });
});
