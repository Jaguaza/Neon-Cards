# src/cards/button

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardsbutton-english)

`custom:neon-button-card` — botón de acción para Home Assistant. Entidad
principal opcional: puede navegar, abrir un popup/more-info, ejecutar un
script/servicio, o representar una habitación/zona sin estar ligado a
ningún dominio concreto.

Identidad visual: cristal (glassmorphism), icono protagonista y halo
neón exterior en estado activo — reutiliza la misma paleta y el mismo
framework (`src/core`, `src/shared`, `src/ha`) que la
[Entity Card](../entity), sin copiar su diseño.

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

---

<a id="srccardsbutton-english"></a>

# src/cards/button (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardsbutton)

`custom:neon-button-card` — an action button for Home Assistant. The
main entity is optional: it can navigate, open a popup/more-info, run a
script/service, or represent a room/zone without being tied to any
particular domain.

Visual identity: glassmorphism, a hero icon, and an outer neon halo when
active — reuses the same palette and framework (`src/core`,
`src/shared`, `src/ha`) as the [Entity Card](../entity) without copying
its design.

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
