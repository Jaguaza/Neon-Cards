# src/cards/sensor

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardssensor-english)

`custom:neon-sensor-card` — tarjeta de solo lectura para **una** entidad
`sensor` o `binary_sensor`. Muestra nombre, icono, valor con unidad,
estado y un gráfico del histórico dibujado como el trazo de un monitor
de constantes vitales. **El gráfico se muestra en los tamaños `normal` y
`large`** (el `compact` no lleva): lo que se elige es el efecto de color.

**Solo admite `sensor.*` y `binary_sensor.*`.** Con cualquier otro
dominio (`light.*`, `switch.*`, `climate.*`…) la tarjeta no se carga y
HA muestra un error de configuración; el editor visual solo ofrece
esos dos dominios. La lista sale de `SENSOR_DOMAINS` (`src/ha/sensors.ts`).

No lleva pie de sensores: es una tarjeta de una sola entidad.

## Tamaños

Se elige con `size` (como en la Thermostat Card). Hay tres: dos con
gráfico y uno sin gráfico.

| `size` | Tamaño | Gráfico | Columnas × filas (fijas) |
|---|---|---|---|
| `large` | Grande: el ancho máximo | Sí | 12 × 4 |
| `normal` (por defecto) | Mediano | Sí | 6 × 3 |
| `compact` | Pequeño: lo más pequeño posible | No | 3 × 2 |

Cada tamaño ocupa un hueco **fijo** en la rejilla de HA y no se puede
redimensionar desde el dashboard. El contenido está pensado para que su
alto no dependa del ancho de la tarjeta: el menú ⋮ no salta de línea, el
nombre ocupa como mucho dos líneas (el subtítulo se abrevia con «…»), el
valor va arriba y el gráfico rellena el alto que queda. Lo que no cupiera
se recorta dentro de la tarjeta, nunca se pinta fuera. En el pequeño se
ocultan el menú ⋮ y el subtítulo «Sensor» (tocar la tarjeta abre igualmente
«más información») y no se pide el histórico. Los tamaños están en
`SIZE_GRID` (`constants.ts`).

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
size: compact
```

## Config

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
name: Temperatura Exterior
```

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
name: Temperatura Exterior
subtitle: Jardín
icon: mdi:thermometer
decimals: 1
graph_hours: 24
neon_effect: halo
neon_palette: electric
thresholds_enabled: true
threshold_low: 22
threshold_high: 26
threshold_colors:
  low: "#4facfe"
  ok: "#39e07a"
  high: "#ff3d5a"
threshold_names:
  low: "Frío"
  ok: "Confort"
  high: "Calor"
tap_action:
  action: more-info
```

Para un `binary_sensor`, `alert_state` indica qué estado es la alerta:

```yaml
type: custom:neon-sensor-card
entity: binary_sensor.puerta_entrada
thresholds_enabled: true
alert_state: "on"
```

## Título y subtítulo

`name` es el título (por defecto, el nombre de la entidad) y `subtitle`
el texto que va debajo. Si no pones `subtitle`, o lo dejas en blanco, se
muestra el de siempre: «Sensor» o «Sensor binario». Para **no mostrar
ningún subtítulo** pon `show_subtitle: false` (en el editor, desmarca
«Mostrar subtítulo»); ese ajuste manda sobre `subtitle`, que se conserva
por si vuelves a activarlo. El subtítulo no depende del estado ni de los
umbrales, y no se muestra en el tamaño `compact`.

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
show_subtitle: false
```

## Efecto de color (`neon_effect`)

El efecto de color afecta **solo al gráfico y al icono**; el perímetro
de la tarjeta es independiente (ver «Umbrales de estado»).

- `halo` (por defecto): el gráfico en los tres colores de la paleta
  (`neon_palette` / `neon_color1/2/3`, ver la [Button Card](../button)),
  cada uno en su tramo de la línea, y un resplandor que lleva esos mismos
  tres colores. Con efecto de desplazamiento.
- `single`: un único color (`neon_color`, por defecto `#1ecdf2`) con el
  mismo efecto de desplazamiento.
