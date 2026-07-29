# src/core

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

Solo código verdaderamente transversal vive aquí (ver acuerdo nº4). Nada
específico de Home Assistant que no sea genérico entre tarjetas — eso
pertenece a `src/ha`.

Vive dentro de `src/` como el resto de módulos (ver `../ha`, `../shared`,
`../utils`, `../cards`) — no es un paquete npm aparte.
