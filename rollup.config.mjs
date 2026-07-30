import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

/**
 * Cada tarjeta se empaqueta como un único archivo JS bajo dist-cards/,
 * listo para servirse a Home Assistant como recurso Lovelace (y, en la
 * fase 3, como asset de un GitHub Release para HACS).
 *
 * Añadir una tarjeta nueva = añadir una línea aquí. Sin descubrimiento
 * automático de carpetas (acuerdo nº10: nada de magia oculta).
 */
const cards = {
  'neon-cards-entity': 'src/cards/entity/index.ts',
};

export default {
  input: cards,
  output: {
    dir: 'dist-cards',
    format: 'es',
    entryFileNames: '[name].js',
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
