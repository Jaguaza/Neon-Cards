import { describe, expect, it } from 'vitest';
import { EDITOR_ACTIONS } from './types';

describe('EDITOR_ACTIONS', () => {
  it('ofrece las acciones estándar del selector, sin repetidos', () => {
    expect([...EDITOR_ACTIONS]).toEqual(['more-info', 'toggle', 'navigate', 'url', 'call-service', 'assist', 'none']);
    expect(new Set(EDITOR_ACTIONS).size).toBe(EDITOR_ACTIONS.length);
  });
});
