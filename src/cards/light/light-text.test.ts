import { describe, expect, it } from 'vitest';
import type { HassEntityState } from '../../ha/types';
import { lightStateText } from './light-text';
import { LIGHT_TRANSLATIONS } from './translations';

const stateObj = (state: string, attributes: Record<string, unknown> = {}): HassEntityState => ({ entity_id: 'light.sala', state, last_changed: '', last_updated: '', attributes });
const es = (key: keyof typeof LIGHT_TRANSLATIONS.es) => LIGHT_TRANSLATIONS.es[key];
const en = (key: keyof typeof LIGHT_TRANSLATIONS.en) => LIGHT_TRANSLATIONS.en[key];

describe('texto de estado de la luz', () => {
  it('encendida con brillo, encendida sin brillo y apagada', () => {
    expect(lightStateText(es, stateObj('on', { brightness: 178 }))).toBe('Encendida · 70%');
    expect(lightStateText(es, stateObj('on'))).toBe('Encendida');
    expect(lightStateText(es, stateObj('off', { brightness: 178 }))).toBe('Apagada');
  });
  it('sin entidad, no disponible o desconocida', () => {
    expect(lightStateText(es, undefined)).toBe('No disponible');
    expect(lightStateText(en, stateObj('unavailable'))).toBe('Unavailable');
    expect(lightStateText(en, stateObj('unknown'))).toBe('Unavailable');
  });
  it('un grupo añade cuántas luces hay encendidas, en cada idioma', () => {
    expect(lightStateText(es, stateObj('on', { brightness: 255 }), { on: 2, total: 3 })).toBe('Encendida · 100% · 2 de 3 encendidas');
    expect(lightStateText(en, stateObj('off'), { on: 0, total: 3 })).toBe('Off · 0 of 3 on');
  });
});
