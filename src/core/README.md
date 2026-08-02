# src/core

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccore-english)

Framework base compartido por todas las tarjetas de Neón Cards, construido
sobre [Lit](https://lit.dev) **sin decoradores** (`@property`, `@state`) —
usamos la forma clásica `static properties` para respetar el acuerdo nº10
("sin magia... evitar decoradores complejos").

- `base-card.ts` — `BaseNeonCard`, la clase que extiende toda tarjeta.
  Aporta el tipado de `hass` y los valores por defecto de `getCardSize()` /
  `getGridOptions()`.
- `gestures.ts` — gestión de gestos tap / hold / double-tap. El estado de
  cada gesto se guarda fuera de `render()` a propósito (ver comentario en
  el archivo).
- `actions.ts` — despacho del evento `hass-action` para `tap_action` /
  `hold_action` / `double_tap_action`.
- `info.ts` — `computeInfoDisplay`, calcula qué mostrar según
  `primary_info` / `secondary_info` (nombre, estado, último cambio...).

Solo código verdaderamente transversal vive aquí (ver acuerdo nº4). Nada
específico de Home Assistant que no sea genérico entre tarjetas — eso
pertenece a `src/ha`.

Vive dentro de `src/` como el resto de módulos (ver `../ha`, `../shared`,
`../utils`, `../cards`) — no es un paquete npm aparte.

Ver la [referencia de API completa](../../docs/es/api.md) para el detalle
de cada exportación.

---

<a id="srccore-english"></a>

# src/core (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccore)

Base framework shared by every Neón Cards card, built on
[Lit](https://lit.dev) **without decorators** (`@property`, `@state`) —
we use the classic `static properties` form to respect agreement nº10
("no magic... avoid complex decorators").

- `base-card.ts` — `BaseNeonCard`, the class every card extends. Provides
  `hass` typing and default `getCardSize()` / `getGridOptions()` values.
- `gestures.ts` — tap / hold / double-tap gesture handling. Each
  gesture's state is deliberately kept outside `render()` (see the
  comment in the file).
- `actions.ts` — dispatches the `hass-action` event for `tap_action` /
  `hold_action` / `double_tap_action`.
- `info.ts` — `computeInfoDisplay`, computes what to show based on
  `primary_info` / `secondary_info` (name, state, last changed...).

Only truly cross-cutting code lives here (see agreement nº4). Nothing
Home-Assistant-specific that isn't generic across cards — that belongs in
`src/ha`.

Lives inside `src/` like every other module (see `../ha`, `../shared`,
`../utils`, `../cards`) — it isn't a separate npm package.

See the [full API reference](../../docs/en/api.md) for details on every
export.
