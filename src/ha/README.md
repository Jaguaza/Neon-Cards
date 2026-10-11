# src/ha

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srcha-english)

Todo el código que depende directamente de Home Assistant: tipos del objeto
`hass`, eventos, helpers de estado de entidades (`sensors.ts`,
`climate.ts`) y lectura del histórico por WebSocket (`history.ts`).

Las tarjetas nunca hablan con Home Assistant directamente — pasan siempre
por aquí, para poder centralizar el rango de versiones soportadas
(acuerdo nº24). Se importa desde el resto del código como `../ha` (o
`@/ha` si se configura un alias de rutas).

---

<a id="srcha-english"></a>

# src/ha (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srcha)

All the code that depends directly on Home Assistant: `hass` object
types, events, entity state helpers (`sensors.ts`, `climate.ts`) and
history reading over WebSocket (`history.ts`).

Cards never talk to Home Assistant directly — they always go through
here, so the range of supported versions can be centralized (agreement
nº24). Imported from the rest of the code as `../ha` (or `@/ha` if a
path alias is configured).
