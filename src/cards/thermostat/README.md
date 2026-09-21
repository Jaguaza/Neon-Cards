# src/cards/thermostat

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardsthermostat-english)

`custom:neon-thermostat-card` — control de climatización para Home
Assistant sobre una entidad `climate`, con la identidad visual de Neón
Cards. Admite opcionalmente una segunda entidad `climate` (`entity_2`)
para representar dos equipos separados (p. ej. calefacción + aire
acondicionado) como si fueran uno solo.

Identidad visual: dial/aro semicircular (180°) arrastrable que
controla la consigna, con el color del modo HVAC activo — reutiliza el
mismo framework (`src/core`, `src/shared`, `src/ha`) que
[Entity](../entity) y [Button](../button), sin copiar su diseño.

A diferencia de Button, el tamaño **no** se calcula del contenido:
se elige con la clave `size` (`'large' | 'normal' | 'compact'`,
por defecto `'normal'`), cada uno con su propio layout — el dial
completo solo se ve en `large`; `normal`/`compact` usan un indicador
circular más pequeño, y `compact` no muestra footer de sensores.

## Config mínima

```yaml
type: custom:neon-thermostat-card
entity: climate.salon
```

## Config avanzada — dos entidades

```yaml
type: custom:neon-thermostat-card
name: Salón
entity: climate.salon_calor
entity_2: climate.salon_frio
mode_owner:
  heat_cool: 1
size: large
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
neon_palette: cyberpunk
footer:
  - entity: sensor.salon_temperature
  - entity: sensor.salon_humidity
```

Con `entity_2`, el selector de modo muestra la UNIÓN de los modos de
ambas entidades. Un modo que solo soporta una de las dos lo gestiona
esa; uno que soportan las dos lo gestiona `entity` por defecto, con
override por modo en `mode_owner` (`1` = `entity`, `2` = `entity_2`).

**Exclusión mutua:** las dos entidades nunca quedan activas en modos
**distintos** a la vez — si una cambia a un modo distinto del de la
otra (desde la tarjeta, desde el diálogo nativo de la entidad, o desde
una automatización), la tarjeta apaga automáticamente la que no acaba
de cambiar. Si ambas acaban en el **mismo** modo, se dejan las dos
activas sin tocar nada.

## Paleta de colores

`color` pinta el dial/aro según el modo HVAC — no confundir con
`neon_palette`, que solo afecta al aro perimetral de la tarjeta:

```yaml
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
  # heat_cool / auto / dry / fan_only / off también aceptados;
  # los modos no indicados caen al color semántico por defecto
```

```yaml
neon_palette: cyberpunk
# emerald | cyberpunk | electric | sunset | toxic | custom
neon_color1: "#39e07a"
neon_color2: "#2dd6b8"
neon_color3: "#1ecdf2"
```

## Footer de sensores

Igual que Button: solo dominios `sensor`/`binary_sensor`, máximo 3,
icono calculado automáticamente por `device_class` si no se indica
uno propio. No se muestra en la vista compacta.

```yaml
footer:
  - entity: sensor.salon_temperature
  - entity: sensor.salon_humidity
  - entity: binary_sensor.salon_presencia
    icon: mdi:motion-sensor
```

Ver la [referencia de API completa](../../../docs/es/api.md) para el
detalle de cada opción.

---

<a id="srccardsthermostat-english"></a>

# src/cards/thermostat (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardsthermostat)

`custom:neon-thermostat-card` — climate control for Home Assistant on
top of a `climate` entity, with the Neón Cards visual identity. It
optionally supports a second `climate` entity (`entity_2`) to
represent two separate units (e.g. heating + AC) as if they were one.

Visual identity: a draggable semicircular (180°) dial/ring that
controls the setpoint, colored by the active HVAC mode — reuses the
same framework (`src/core`, `src/shared`, `src/ha`) as
[Entity](../entity) and [Button](../button), without copying their
design.

Unlike Button, the size is **not** computed from content: it's chosen
with the `size` key (`'large' | 'normal' | 'compact'`, defaulting to
`'normal'`), each with its own layout — the full dial only appears in
`large`; `normal`/`compact` use a smaller circular indicator, and
`compact` shows no sensor footer.

## Minimal config

```yaml
type: custom:neon-thermostat-card
entity: climate.living_room
```

## Advanced config — two entities

```yaml
type: custom:neon-thermostat-card
name: Living Room
entity: climate.living_room_heat
entity_2: climate.living_room_cool
mode_owner:
  heat_cool: 1
size: large
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
neon_palette: cyberpunk
footer:
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
```

With `entity_2`, the mode selector shows the UNION of both entities'
modes. A mode only one of them supports is handled by that one; a mode
both support defaults to `entity`, with a per-mode override in
`mode_owner` (`1` = `entity`, `2` = `entity_2`).

**Mutual exclusion:** the two entities are never left active in
**different** modes at the same time — if one changes to a mode
different from the other's (from the card, from the entity's native
dialog, or from an automation), the card automatically turns off the
one that didn't just change. If both end up in the **same** mode, both
stay on untouched.

## Color palette

`color` paints the dial/ring based on the HVAC mode — not to be
confused with `neon_palette`, which only affects the card's perimeter
ring:

```yaml
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
  # heat_cool / auto / dry / fan_only / off are also accepted;
  # modes left unset fall back to their semantic default color
```

```yaml
neon_palette: cyberpunk
# emerald | cyberpunk | electric | sunset | toxic | custom
neon_color1: "#39e07a"
neon_color2: "#2dd6b8"
neon_color3: "#1ecdf2"
```

## Sensor footer

Same as Button: only `sensor`/`binary_sensor` domains, max 3, icon
computed automatically from `device_class` when none is given. Not
shown in the compact view.

```yaml
footer:
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
  - entity: binary_sensor.living_room_motion
    icon: mdi:motion-sensor
```

See the [full API reference](../../../docs/en/api.md) for details on
every option.
