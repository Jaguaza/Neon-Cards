import type { ReactiveControllerHost } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTION_PENDING_MS, ActionPendingController } from './action-pending';

function fakeHost() {
  const host = { requestUpdate: vi.fn(), addController: vi.fn() } as unknown as ReactiveControllerHost & {
    requestUpdate: ReturnType<typeof vi.fn>;
    addController: ReturnType<typeof vi.fn>;
  };
  return host;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ActionPendingController', () => {
  it('se registra en la tarjeta y empieza sin espera', () => {
    const host = fakeHost();
    const pending = new ActionPendingController(host);
    expect(host.addController).toHaveBeenCalledWith(pending);
    expect(pending.active).toBe(false);
  });

  it('start enciende la espera, pide un render y pide otro al agotarse', () => {
    const host = fakeHost();
    const pending = new ActionPendingController(host);
    pending.start();
    expect(pending.active).toBe(true);
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(ACTION_PENDING_MS - 1);
    expect(pending.active).toBe(true);
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(pending.active).toBe(false);
    expect(host.requestUpdate).toHaveBeenCalledTimes(2);
  });

  it('acepta una duración propia', () => {
    const pending = new ActionPendingController(fakeHost());
    pending.start(500);
    vi.advanceTimersByTime(499);
    expect(pending.active).toBe(true);
    vi.advanceTimersByTime(1);
    expect(pending.active).toBe(false);
  });

  it('clear da la espera por terminada', () => {
    const pending = new ActionPendingController(fakeHost());
    pending.start();
    pending.clear();
    expect(pending.active).toBe(false);
  });

  it('volver a empezar reinicia el temporizador: solo hay uno', () => {
    const host = fakeHost();
    const pending = new ActionPendingController(host);
    pending.start();
    vi.advanceTimersByTime(4000);
    pending.start();
    host.requestUpdate.mockClear();
    vi.advanceTimersByTime(ACTION_PENDING_MS - 1);
    expect(host.requestUpdate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
  });

  it('al desconectar detiene el temporizador y al reconectar retoma lo que falta', () => {
    const host = fakeHost();
    const pending = new ActionPendingController(host);
    pending.start();
    host.requestUpdate.mockClear();
    pending.hostDisconnected();
    vi.advanceTimersByTime(2000);
    expect(host.requestUpdate).not.toHaveBeenCalled();
    pending.hostConnected();
    vi.advanceTimersByTime(ACTION_PENDING_MS - 2000 - 1);
    expect(host.requestUpdate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
  });

  it('reconectar sin espera pendiente no programa nada', () => {
    const host = fakeHost();
    const pending = new ActionPendingController(host);
    pending.hostConnected();
    vi.advanceTimersByTime(ACTION_PENDING_MS * 2);
    expect(host.requestUpdate).not.toHaveBeenCalled();
  });
});
