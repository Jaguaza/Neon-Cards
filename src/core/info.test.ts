import { describe, it, expect } from 'vitest';
import { getInfoLabels, INFO_OPTIONS } from './info';

describe('getInfoLabels', () => {
  it('devuelve una etiqueta no vacía para cada InfoOption', () => {
    const labels = getInfoLabels(undefined);
    for (const opt of INFO_OPTIONS) {
      expect(labels[opt].length).toBeGreaterThan(0);
    }
  });

  it('funciona sin hass (cae a DEFAULT_LOCALE)', () => {
    expect(getInfoLabels(undefined).name).toBe('Nombre');
  });
});
