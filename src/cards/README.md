# src/cards

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccards-english)

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
- [`button`](./button) — `custom:neon-button-card`, botón de acción con
  entidad opcional, cristal y halo neón en estado activo.

---

<a id="srccards-english"></a>

# src/cards (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccards)

Every card lives in its own subfolder (`src/cards/<name>`).

A card:

- Never imports code from another card.
- Can only depend on `../../core` and on `../ha`, `../shared`, `../utils`
  (sibling modules inside `src/`).
- Isn't published until it has code, a visual editor, documentation,
  examples, animations, and validated performance (agreement nº18).

## Cards

- [`entity`](./entity) — `custom:neon-card-entity`, a switch with a
  3-color neon gradient ring. See the [example](../../examples/README.md).
- [`button`](./button) — `custom:neon-button-card`, an action button
  with an optional entity, glassmorphism, and a neon halo when active.
