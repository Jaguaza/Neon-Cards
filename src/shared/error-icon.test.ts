import { describe, expect, it } from 'vitest';
import { ERROR_ICON } from './error-icon';

describe('ERROR_ICON', () => {
  it('es la cruz de mdi', () => {
    expect(ERROR_ICON).toBe('mdi:close');
  });
});
