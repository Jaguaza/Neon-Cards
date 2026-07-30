import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

/**
 * Todas las tarjetas se empaquetan juntas en un único archivo
 * (dist-cards/neon-cards.js) — igual que Mushroom hace con mushroom.js.
 * Un único recurso Lovelace instala toda la colección; añadir una tarjeta
 * nueva es una línea de import en src/neon-cards.ts, no un cambio aquí.
 */
export default {
  input: 'src/neon-cards.ts',
  output: {
    file: 'dist-cards/neon-cards.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: false,
      compilerOptions: {
        target: 'ES2021',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ES2021', 'DOM'],
        strict: true,
        experimentalDecorators: true,
        useDefineForClassFields: false,
        declaration: false,
        composite: false,
        sourceMap: true,
      },
    }),
    terser(),
  ],
};
