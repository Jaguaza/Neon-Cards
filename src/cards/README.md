# src/cards

Cada tarjeta vive en su propia subcarpeta (`src/cards/<nombre>`).

Una tarjeta:

- Nunca importa código de otra tarjeta.
- Solo puede depender de `../../core` y de
  `../ha`, `../shared`, `../utils` (módulos hermanos dentro de `src/`).
- No se publica hasta tener código, editor visual, documentación, ejemplos,
  animaciones y rendimiento validado (acuerdo nº18).

## Tarjetas

- [`entity`](./entity) — `custom:neon-card-entity`, interruptor con aro
  neón degradado de 3 colores. Ver [ejemplo](../../examples/README.md).
