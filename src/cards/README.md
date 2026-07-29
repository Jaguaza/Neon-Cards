# src/cards

Cada tarjeta vive en su propia subcarpeta (`src/cards/<nombre>`).

Una tarjeta:

- Nunca importa código de otra tarjeta.
- Solo puede depender de `../../core` y de
  `../ha`, `../shared`, `../utils` (módulos hermanos dentro de `src/`).
- No se publica hasta tener código, editor visual, documentación, ejemplos,
  animaciones y rendimiento validado (acuerdo nº18).

Todavía no hay ninguna tarjeta aquí — la primera (`entity`) se añadirá en
la fase 2 del proyecto.
