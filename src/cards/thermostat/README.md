# src/cards/thermostat

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardsthermostat-english)

`custom:neon-thermostat-card` — tarjeta para controlar una o dos
entidades `climate` de Home Assistant con la identidad gráfica de Neón
Cards. Reutiliza el mismo framework (`src/core`, `src/shared`, `src/ha`)
que [Entity](../entity) y [Button](../button).

## Tamaños (`size`)

| Valor | Vista | Columnas del grid |
|---|---|---|
| `large` | Dial semicircular de 180° con la consigna arrastrable | `12` |
| `normal` (por defecto) | Aro semicircular alrededor de la temperatura actual, también arrastrable | `6` |
| `compact` | Línea recta con un punto que se desplaza según la consigna, arrastrable | `4` |

En las tres vistas la consigna también se ajusta con la píldora **−/+**,
y el selector de modo HVAC aparece debajo. El alto se calcula solo
(`rows: 'auto'`); no hace falta indicar `grid_options` salvo para forzar
otro tamaño. La vista `compact` no lleva pie de sensores.

## Config

```yaml
type: custom:neon-thermostat-card
entity: climate.salon
name: Salón
size: normal
```

Solo `entity` es obligatoria y debe ser del dominio `climate`; si falta,
`setConfig` lanza un error.

## Dos entidades (`entity_2`)

Para dos equipos separados (por ejemplo calefacción + aire
acondicionado) en una sola tarjeta:

```yaml
type: custom:neon-thermostat-card
entity: climate.calefaccion
entity_2: climate.aire_acondicionado
mode_owner:
  fan_only: 2
```

- El selector muestra la unión de los modos de ambas entidades.
- Cada modo lo gestiona la primera entidad que lo soporta. Solo si
  **ambas** lo soportan, `mode_owner` (`1` = `entity`, `2` = `entity_2`)
  decide cuál lo gestiona.
- La tarjeta muestra la entidad activa; si las dos están en `off`, la
  última que estuvo activa (o la primera configurada si ninguna lo
  estuvo).
- Cada entidad tiene arriba a la derecha un botón que abre su diálogo de
  «más información».

## Colores por modo (`color`)

```yaml
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
```

- `color: "#39e07a"` — un único color para todos los modos.
- `color: { mode: state }` — colores semánticos por modo (equivale a no
  indicar `color`).
- `color: { mode: custom, <modo>: "#hex" }` — color propio por modo
  (`heat`, `cool`, `heat_cool`, `auto`, `dry`, `fan_only`); los modos
  sin color caen al semántico por defecto.

El modo `off` usa siempre el color de texto del tema (neutro en reposo),
con cualquier valor de `color`.

El icono se deriva siempre del modo HVAC actual y no es configurable.
Solo se ofrecen los modos que la entidad expone en `hvac_modes`.

## Paso (`step`)

```yaml
step: 0.5
```

Salto de los controles −/+ y del arrastre. Si no se indica, se usa el
`target_temp_step` de la entidad, y si tampoco existe, `0.5`.

## Pie de sensores (`footer`)

```yaml
footer:
  - entity: sensor.salon_humidity
  - entity: sensor.salon_power
    icon: mdi:flash
```

Hasta 3 sensores (`sensor` o `binary_sensor`) bajo la tarjeta, con
icono + estado + unidad leídos de Home Assistant. No se muestran en la
vista `compact`.

## Paleta del aro (`neon_palette`)

```yaml
neon_palette: emerald
# emerald | cyberpunk | electric | sunset | toxic | custom
neon_color1: "#39e07a"
neon_color2: "#2dd6b8"
neon_color3: "#1ecdf2"
```

Es la paleta del **aro perimetral** de la tarjeta (el borde). El
dial/aro de temperatura sigue su propio color por modo (`color`).
`neon_color1/2/3` solo se leen con `neon_palette: custom`.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `neon-thermostat-card.ts` | Tarjeta (render, arrastre, estado del aro) |
| `neon-thermostat-card.styles.ts` | Estilos de la tarjeta |
| `neon-thermostat-card-editor.ts` | Editor visual |
| `combined-climate.ts` | Estado mostrado cuando hay 1 o 2 entidades |
| `dial-geometry.ts` | Geometría del arco (puntos y trazo SVG) |
| `constants.ts` / `types.ts` | Constantes y tipos de configuración |
| `translations/` | Textos de la interfaz de configuración (por ahora solo español) |

