import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { HistoryController } from './history-controller';

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

function makeHost(): ReactiveControllerHost & { controllers: ReactiveController[]; updates: number } {
  const host = {
    controllers: [] as ReactiveController[],
    updates: 0,
    addController(c: ReactiveController) {
      host.controllers.push(c);
    },
    removeController() {},
    requestUpdate() {
      host.updates++;
    },
    updateComplete: Promise.resolve(true),
  };
  return host;
}

function makeHass(now: number): HomeAssistant & { callWS: ReturnType<typeof vi.fn> } {
  const callWS = vi.fn(async () => ({
    'sensor.temp': [
      { s: '20.1', lu: (now - 20 * 3_600_000) / 1000 },
      { s: '20.8', lu: (now - 10 * 3_600_000) / 1000 },
      { s: '20.6', lu: (now - 1 * 3_600_000) / 1000 },
    ],
  }));
  return { states: {}, callService: async () => {}, callWS } as unknown as HomeAssistant & {
    callWS: ReturnType<typeof vi.fn>;
  };
}

describe('HistoryController', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('carga el histórico cuando hass llega después que la config', async () => {
    const host = makeHost();
    const ctrl = new HistoryController(host);
    ctrl.hostConnected();

    // Primera actualización: ya hay entidad pero todavía no hay hass.
    ctrl.sync({ entity: 'sensor.temp', hours: 24, enabled: true });
    await vi.advanceTimersByTimeAsync(0);
    expect(ctrl.values).toEqual([]);

    // Segunda actualización: llega hass con la misma entidad y horas.
    const hass = makeHass(Date.now());
    ctrl.sync({ hass, entity: 'sensor.temp', hours: 24, enabled: true });
    await vi.advanceTimersByTimeAsync(0);

    expect(hass.callWS).toHaveBeenCalledTimes(1);
    expect(ctrl.values.length).toBeGreaterThan(0);
    ctrl.hostDisconnected();
  });

  it('no duplica consultas si sync se repite con la misma petición', async () => {
    const host = makeHost();
    const ctrl = new HistoryController(host);
    ctrl.hostConnected();
    const hass = makeHass(Date.now());
    const request = { hass, entity: 'sensor.temp', hours: 24, enabled: true };

    ctrl.sync(request);
    ctrl.sync(request);
    ctrl.sync(request);
    await vi.advanceTimersByTimeAsync(0);

    expect(hass.callWS).toHaveBeenCalledTimes(1);
    ctrl.hostDisconnected();
  });

  it('no consulta si el gráfico está desactivado', async () => {
    const host = makeHost();
    const ctrl = new HistoryController(host);
    ctrl.hostConnected();
    const hass = makeHass(Date.now());

    ctrl.sync({ hass, entity: 'sensor.temp', hours: 24, enabled: false });
    await vi.advanceTimersByTimeAsync(0);

    expect(hass.callWS).not.toHaveBeenCalled();
    ctrl.hostDisconnected();
  });
});
