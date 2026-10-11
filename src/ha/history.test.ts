import { describe, it, expect, vi } from 'vitest';
import { parseHistory, fetchHistory } from './history';
import type { HomeAssistant } from './types';

describe('parseHistory', () => {
  it('lee el formato comprimido (s/lu en segundos) y ordena', () => {
    const raw = { 'sensor.t': [{ s: '20', lu: 200 }, { s: '18', lu: 100 }] };
    expect(parseHistory(raw, 'sensor.t')).toEqual([
      { time: 100_000, state: '18' },
      { time: 200_000, state: '20' },
    ]);
  });

  it('lee el formato largo (state/last_updated ISO)', () => {
    const raw = { 'sensor.t': [{ state: '5', last_updated: '2026-01-01T00:00:00Z' }] };
    expect(parseHistory(raw, 'sensor.t')).toEqual([{ time: Date.parse('2026-01-01T00:00:00Z'), state: '5' }]);
  });

  it('descarta entradas sin estado o sin fecha válida y entidades ausentes', () => {
    const raw = { 'sensor.t': [{ s: '1' }, { lu: 5 }, { s: '2', last_updated: 'no-fecha' }] };
    expect(parseHistory(raw, 'sensor.t')).toEqual([]);
    expect(parseHistory(raw, 'sensor.otro')).toEqual([]);
    expect(parseHistory(undefined, 'sensor.t')).toEqual([]);
  });
});

describe('fetchHistory', () => {
  it('sin callWS devuelve []', async () => {
    const hass = { states: {} } as unknown as HomeAssistant;
    expect(await fetchHistory(hass, 'sensor.t', 24)).toEqual([]);
  });

  it('pide la ventana correcta con respuesta mínima', async () => {
    const callWS = vi.fn().mockResolvedValue({ 'sensor.t': [{ s: '1', lu: 10 }] });
    const hass = { states: {}, callWS } as unknown as HomeAssistant;
    const now = Date.parse('2026-10-08T12:00:00Z');
    const out = await fetchHistory(hass, 'sensor.t', 2, now);
    expect(out).toEqual([{ time: 10_000, state: '1' }]);
    const msg = callWS.mock.calls[0][0];
    expect(msg).toMatchObject({
      type: 'history/history_during_period',
      entity_ids: ['sensor.t'],
      minimal_response: true,
      no_attributes: true,
      start_time: '2026-10-08T10:00:00.000Z',
      end_time: '2026-10-08T12:00:00.000Z',
    });
  });
});
