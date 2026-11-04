import { describe, expect, it } from 'vitest';
import { NEON_CARDS_VERSION } from '../version';
import { CARD_AUTHOR, CARD_VERSION } from './card-identity';

describe('identidad de las tarjetas', () => {
  it('el autor es Jaguaza', () => {
    expect(CARD_AUTHOR).toBe('Jaguaza');
  });

  it('la versión es la única del paquete', () => {
    expect(CARD_VERSION).toBe(NEON_CARDS_VERSION);
  });
});