La lógica de lectura de `climate` (`getClimateState`, `clampToStep`,
`isClimateRunning`) vive en [`src/ha/climate.ts`](../../ha/climate.ts).
Ver [`docs/es/api.md`](../../../docs/es/api.md) y los
[ejemplos](../../../examples/README.md).

---

<a id="srccardsthermostat-english"></a>

# src/cards/thermostat (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardsthermostat)

`custom:neon-thermostat-card` — card to control one or two Home Assistant
`climate` entities with the Neón Cards visual identity. It reuses the
same framework (`src/core`, `src/shared`, `src/ha`) as
[Entity](../entity) and [Button](../button).

## Sizes (`size`)

| Value | View | Grid columns |
|---|---|---|
| `large` | 180° semicircular dial with a draggable target | `12` |
| `normal` (default) | Semicircular ring around the current temperature, also draggable | `6` |
| `compact` | Straight line with a dot that moves with the target, draggable | `4` |

In all three views the target can also be adjusted with the **−/+**
pill, and the HVAC mode selector sits below. The height is computed
automatically (`rows: 'auto'`); `grid_options` is only needed to force a
different size. The `compact` view has no sensor footer.

## Config

```yaml
type: custom:neon-thermostat-card
entity: climate.living_room
name: Living room
size: normal
```

Only `entity` is required and it must be in the `climate` domain; if it
is missing, `setConfig` throws an error.

## Two entities (`entity_2`)

For two separate devices (for example heating + air conditioning) in a
single card:

```yaml
type: custom:neon-thermostat-card
entity: climate.heating
entity_2: climate.air_conditioning
mode_owner:
  fan_only: 2
```

- The selector shows the union of both entities' modes.
- Each mode is handled by the first entity that supports it. Only when
  **both** support it does `mode_owner` (`1` = `entity`, `2` =
  `entity_2`) decide which one handles it.
- The card shows the active entity; if both are `off`, the last one that
  was active (or the first configured one if neither ever was).
- Each entity has a button at the top right that opens its "more info"
  dialog.

## Colors per mode (`color`)

```yaml
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
```

- `color: "#39e07a"` — a single color for every mode.
- `color: { mode: state }` — semantic colors per mode (same as omitting
  `color`).
- `color: { mode: custom, <mode>: "#hex" }` — your own color per mode
  (`heat`, `cool`, `heat_cool`, `auto`, `dry`, `fan_only`); modes without
  a color fall back to their semantic default.

The `off` mode always uses the theme's text color (neutral at rest),
whatever the value of `color`.

The icon is always derived from the current HVAC mode and is not
configurable. Only the modes the entity exposes in `hvac_modes` are
offered.

## Step (`step`)

```yaml
step: 0.5
```

Step of the −/+ controls and of dragging. If omitted, the entity's
`target_temp_step` is used, and if that does not exist either, `0.5`.

## Sensor footer (`footer`)

```yaml
footer:
  - entity: sensor.living_room_humidity
  - entity: sensor.living_room_power
    icon: mdi:flash
```

Up to 3 sensors (`sensor` or `binary_sensor`) below the card, with icon
+ state + unit read from Home Assistant. They are not shown in the
`compact` view.

## Ring palette (`neon_palette`)

```yaml
neon_palette: emerald
# emerald | cyberpunk | electric | sunset | toxic | custom
neon_color1: "#39e07a"
neon_color2: "#2dd6b8"
neon_color3: "#1ecdf2"
```

This is the palette of the card's **perimeter ring** (the border). The
temperature dial/ring follows its own per-mode color (`color`).
`neon_color1/2/3` are only read with `neon_palette: custom`.

## Files

| File | Responsibility |
|---|---|
| `neon-thermostat-card.ts` | Card (render, dragging, ring state) |
| `neon-thermostat-card.styles.ts` | Card styles |
| `neon-thermostat-card-editor.ts` | Visual editor |
| `combined-climate.ts` | Displayed state when there are 1 or 2 entities |
| `dial-geometry.ts` | Arc geometry (points and SVG path) |
| `constants.ts` / `types.ts` | Constants and configuration types |
| `translations/` | Configuration UI texts (Spanish only for now) |

The `climate` reading logic (`getClimateState`, `clampToStep`,
`isClimateRunning`) lives in [`src/ha/climate.ts`](../../ha/climate.ts).
See [`docs/en/api.md`](../../../docs/en/api.md) and the
[examples](../../../examples/README.md).
