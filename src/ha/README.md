# src/ha

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srcha-english)

Todo el código que depende directamente de Home Assistant: tipos del objeto
`hass`, eventos, y helpers de estado de entidades.

Las tarjetas nunca hablan con Home Assistant directamente — pasan siempre
por aquí, para poder centralizar el rango de versiones soportadas
(acuerdo nº24). Se importa desde el resto del código como `../ha` (o
`@/ha` si se configura un alias de rutas).

---

<a id="srcha-english"></a>

# src/ha (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srcha)

All the code that depends directly on Home Assistant: `hass` object
types, events, and entity state helpers.

Cards never talk to Home Assistant directly — they always go through
here, so the range of supported versions can be centralized (agreement
nº24). Imported from the rest of the code as `../ha` (or `@/ha` if a
path alias is configured).
