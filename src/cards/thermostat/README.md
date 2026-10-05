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

## Preset y ventilador (vista grande)

En la vista `large`, bajo la píldora de consigna, el selector de modo
HVAC puede ir acompañado de otros dos si la entidad los soporta:

| Píldora | Se muestra si la entidad expone… | Servicio |
|---|---|---|
| Modo HVAC | siempre | `climate.set_hvac_mode` |
| Preset | `preset_modes` | `climate.set_preset_mode` |
| Ventilador | `fan_modes` | `climate.set_fan_mode` |

- Se reparten el ancho a partes iguales (1, 2 o 3 píldoras); con tres,
  desaparece el chevron y los textos largos se cortan con «…».
- Los nombres vienen traducidos por Home Assistant; si tu versión no
  ofrece ese formateador, se muestra el valor crudo con la primera
  letra en mayúscula.
- Con `entity_2`, preset y ventilador son los de la entidad que se está
  mostrando (la activa, o la última activa si las dos están apagadas):
  cada equipo tiene los suyos y no se mezclan.
- En `normal` y `compact` solo existe el selector de modo.
- No hay clave de configuración: aparecen solas.

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

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `neon-thermostat-card.ts` | Tarjeta: estado, servicios, arrastre y ciclo de vida |
| `dial-views.ts` | Cuerpo de cada vista (dial grande, aro normal, compacta) |
| `header.ts` · `footer.ts` | Cabecera con accesos «más información» y pie de sensores |
| `target-pill.ts` · `selector-pill.ts` | Píldora −/+ de consigna y píldora-selector (modo, preset, ventilador) |
| `combined-climate.ts` | Estado mostrado y exclusión mutua con 1 o 2 entidades |
| `dial-geometry.ts` | Geometría pura del arco (ángulos, puntos, trazo SVG) |
| `*-styles.ts` | Estilos por zona (tarjeta, dial, aro, píldora de consigna, modo y pie) |
| `neon-thermostat-card-editor.ts` | Editor visual |
| `constants.ts` · `types.ts` · `translations/` | Constantes, tipos y textos (es/en) |

La lectura de `climate` (`getClimateState`, `clampToStep`,
`isClimateRunning`, `formatClimateOption`) está en
[`src/ha/climate.ts`](../../ha/climate.ts).

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

## Preset and fan (large view)

In the `large` view, below the target pill, the HVAC mode selector can
be joined by two more if the entity supports them:

| Pill | Shown if the entity exposes… | Service |
|---|---|---|
| HVAC mode | always | `climate.set_hvac_mode` |
| Preset | `preset_modes` | `climate.set_preset_mode` |
| Fan | `fan_modes` | `climate.set_fan_mode` |

- They share the width equally (1, 2 or 3 pills); with three, the
  chevron disappears and long texts are cut with "…".
- Names come translated by Home Assistant; if your version does not
  offer that formatter, the raw value is shown with the first letter
  capitalized.
- With `entity_2`, preset and fan belong to the entity currently shown
  (the active one, or the last active one if both are off): each device
  has its own and they are not mixed.
- In `normal` and `compact` only the mode selector exists.
- There is no configuration key: they appear on their own.

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

## File structure

| File | Responsibility |
|---|---|
| `neon-thermostat-card.ts` | Card: state, services, dragging and lifecycle |
| `dial-views.ts` | Body of each view (large dial, normal ring, compact) |
| `header.ts` · `footer.ts` | Header with "more info" buttons and the sensor footer |
| `target-pill.ts` · `selector-pill.ts` | −/+ target pill and selector pill (mode, preset, fan) |
| `combined-climate.ts` | Displayed state and mutual exclusion with 1 or 2 entities |
| `dial-geometry.ts` | Pure arc geometry (angles, points, SVG path) |
| `*-styles.ts` | Styles per area (card, dial, ring, target pill, mode and footer) |
| `neon-thermostat-card-editor.ts` | Visual editor |
| `constants.ts` · `types.ts` · `translations/` | Constants, types and texts (es/en) |

The `climate` reading logic (`getClimateState`, `clampToStep`,
`isClimateRunning`, `formatClimateOption`) lives in
[`src/ha/climate.ts`](../../ha/climate.ts).

See the [full API reference](../../../docs/en/api.md) for details on
every option.
