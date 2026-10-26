import { describe, expect, it } from 'vitest';
import { footerSensorView, normalizeFooterTypes, sensorsOfType } from './alarm-sensors';
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
    expect(normalizeFooterTypes(['motion', 'motion', ' ', 3, 'door', 'window', 'lock'], 'large')).toEqual(['motion', 'door', 'window']);
    expect(normalizeFooterTypes(['motion', 'door', 'window'], 'medium')).toEqual(['motion', 'door']);
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
