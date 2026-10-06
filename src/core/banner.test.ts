import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logCardBanner } from './banner';

type DevGlobal = { __DEV__?: boolean };

describe('logCardBanner', () => {
  let info: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    info.mockRestore();
    delete (globalThis as DevGlobal).__DEV__;
  });

  it('en modo desarrollo escribe una sola línea con nombre, autor y versión', () => {
    (globalThis as DevGlobal).__DEV__ = true;
    logCardBanner('NEON BUTTON CARD', 'Jaguaza', '1.0.0');
    expect(info).toHaveBeenCalledTimes(1);
    const [format, ...styles] = info.mock.calls[0] as string[];
    expect(format).toBe('%c NEON BUTTON CARD %c By Jaguaza %c v1.0.0 ');
    expect(styles).toHaveLength(3);
    expect(styles.every((s) => s.startsWith('color:'))).toBe(true);
  });

  it('en producción no escribe nada en la consola', () => {
    (globalThis as DevGlobal).__DEV__ = false;
    logCardBanner('NEON BUTTON CARD', 'Jaguaza', '1.0.0');
    expect(info).not.toHaveBeenCalled();
  });
});
