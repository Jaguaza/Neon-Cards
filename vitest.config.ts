import { defineConfig } from 'vitest/config';

/**
 * Config mínima (acuerdo nº11: dependencias mínimas, nada de más de lo
 * necesario). Entorno `node` — la primera tanda de tests cubre lógica
 * pura (`src/shared`, `src/ha`), sin montar componentes Lit todavía, así
 * que no hace falta `jsdom` aquí.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
