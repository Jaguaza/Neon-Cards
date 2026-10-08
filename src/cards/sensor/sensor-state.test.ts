import { describe, it, expect } from 'vitest';
import { isSensorEntity, ALLOWED_DOMAINS } from './sensor-state';

describe('isSensorEntity', () => {
  it('acepta sensor y binary_sensor', () => {
    expect(isSensorEntity('sensor.temperatura_salon')).toBe(true);
    expect(isSensorEntity('binary_sensor.puerta_entrada')).toBe(true);
  });

  it('rechaza cualquier otro dominio', () => {
    for (const id of ['light.salon', 'switch.enchufe', 'climate.casa', 'input_boolean.x', 'sensors.x']) {
      expect(isSensorEntity(id)).toBe(false);
    }
  });

  it('rechaza vacío, undefined y ids sin dominio', () => {
    expect(isSensorEntity(undefined)).toBe(false);
    expect(isSensorEntity('')).toBe(false);
    expect(isSensorEntity('sensor')).toBe(false);
  });

  it('expone exactamente los dos dominios permitidos', () => {
    expect(ALLOWED_DOMAINS).toEqual(['sensor', 'binary_sensor']);
  });
});
