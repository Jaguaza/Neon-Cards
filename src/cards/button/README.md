# src/cards/button

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardsbutton-english)

`custom:neon-button-card` — botón de acción para Home Assistant. Entidad
principal opcional: puede navegar, abrir un popup/more-info, ejecutar un
script/servicio, o representar una habitación/zona sin estar ligado a
ningún dominio concreto.

Identidad visual: icono protagonista y aro neón animado (se dibuja en
dos direcciones desde la esquina superior izquierda, encontrándose en
la inferior derecha) en estado activo — reutiliza la misma paleta y el
mismo framework (`src/core`, `src/shared`, `src/ha`) que la
[Entity Card](../entity), sin copiar su diseño.

El ancho y el alto de la tarjeta se calculan solos según el contenido
(`getGridOptions()`, filas automáticas + columnas según el número de
sensores agrupados) — no hace falta indicar `grid_options` a mano salvo
para forzar un tamaño distinto al calculado.

## Paleta de colores

```yaml
neon_palette: emerald
# emerald | cyberpunk | electric | sunset | toxic | custom
neon_color1: "#39e07a"
neon_color2: "#2dd6b8"
neon_color3: "#1ecdf2"
```

`neon_color1/2/3` solo se leen cuando `neon_palette: custom`; con
cualquier otro valor de `neon_palette` se ignoran y se usan los colores
del preset.

## Config

```yaml
type: custom:neon-button-card
name: Salón
subtitle: Planta Baja
icon: mdi:sofa
tap_action:
  action: navigate
  navigation_path: /lovelace/salon
sensors:
  - entity: sensor.salon_temperature
  - entity: sensor.salon_humidity
```

La entidad es opcional; cuando se define, su estado determina el halo
activo y el icono/nombre por defecto:

```yaml
type: custom:neon-button-card
entity: light.salon
subtitle: Luces
tap_action:
  action: toggle
top_sensor:
  entity: sensor.salon_power
sensors:
  - entity: sensor.salon_temperature
  - entity: sensor.salon_humidity
```

Los sensores solo aceptan los dominios `sensor` y `binary_sensor`; su
icono, estado y unidad se leen automáticamente de Home Assistant, siempre
con icono + estado + unidad.

- `top_sensor` (opcional): un único sensor suelto, encima del divisor,
  sin agrupar.
- `sensors` (opcional, máximo 3): fila agrupada bajo el divisor, con un
  separador vertical entre cada uno para mantenerla legible.

Cada sensor (`top_sensor` o cualquier elemento de `sensors`) admite
`icon` (si no se indica, se calcula automáticamente por `device_class`)
y `decimals` (por defecto 1) para redondear el estado:

```yaml
top_sensor:
  entity: sensor.salon_power
  icon: mdi:flash
  decimals: 0
sensors:
  - entity: sensor.salon_temperature
    decimals: 1
  - entity: sensor.salon_humidity
    icon: mdi:water-percent
    decimals: 0
```

Los iconos de los sensores se comportan igual que el icono principal:
neutros en reposo, con el color y el resplandor de la paleta neón solo
cuando la tarjeta está en estado activo.

## Subtítulo

`subtitle` es texto libre por defecto (`subtitle_type: custom`, el
valor por defecto). Con `subtitle_type` se puede calcular a partir de la
entidad en su lugar — reutiliza el mismo helper `computeInfoDisplay` de
`src/core` que usa `primary_info`/`secondary_info` en la Entity Card, no
hay lógica separada:

```yaml
entity: light.salon
subtitle_type: state
# subtitle_type: name | state | last-changed | last-updated | custom
```

`name`/`state`/`last-changed`/`last-updated` necesitan `entity`
configurada; sin ella, solo `custom` tiene algo que mostrar.

---

<a id="srccardsbutton-english"></a>

# src/cards/button (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardsbutton)

`custom:neon-button-card` — an action button for Home Assistant. The
main entity is optional: it can navigate, open a popup/more-info, run a
script/service, or represent a room/zone without being tied to any
particular domain.

Visual identity: a hero icon and an animated neon ring (draws in two
directions from the top-left corner, meeting at the bottom-right) when
active — reuses the same palette and framework (`src/core`,
`src/shared`, `src/ha`) as the [Entity Card](../entity) without copying
its design.

The card's width and height are computed automatically from its content
(`getGridOptions()`, automatic rows + columns based on the number of
grouped sensors) — no need to set `grid_options` by hand unless you want
to force a different size than the computed one.

## Color palette

```yaml
neon_palette: emerald
# emerald | cyberpunk | electric | sunset | toxic | custom
neon_color1: "#39e07a"
neon_color2: "#2dd6b8"
neon_color3: "#1ecdf2"
```

`neon_color1/2/3` are only read when `neon_palette: custom`; with any
other `neon_palette` value they're ignored and the preset's colors are
used instead.

## Config

```yaml
type: custom:neon-button-card
name: Living Room
subtitle: Ground Floor
icon: mdi:sofa
tap_action:
  action: navigate
  navigation_path: /lovelace/living-room
sensors:
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
```

The entity is optional; when set, its state drives the active halo and
the default icon/name:

```yaml
type: custom:neon-button-card
entity: light.living_room
subtitle: Lights
tap_action:
  action: toggle
top_sensor:
  entity: sensor.living_room_power
sensors:
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
```

Sensors only accept the `sensor` and `binary_sensor` domains; their
icon, state, and unit are always read automatically from Home Assistant.

- `top_sensor` (optional): a single, ungrouped sensor above the divider.
- `sensors` (optional, max 3): the grouped row below the divider, with a
  vertical separator between each one to keep it readable.

Each sensor (`top_sensor` or any item in `sensors`) accepts `icon` (auto
by `device_class` when omitted) and `decimals` (defaults to 1) to round
the state:

```yaml
top_sensor:
  entity: sensor.living_room_power
  icon: mdi:flash
  decimals: 0
sensors:
  - entity: sensor.living_room_temperature
    decimals: 1
  - entity: sensor.living_room_humidity
    icon: mdi:water-percent
    decimals: 0
```

Sensor icons behave like the main icon: neutral at rest, and colored
with the neon glow only when the card is in its active state.

## Subtitle

`subtitle` is free text by default (`subtitle_type: custom`, the
default). Set `subtitle_type` to compute it from the entity instead —
reuses the same `computeInfoDisplay` helper from `src/core` as the
Entity Card's `primary_info`/`secondary_info`, no separate logic:

```yaml
entity: light.living_room
subtitle_type: state
# subtitle_type: name | state | last-changed | last-updated | custom
```

`name`/`state`/`last-changed`/`last-updated` all need `entity` set;
without it, only `custom` has anything to show.
