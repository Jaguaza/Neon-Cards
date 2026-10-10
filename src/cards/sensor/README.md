# src/cards/sensor

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardssensor-english)

`custom:neon-sensor-card` — tarjeta de solo lectura para **una** entidad
`sensor` o `binary_sensor`. Muestra nombre, icono, valor con unidad,
estado y un gráfico del histórico dibujado como el trazo de un monitor
de constantes vitales. **El gráfico siempre está visible**: lo que se
elige es el efecto de color.

**Solo admite `sensor.*` y `binary_sensor.*`.** Con cualquier otro
dominio (`light.*`, `switch.*`, `climate.*`…) la tarjeta no se carga y
HA muestra un error de configuración; el editor visual solo ofrece
esos dos dominios. La lista sale de `SENSOR_DOMAINS` (`src/ha/sensors.ts`).

No lleva pie de sensores: es una tarjeta de una sola entidad.

## Tamaños

El tamaño se adapta solo al ancho real de la tarjeta en el grid de HA
(no hay clave `size`): **compacta** (< 230 px: el espacio no da para el
gráfico y se oculta), **normal** y **grande** (≥ 380 px: icono, valor y
gráfico mayores).

## Config

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
name: Temperatura Exterior
```

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
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

## Efecto de color (`neon_effect`)

- `halo` (por defecto): halo de tres colores como en el resto de
  tarjetas Neón (aro de tres colores alrededor de la tarjeta). Se elige
  con `neon_palette` / `neon_color1/2/3` (ver la [Button Card](../button)).
  El gráfico se ve en esos tres colores de principio a fin, con efecto
  de desplazamiento.
- `single`: un único color (`neon_color`, por defecto `#1ecdf2`) con
  borde resplandeciente y el mismo efecto de desplazamiento.
- `normal`: sin efecto de desplazamiento y con el color del tema de HA
  (`--primary-color`); la tarjeta no añade halo ni resplandor.

## Umbrales de estado (opcionales)

Con `thresholds_enabled: true` la lectura se valora como **Bajo**,
**Correcto** o **Alto**:

- `sensor`: por debajo de `threshold_low` es Bajo; por encima de
  `threshold_high` es Alto; entre ambos (los límites incluidos) es
  Correcto. Un límite sin definir no se evalúa. Ejemplo con 22 y 26:
  21,9 → Bajo · 22, 24 y 26 → Correcto · 26,1 → Alto.
- `binary_sensor`: Alto (texto «Alerta») si su estado coincide con
  `alert_state`; si no, Correcto.
- `threshold_colors` (`low`, `ok`, `high`): un color por nivel. El
  color del nivel sustituye al del efecto en la tarjeta y el gráfico
  (también en `halo`, donde pasa a ser de un solo color).

Con los umbrales desactivados (por defecto) el estado es «Normal» y se
usan los colores del efecto. Un estado no numérico (texto) también es
«Normal». `unavailable`/`unknown` → «Sin señal», con color neutro.

## Gráfico

Lee el histórico con la llamada WebSocket `history/history_during_period`
(`src/ha/history.ts`): una consulta al empezar y otra cada 2 minutos por
tarjeta, que se detiene al desconectarla. Un `sensor` dibuja la curva
con aristas vivas (sin suavizar); un `binary_sensor`, una onda cuadrada
on/off. En `halo` y `single` una ventana luminosa barre la línea de
izquierda a derecha dejando una estela que se apaga; con
`prefers-reduced-motion` el trazo se muestra completo y quieto. La
tarjeta solo se repinta cuando cambia su propia entidad.

---

<a id="srccardssensor-english"></a>

# src/cards/sensor (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardssensor)

`custom:neon-sensor-card` — a read-only card for **one** `sensor` or
`binary_sensor` entity. It shows name, icon, value with unit, status
and a history graph drawn like the trace of a vital-signs monitor.
**The graph is always visible**: what you choose is the color effect.

**Only `sensor.*` and `binary_sensor.*` are accepted.** Any other domain
(`light.*`, `switch.*`, `climate.*`…) makes the card fail to load and HA
shows a configuration error; the visual editor only offers those two
domains. The list comes from `SENSOR_DOMAINS` (`src/ha/sensors.ts`).

It has no sensor footer: it is a single-entity card.

## Sizes

Size adapts to the card's real width in the HA grid (there is no `size`
key): **compact** (< 230 px: there is no room for the graph, so it is
hidden), **normal** and **large** (≥ 380 px: bigger icon, value and
graph).

## Config

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
name: Outdoor Temperature
```

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
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

## Color effect (`neon_effect`)

- `halo` (default): three-color halo like the other Neón cards (a
  three-color ring around the card). Chosen with `neon_palette` /
  `neon_color1/2/3` (see the [Button Card](../button)). The graph is
  drawn in those three colors from start to end, with the sweep effect.
- `single`: one color (`neon_color`, default `#1ecdf2`) with a glowing
  border and the same sweep effect.
- `normal`: no sweep effect and the HA theme color (`--primary-color`);
  the card adds no halo or glow.

## State thresholds (optional)

With `thresholds_enabled: true` the reading is rated **Low**, **OK** or
**High**:

- `sensor`: below `threshold_low` is Low; above `threshold_high` is
  High; in between (limits included) is OK. An unset limit is not
  evaluated. Example with 22 and 26: 21.9 → Low · 22, 24 and 26 → OK ·
  26.1 → High.
- `binary_sensor`: High (text "Alert") when its state matches
  `alert_state`; otherwise OK.
- `threshold_colors` (`low`, `ok`, `high`): one color per level. The
  level color replaces the effect's color on the card and the graph
  (also in `halo`, where it becomes a single color).

With thresholds disabled (default) the status is "Normal" and the
effect's colors are used. A non-numeric (text) state is also "Normal".
`unavailable`/`unknown` → "No signal", in a neutral color.

## Graph

It reads history through the `history/history_during_period` WebSocket
call (`src/ha/history.ts`): one query on start and another every 2
minutes per card, stopped when the card disconnects. A `sensor` draws a
sharp-edged curve (not smoothed); a `binary_sensor` draws an on/off
square wave. In `halo` and `single` a bright window sweeps the line left
to right, leaving a fading trail; with `prefers-reduced-motion` the full
trace is shown still. The card only re-renders when its own entity
changes.