- `normal`: sin efecto de desplazamiento y con el color del tema de HA
  (`--primary-color`); sin resplandor.

## Umbrales de estado (opcionales)

Con `thresholds_enabled: true` la lectura se valora como **Bajo**,
**Correcto** o **Alto**:

- `sensor`: por debajo de `threshold_low` es Bajo; por encima de
  `threshold_high` es Alto; entre ambos (los límites incluidos) es
  Correcto. Un límite sin definir no se evalúa. Ejemplo con 22 y 26:
  21,9 → Bajo · 22, 24 y 26 → Correcto · 26,1 → Alto.
- `binary_sensor`: Alto (texto «Alerta») si su estado coincide con
  `alert_state`; si no, Correcto.
- `threshold_colors` (`low`, `ok`, `high`): un color por nivel.
- `threshold_names` (`low`, `ok`, `high`): el nombre que se muestra en
  la etiqueta de estado de cada nivel. Los que no indiques (o dejes
  vacíos) usan el texto por defecto: Bajo / Correcto / Alto (Alerta en
  un `binary_sensor`).

**La etiqueta de estado bajo el valor solo se muestra con los umbrales
activados**; sin ellos no aparece. **El color del perímetro de la tarjeta (borde y resplandor) lo marcan
solo los umbrales**, con el color del nivel actual (y el texto de
estado). Es independiente del efecto de color: el gráfico y el icono no
cambian con el nivel. Con los umbrales desactivados (por defecto) el
perímetro se ve normal (borde del tema), sea cual sea el efecto, y no
hay etiqueta. Con umbrales activados la etiqueta solo aparece cuando
hay una valoración (Bajo / Correcto / Alto): sin datos
(`unavailable`/`unknown`) o con un estado de texto no hay etiqueta, pero
el perímetro sí conserva su color (neutro si no hay datos).

## Acciones

`tap_action`, `hold_action` y `double_tap_action` funcionan como en el
resto de tarjetas. Por defecto, tocar la tarjeta abre «más información»
de la entidad; mantener pulsado y el doble toque no hacen nada. El menú
⋮ abre siempre «más información».

## Gráfico

Lee el histórico con la llamada WebSocket `history/history_during_period`
(`src/ha/history.ts`): una consulta al empezar y otra cada 2 minutos por
tarjeta, que se detiene al desconectarla. Un `sensor` dibuja la curva
con aristas vivas (sin suavizar); un `binary_sensor`, una onda cuadrada
on/off. En `halo` y `single` una ventana luminosa barre la línea de
izquierda a derecha dejando una estela larga que se apaga; con
`prefers-reduced-motion` el trazo se muestra completo y quieto. La
tarjeta solo se repinta cuando cambia su propia entidad.

---

<a id="srccardssensor-english"></a>

# src/cards/sensor (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardssensor)

`custom:neon-sensor-card` — a read-only card for **one** `sensor` or
`binary_sensor` entity. It shows name, icon, value with unit, status
and a history graph drawn like the trace of a vital-signs monitor.
**The graph is shown in the `normal` and `large` sizes** (`compact` has
none): what you choose is the color effect.

**Only `sensor.*` and `binary_sensor.*` are accepted.** Any other domain
(`light.*`, `switch.*`, `climate.*`…) makes the card fail to load and HA
shows a configuration error; the visual editor only offers those two
domains. The list comes from `SENSOR_DOMAINS` (`src/ha/sensors.ts`).

It has no sensor footer: it is a single-entity card.

## Sizes

Chosen with `size` (like the Thermostat Card). There are three: two with
a graph and one without.

| `size` | Size | Graph | Columns × rows (fixed) |
|---|---|---|---|
| `large` | Large: full width | Yes | 12 × 4 |
| `normal` (default) | Medium | Yes | 6 × 3 |
| `compact` | Small: as small as possible | No | 3 × 2 |

