import { describe, it, expect } from 'vitest';
import { cardSizeRows, gridColumnsFor, isButtonActive, isEntityBroken, resolveButtonIcon } from './button-state';
import { DEFAULT_ICON, ERROR_ICON } from './constants';
import type { HomeAssistant } from '../../ha/types';
import type { NeonButtonCardConfig } from './types';

function hassWith(states: Record<string, { state: string; icon?: string }>): HomeAssistant {
  const full: HomeAssistant['states'] = {};
  for (const [id, { state, icon }] of Object.entries(states)) {
    full[id] = { entity_id: id, state, last_changed: '', last_updated: '', attributes: icon ? { icon } : {} };
  }
  return { states: full, callService: async () => undefined };
}

describe('gridColumnsFor', () => {
  it('usa 3 columnas sin sensores agrupados o con uno solo', () => {
    expect(gridColumnsFor(0)).toBe(3);
    expect(gridColumnsFor(1)).toBe(3);
  });

  it('usa 5 columnas con 2 sensores y 6 con 3', () => {
    expect(gridColumnsFor(2)).toBe(5);
    expect(gridColumnsFor(3)).toBe(6);
  });
});

describe('cardSizeRows', () => {
  it('devuelve 2 filas sin config, sin sensores o con solo uno de los dos tipos', () => {
    expect(cardSizeRows(undefined)).toBe(2);
    expect(cardSizeRows({})).toBe(2);
    expect(cardSizeRows({ top_sensor: { entity: 'sensor.a' } })).toBe(2);
    expect(cardSizeRows({ sensors: [{ entity: 'sensor.a' }] })).toBe(2);
  });

  it('devuelve 3 filas con sensor suelto y agrupados a la vez', () => {
    const config: NeonButtonCardConfig = { top_sensor: { entity: 'sensor.a' }, sensors: [{ entity: 'sensor.b' }] };
    expect(cardSizeRows(config)).toBe(3);
  });
});

describe('isEntityBroken', () => {
  const hass = hassWith({
    'light.ok': { state: 'on' },
    'light.caida': { state: 'unavailable' },
    'sensor.rara': { state: 'unknown' },
  });

  it('nunca es un error sin entity configurada (botón de acción puro)', () => {
    expect(isEntityBroken({}, hass)).toBe(false);
  });

  it('no es un error mientras no haya hass', () => {
    expect(isEntityBroken({ entity: 'light.ok' }, undefined)).toBe(false);
  });

  it('detecta entidad inexistente, unavailable y unknown', () => {
    expect(isEntityBroken({ entity: 'light.no_existe' }, hass)).toBe(true);
    expect(isEntityBroken({ entity: 'light.caida' }, hass)).toBe(true);
    expect(isEntityBroken({ entity: 'sensor.rara' }, hass)).toBe(true);
  });

  it('no marca como rota una entidad con estado válido', () => {
    expect(isEntityBroken({ entity: 'light.ok' }, hass)).toBe(false);
  });
});

describe('isButtonActive', () => {
  const hass = hassWith({
    'light.on': { state: 'on' },
    'light.off': { state: 'off' },
    'sensor.on': { state: 'on' },
    'binary_sensor.puerta': { state: 'on' },
  });

  it('está activo con un dominio encendible en estado on', () => {
    expect(isButtonActive({ entity: 'light.on' }, hass)).toBe(true);
    expect(isButtonActive({ entity: 'binary_sensor.puerta' }, hass)).toBe(true);
  });

  it('no está activo en estado off, sin entidad o si la entidad no existe', () => {
    expect(isButtonActive({ entity: 'light.off' }, hass)).toBe(false);
    expect(isButtonActive({}, hass)).toBe(false);
    expect(isButtonActive({ entity: 'light.no_existe' }, hass)).toBe(false);
  });

  it('ignora dominios que no se interpretan como encendido/apagado', () => {
    expect(isButtonActive({ entity: 'sensor.on' }, hass)).toBe(false);
  });
});

describe('resolveButtonIcon', () => {
  const hass = hassWith({
    'light.con_icono': { state: 'on', icon: 'mdi:ceiling-light' },
    'light.sin_icono': { state: 'on' },
    'light.caida': { state: 'unavailable', icon: 'mdi:ceiling-light' },
  });

  it('prioriza el icon explícito, luego el de la entidad, luego el de por defecto', () => {
    expect(resolveButtonIcon({ entity: 'light.con_icono', icon: 'mdi:sofa' }, hass)).toBe('mdi:sofa');
    expect(resolveButtonIcon({ entity: 'light.con_icono' }, hass)).toBe('mdi:ceiling-light');
    expect(resolveButtonIcon({ entity: 'light.sin_icono' }, hass)).toBe(DEFAULT_ICON);
    expect(resolveButtonIcon({}, hass)).toBe(DEFAULT_ICON);
  });

  it('una entidad rota sustituye siempre al icono, incluso a uno explícito', () => {
    expect(resolveButtonIcon({ entity: 'light.caida', icon: 'mdi:sofa' }, hass)).toBe(ERROR_ICON);
    expect(resolveButtonIcon({ entity: 'light.no_existe' }, hass)).toBe(ERROR_ICON);
  });
});
