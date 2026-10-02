import { NEON_CARDS_VERSION } from '../../version';

export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = NEON_CARDS_VERSION;

// La paleta neón (NEON_PRESETS, DEFAULT_PALETTE, resolveGradientColors) se
// extrajo a `src/shared/neon-palette.ts` para que la Button Card (y
// futuras tarjetas) la reutilicen sin duplicarla. Se importa desde ahí
// directamente: `import { NEON_PRESETS, DEFAULT_PALETTE } from '../../shared'`.
