import { describe, expect, it } from 'vitest';
import { clamp, isNumber } from './numbers';

describe('helpers numéricos', () => {
  it('isNumber acepta solo números finitos', () => {
    expect([0, -3, 2.5].every(isNumber)).toBe(true);
    expect([NaN, Infinity, -Infinity, '4', null, undefined, [], {}].some(isNumber)).toBe(false);
  });

  it('clamp acota por los dos lados', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-5, 1, 10)).toBe(1);
    expect(clamp(50, 1, 10)).toBe(10);
  });
});
