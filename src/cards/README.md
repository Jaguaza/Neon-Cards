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

- [`entity`](./entity) — `custom:neon-card-entity`, interruptor con halo
  neón degradado de 3 colores. Ver [ejemplo](../../examples/README.md).
- [`button`](./button) — `custom:neon-button-card`, botón de acción con
  entidad opcional, icono protagonista y halo neón animado en estado
  activo. Ver [ejemplo](../../examples/README.md).
- [`thermostat`](./thermostat) — `custom:neon-thermostat-card`, termostato
  con dial neón arrastrable para una o dos entidades `climate`. Ver
  [ejemplo](../../examples/README.md).
- [`sensor`](./sensor) — `custom:neon-sensor-card`, tarjeta de solo
  lectura para un `sensor` o `binary_sensor`, con gráfico del histórico y
  umbrales de estado opcionales. Ver [ejemplo](../../examples/README.md).
- [`lock`](./lock) — `custom:neon-lock-card`, tarjeta para entidades
  `lock` con icono animado (candado, puerta o garaje), halo neón que sigue
  al estado, confirmación antes de abrir y pie informativo opcional. Tres
  tamaños. Ver [ejemplo](../../examples/README.md).
- [`alarm`](./alarm) — `custom:neon-alarm-card`, tarjeta para entidades
  `alarm_control_panel` con escudo animado, halo neón según el estado,
  selección de modo, teclado de código y pie con sensores de seguridad. Tres
  tamaños. Ver [ejemplo](../../examples/README.md).

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
  3-color neon gradient halo. See the [example](../../examples/README.md).
- [`button`](./button) — `custom:neon-button-card`, an action button
  with an optional entity, a hero icon, and an animated neon halo when
  active. See the [example](../../examples/README.md).
- [`thermostat`](./thermostat) — `custom:neon-thermostat-card`, a
  thermostat with a draggable neon dial for one or two `climate`
  entities. See the [example](../../examples/README.md).
- [`sensor`](./sensor) — `custom:neon-sensor-card`, a read-only card for
  a `sensor` or `binary_sensor`, with a history graph and optional state
  thresholds. See the [example](../../examples/README.md).
- [`lock`](./lock) — `custom:neon-lock-card`, a card for `lock` entities
  with an animated icon (padlock, door or garage), a neon halo that follows
  the state, a confirmation before opening and an optional informative
  footer. Three sizes. See the [example](../../examples/README.md).
- [`alarm`](./alarm) — `custom:neon-alarm-card`, a card for
  `alarm_control_panel` entities with an animated shield, a neon halo that
  follows the state, mode selection, a code keypad and a footer with
  security sensors. Three sizes. See the [example](../../examples/README.md).