Each size takes a **fixed** slot in the HA grid and cannot be resized from
the dashboard. The content is built so that its height does not depend on
the card's width: the ⋮ menu never wraps onto its own line, the name takes
at most two lines (the subtitle is cut with "…"), the value sits on top
and the graph fills the remaining height. Anything that doesn't fit is
clipped inside the card, never drawn outside it. In small the ⋮ menu and
the "Sensor" subtitle are hidden (tapping the card still opens "more
info") and history is not requested. The sizes live in `SIZE_GRID`
(`constants.ts`).

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
size: compact
```

## Config

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
name: Outdoor Temperature
```

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
name: Outdoor Temperature
subtitle: Garden
icon: mdi:thermometer
decimals: 1
graph_hours: 24
neon_effect: halo
neon_palette: electric
thresholds_enabled: true
threshold_low: 22
threshold_high: 26
threshold_colors:
  low: "#4facfe"
  ok: "#39e07a"
  high: "#ff3d5a"
threshold_names:
  low: "Frío"
  ok: "Confort"
  high: "Calor"
tap_action:
  action: more-info
```

For a `binary_sensor`, `alert_state` says which state is the alert:

```yaml
type: custom:neon-sensor-card
entity: binary_sensor.front_door
thresholds_enabled: true
alert_state: "on"
```

## Title and subtitle

`name` is the title (by default, the entity's name) and `subtitle` is
the text under it. If you leave `subtitle` out, or blank, the usual one
is shown: "Sensor" or "Binary sensor". To **show no subtitle at all**
set `show_subtitle: false` (in the editor, untick "Show subtitle"); it
takes precedence over `subtitle`, which is kept in case you turn it back
on. The subtitle does not depend on the state or the thresholds, and is
not shown at the `compact` size.

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
show_subtitle: false
```

## Color effect (`neon_effect`)

The color effect applies **only to the graph and the icon**; the card's
perimeter is independent (see "State thresholds").

- `halo` (default): the graph in the palette's three colors
  (`neon_palette` / `neon_color1/2/3`, see the [Button Card](../button)),
  each in its own stretch of the line, and a glow carrying those same
  three colors. With the sweep effect.
- `single`: one color (`neon_color`, default `#1ecdf2`) with the same
  sweep effect.
- `normal`: no sweep effect and the HA theme color (`--primary-color`);
  no glow.

## State thresholds (optional)

With `thresholds_enabled: true` the reading is rated **Low**, **OK** or
**High**:

- `sensor`: below `threshold_low` is Low; above `threshold_high` is
  High; in between (limits included) is OK. An unset limit is not
  evaluated. Example with 22 and 26: 21.9 → Low · 22, 24 and 26 → OK ·
  26.1 → High.
- `binary_sensor`: High (text "Alert") when its state matches
  `alert_state`; otherwise OK.
- `threshold_colors` (`low`, `ok`, `high`): one color per level.
- `threshold_names` (`low`, `ok`, `high`): the name shown in each
  level's status label. Any you don't set (or leave empty) use the
  default text: Low / OK / High (Alert on a `binary_sensor`).

**The status label under the value is only shown with thresholds
enabled**; without them it does not appear. **The color of the card's perimeter (border and glow) is set only by
the thresholds**, with the current level's color (and the status text).
It is independent of the color effect: the graph and the icon do not
change with the level. With thresholds disabled (default) the perimeter
looks normal (theme border) whatever the effect, and there is no
label. With thresholds on, the label only appears when there is a
rating (Low / OK / High): with no data (`unavailable`/`unknown`) or a
text state there is no label, but the perimeter keeps its color
(neutral when there is no data).

## Actions

`tap_action`, `hold_action` and `double_tap_action` work as in the other
cards. By default, tapping the card opens the entity's "more info";
hold and double tap do nothing. The ⋮ menu always opens "more info".

## Graph

It reads history through the `history/history_during_period` WebSocket
call (`src/ha/history.ts`): one query on start and another every 2
minutes per card, stopped when the card disconnects. A `sensor` draws a
sharp-edged curve (not smoothed); a `binary_sensor` draws an on/off
square wave. In `halo` and `single` a bright window sweeps the line left
to right, leaving a fading trail; with `prefers-reduced-motion` the full
trace is shown still. The card only re-renders when its own entity
changes.
