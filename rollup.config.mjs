import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';

/**
 * Todas las tarjetas se empaquetan juntas en un único archivo
 * (dist-cards/neon-cards.js). Un único recurso Lovelace instala toda la
 * colección; añadir una tarjeta nueva es una línea de import en
 * src/neon-cards.ts, no un cambio aquí.
 *
 * Modo desarrollo/producción (acuerdo nº22): `npm run build:cards:dev`
 * pone NEON_DEV=true, dejando `__DEV__` en `true` (sin minificar, con
 * los `if (__DEV__) console.warn(...)` activos) — `npm run build:cards`
 * normal lo deja en `false`; el replace sustituye el identificador por
 * el literal antes de terser, que borra esos bloques como código
 * muerto, así que no llegan al bundle publicado.
 */
const isDev = process.env.NEON_DEV === 'true';

export default {
  input: 'src/neon-cards.ts',
  output: {
    file: 'dist-cards/neon-cards.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    replace({
      preventAssignment: true,
      values: { __DEV__: JSON.stringify(isDev) },
    }),
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
    ...(isDev ? [] : [terser()]),
  ],
};
