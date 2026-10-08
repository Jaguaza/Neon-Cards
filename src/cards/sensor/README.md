# src/cards/sensor

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardssensor-english)

`custom:neon-sensor-card` — tarjeta de solo lectura para **una** entidad
`sensor` o `binary_sensor`. Muestra nombre, icono, valor con unidad,
estado (Normal / Alto / Bajo / Crítico / Sin señal) y, opcionalmente, un
gráfico del histórico dibujado como el trazo de un monitor de constantes
vitales: una ventana luminosa barre la línea de izquierda a derecha,
dejando una estela que se apaga y el halo del color de la tarjeta.

**Solo admite `sensor.*` y `binary_sensor.*`.** Con cualquier otro
dominio (`light.*`, `switch.*`, `climate.*`…) la tarjeta no se carga y
HA muestra un error de configuración; el editor visual solo ofrece
esos dos dominios. La lista sale de `SENSOR_DOMAINS` (`src/ha/sensors.ts`).

No lleva pie de sensores: es una tarjeta de una sola entidad.

## Tamaños

El tamaño se adapta solo al ancho real de la tarjeta en el grid de HA
(no hay clave `size`): **compacta** (< 230 px: sin gráfico), **normal**
y **grande** (≥ 380 px: icono, valor y gráfico mayores). Con
`show_graph: false` se obtiene el modo simple en cualquier tamaño.

## Config

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
name: Temperatura Exterior
warning_above: 25
critical_above: 30
```

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
icon: mdi:thermometer
decimals: 1
show_graph: true
graph_hours: 24
color_mode: custom_state
state_colors:
  normal: "#1ecdf2"
  warning: "#ffb347"
  critical: "#ff3d5a"
warning_above: 25
critical_above: 30
tap_action:
  action: more-info
```

Para un `binary_sensor`, `alert_state` indica qué estado es crítico:

```yaml
type: custom:neon-sensor-card
entity: binary_sensor.puerta_entrada
alert_state: "on"
color_mode: state
```

## Modos de color (`color_mode`)

- `single` (por defecto): un solo color con la paleta (`neon_palette`,
  `neon_color1/2/3` — ver la [Button Card](../button)).
- `state`: color automático por estado (cian / ámbar / rojo).
- `custom_state`: color propio por estado con `state_colors`
  (`normal`, `warning`, `critical`, `unavailable`).

"Sin señal" es siempre neutro salvo que lo definas en `state_colors`
con `custom_state`.

## Estados y umbrales

`sensor`: `warning_above` / `warning_below` marcan Alto/Bajo;
`critical_above` / `critical_below` marcan Crítico (gana sobre el aviso).
Sin umbrales el sensor siempre está en Normal. Un estado no numérico
(texto) también. `unavailable`/`unknown` → Sin señal.

## Gráfico

Lee el histórico con la llamada WebSocket `history/history_during_period`
(`src/ha/history.ts`): una consulta al empezar y otra cada 2 minutos por
tarjeta, que se detiene al desconectarla. Un `sensor` dibuja la curva
con aristas vivas (sin suavizar); un `binary_sensor`, una onda cuadrada
on/off. Con `prefers-reduced-motion` el trazo se muestra completo y
quieto. La tarjeta solo se repinta cuando cambia su propia entidad.

---

<a id="srccardssensor-english"></a>

# src/cards/sensor (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardssensor)

`custom:neon-sensor-card` — a read-only card for **one** `sensor` or
`binary_sensor` entity. It shows name, icon, value with unit, status
(Normal / High / Low / Critical / No signal) and, optionally, a history
graph drawn like the trace of a vital-signs monitor: a bright window
sweeps the line left to right, leaving a fading trail and the glow of
the card's color.

**Only `sensor.*` and `binary_sensor.*` are accepted.** Any other domain
(`light.*`, `switch.*`, `climate.*`…) makes the card fail to load and HA
shows a configuration error; the visual editor only offers those two
domains. The list comes from `SENSOR_DOMAINS` (`src/ha/sensors.ts`).

It has no sensor footer: it is a single-entity card.

## Sizes

Size adapts to the card's real width in the HA grid (there is no `size`
key): **compact** (< 230 px: no graph), **normal** and **large**
(≥ 380 px: bigger icon, value and graph). `show_graph: false` gives the
simple mode at any size.

## Config

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
name: Outdoor Temperature
warning_above: 25
critical_above: 30
```

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
icon: mdi:thermometer
decimals: 1
show_graph: true
graph_hours: 24
color_mode: custom_state
state_colors:
  normal: "#1ecdf2"
  warning: "#ffb347"
  critical: "#ff3d5a"
warning_above: 25
critical_above: 30
tap_action:
  action: more-info
```

For a `binary_sensor`, `alert_state` says which state is critical:

```yaml
type: custom:neon-sensor-card
entity: binary_sensor.front_door
alert_state: "on"
color_mode: state
```

## Color modes (`color_mode`)

- `single` (default): one color from the palette (`neon_palette`,
  `neon_color1/2/3` — see the [Button Card](../button)).
- `state`: automatic color per state (cyan / amber / red).
- `custom_state`: your own color per state via `state_colors`
  (`normal`, `warning`, `critical`, `unavailable`).

"No signal" is always neutral unless you set it in `state_colors` with
`custom_state`.

## Status and thresholds

`sensor`: `warning_above` / `warning_below` flag High/Low;
`critical_above` / `critical_below` flag Critical (wins over warning).
Without thresholds the sensor is always Normal, and so is a non-numeric
(text) state. `unavailable`/`unknown` → No signal.

## Graph

It reads history through the `history/history_during_period` WebSocket
call (`src/ha/history.ts`): one query on start and another every 2
minutes per card, stopped when the card disconnects. A `sensor` draws a
sharp-edged curve (not smoothed); a `binary_sensor` draws an on/off
square wave. With `prefers-reduced-motion` the full trace is shown
still. The card only re-renders when its own entity changes.
