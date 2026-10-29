# examples/

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#examples-english)

Ejemplos oficiales de uso de cada tarjeta y de cada API pública (acuerdo
nº12 y nº17).

## Neón Card Entity (`custom:neon-card-entity`)

### YAML mínimo

```yaml
type: custom:neon-card-entity
entity: light.living_room
```

### YAML avanzado

```yaml
type: custom:neon-card-entity
name: Salón
neon_palette: cyberpunk
entities:
  - entity: light.living_room
    name: Techo
  - entity: switch.tv_plug
    name: TV
tap_action:
  action: more-info
hold_action:
  action: toggle
double_tap_action:
  action: none
show_status_dot: false
primary_info: name
secondary_info: last-changed
card_orientation: right
```

### Capturas

![Escenarios de Neón Card Entity](../assets/screenshots/entity/Entity%20completa.jpg)

### GIF

![Neón Card Entity en acción](../assets/gifs/Neón%20Cards.gif)

### Explicación

Neón Card Entity es un interruptor con un halo neón degradado de 3 colores
alrededor de la píldora. Cada entidad puede mostrar información primaria y
secundaria (nombre, estado, último cambio...), un punto de estado opcional,
y admite tap / mantener pulsado / doble toque configurables por separado.
La orientación de la tarjeta (`card_orientation`) permite elegir si la
píldora queda a la izquierda (por defecto) o a la derecha, con la
información en el lado contrario.

Ver la [referencia de API completa](../docs/es/api.md) para el detalle de
cada opción.

## Neón Button Card (`custom:neon-button-card`)

### YAML mínimo

```yaml
type: custom:neon-button-card
name: Salón
icon: mdi:sofa
```

### YAML avanzado

```yaml
type: custom:neon-button-card
entity: light.salon
subtitle: Luces
neon_palette: cyberpunk
tap_action:
  action: toggle
hold_action:
  action: more-info
double_tap_action:
  action: none
top_sensor:
  entity: sensor.salon_power
  icon: mdi:flash
  decimals: 0
sensors:
  - entity: sensor.salon_temperature
  - entity: sensor.salon_humidity
    icon: mdi:water-percent
```

### Capturas

![Escenarios de Neón Button Card, sin activar](../assets/screenshots/button/Button%201.jpg)
![Escenarios de Neón Button Card, con halo activo](../assets/screenshots/button/Button%202.jpg)

### GIF

![Neón Button Card en acción](../assets/gifs/Button.gif)

### Explicación

Neón Button Card es un botón de acción con entidad principal opcional:
puede navegar a otra pestaña, abrir un popup/more-info, ejecutar un
script/servicio, o representar una habitación/zona sin estar ligado a
ningún dominio concreto. En estado activo, un halo neón con degradado de
3 colores se dibuja en dos direcciones desde la esquina superior
izquierda, encontrándose en la inferior derecha — mismo lenguaje visual
que el halo de Neón Card Entity, pero con mecanismo propio (no comparte
componente con ella). Admite un sensor suelto (`top_sensor`) y hasta 3
sensores agrupados (`sensors`) bajo un divisor, con icono/estado/unidad
calculados automáticamente. El tamaño de la tarjeta (ancho y alto en el
grid de HA) se calcula solo según el contenido configurado.

## Neón Thermostat Card (`custom:neon-thermostat-card`)

### YAML mínimo

```yaml
type: custom:neon-thermostat-card
entity: climate.salon
```

### YAML avanzado

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
  - entity: binary_sensor.salon_presencia
    icon: mdi:motion-sensor
```

### Capturas

![Neón Thermostat Card, Tarjeta en reposo](../assets/screenshots/termostato/thermostat-views.jpg)
![Neón Thermostat Card, Tarjeta activada](../assets/screenshots/termostato/thermostat-views1.jpg)

### GIF

![Neón Thermostat Card en acción](../assets/gifs/Termostato%20Gif.gif)

### Explicación

Neón Thermostat Card controla una entidad `climate` con un dial/aro
semicircular (180°) arrastrable, coloreado según el modo HVAC activo.
A diferencia de Button, su tamaño no se calcula del contenido — se
elige con la clave `size` (`large`/`normal`/`compact`), cada uno con
su propio layout: el dial completo solo aparece en `large`,
`normal`/`compact` usan un indicador circular más pequeño, y
`compact` no muestra footer de sensores. Cada tamaño ocupa un hueco
fijo de la rejilla: `compact` 5×4, `normal` («Mediana» en el editor) 8×5
y `large` 12×5 (columnas × filas). Admite opcionalmente una
segunda entidad `climate` (`entity_2`) para representar dos equipos
separados (p. ej. calefacción + aire acondicionado) como uno solo — el
selector de modo muestra la unión de los modos de ambas entidades, y
al elegir un modo en la tarjeta, la otra se apaga si estaba en un modo
distinto (estar activas juntas en el *mismo* modo sí está permitido);
los cambios hechos fuera de la tarjeta no los toca (para esos casos, el
README del termostato incluye una automatización de ejemplo). Igual que Button,
admite un footer de sensores (dominios `sensor`/`binary_sensor`,
máximo 3).


---

## Neón Sensor Card (`custom:neon-sensor-card`)

### YAML mínimo

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
```

### YAML avanzado

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
name: Temperatura Exterior
subtitle: Jardín
icon: mdi:thermometer
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

Sin subtítulo:

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
show_subtitle: false
```

Con un sensor binario:

```yaml
type: custom:neon-sensor-card
entity: binary_sensor.puerta_entrada
thresholds_enabled: true
alert_state: "on"
```

Con un solo color y tamaño grande:

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_garaje
size: large
neon_effect: single
neon_color: "#ff9f1a"
```

### Capturas

![Neón Sensor Card, efectos de color y umbrales](../assets/screenshots/sensor/Neon_Sensor_Cards.png)

### GIF

![Neón Sensor Card en acción](../assets/gifs/Sensor.gif)

### Explicación

Neón Sensor Card muestra una única entidad `sensor` o `binary_sensor`
(cualquier otro dominio se rechaza): nombre, icono, valor con unidad y
estado y el histórico dibujado como el trazo de un monitor de
constantes vitales (en los tamaños `normal` y `large`; el `compact` no
lleva gráfico). `neon_effect`
elige el efecto del gráfico y del icono: `halo` (por defecto, gráfico y
resplandor en tres colores con desplazamiento), `single` (un solo color
con desplazamiento) o `normal` (color del tema, sin desplazamiento). El
perímetro de la tarjeta es independiente: lo marcan solo los umbrales,
que son opcionales. Con `thresholds_enabled`, por debajo de
`threshold_low` es Bajo, por encima de `threshold_high` es Alto y entre
ambos es Correcto, cada nivel con su color (`threshold_colors`) en el
borde y con su nombre (`threshold_names`) en la etiqueta de estado bajo
el valor. Sin umbrales no hay etiqueta y el perímetro se ve normal. El
tamaño se elige con `size`: `large` (grande, ancho máximo, con gráfico),
`normal` (mediano, con gráfico) o `compact` (pequeño, sin gráfico). Cada
tamaño ocupa un hueco fijo de la rejilla (columnas × filas): `compact` 3×2,
`normal` 6×2 y `large` 12×2. El pequeño muestra siempre un decimal
(`xx.x`). No lleva pie de sensores.

---

## Neón Lock Card (`custom:neon-lock-card`)

### YAML mínimo

```yaml
type: custom:neon-lock-card
entity: lock.puerta_principal
```

### YAML avanzado

```yaml
type: custom:neon-lock-card
entity: lock.puerta_principal
name: Puerta principal
lock_icon: door
size: large
subtitle_type: state
neon_palette: emerald
status_color_open: "#ffb02e"
footer_items:
  - door
  - battery
  - last_user
door_entity: binary_sensor.puerta_principal_abierta
battery_entity: sensor.puerta_principal_bateria
last_user_entity: sensor.puerta_principal_ultimo_acceso
confirm_open: true
tap_action:
  action: toggle
hold_action:
  action: more-info
```

Garaje con puerta enrollable, en tamaño compacto y sin confirmación:

```yaml
type: custom:neon-lock-card
entity: lock.garaje
name: Garaje
lock_icon: garage_roller
size: compact
confirm_open: false
```

### Capturas

![Neón Lock Card, los tres tamaños, los cuatro iconos y el estado no disponible](../assets/screenshots/cerradura/cerradura.png)

### GIF

![Neón Lock Card en acción](../assets/gifs/Cerradura.gif)

### Explicación

Neón Lock Card controla una entidad `lock` con un icono animado que se abre
y se cierra de verdad según el estado de la cerradura. El icono se elige con
`lock_icon` (candado, puerta, garaje enrollable o garaje corredera). El halo
neón sigue al estado: se enciende cuando la cerradura se abre, permanece
encendido mientras está abierta y se apaga al llegar a cerrada; si se atasca o
la entidad falla, se ve la X de error con el halo en rojo. A la derecha del
nombre van el estado (punto verde, ámbar o rojo, que se pueden cambiar con
`status_color_*`) y los tres puntos de «más información». El tamaño se elige
con `size`: `large` (grande, con subtítulo y pie), `medium` (mediana, sin
subtítulo, con el estado bajo el nombre) o `compact` (compacta, solo icono,
nombre y estado). Los huecos de inicio de la rejilla son 12, 6 y 3 columnas,
con alto automático. El pie admite hasta tres datos (`footer_items`): sensor
de puerta (`door_entity`), batería y último acceso; la mediana solo muestra
batería y último acceso, y la compacta no lleva pie. Con el sensor de puerta
configurado, el estado pasa a decir «Puerta abierta» solo cuando el sensor
está activo. Por defecto, al pulsar para abrir aparece una vista «¿Abrir?» en
la propia tarjeta (`confirm_open: false` la desactiva); cerrar nunca pregunta.
Si la cerradura soporta además abrir, al pulsar se elige entre desbloquear o
abrir. En la compacta la orden se elige con iconos de candado, sin texto.

---

## Neón Alarm Card (`custom:neon-alarm-card`)

### YAML mínimo

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.casa
```

### YAML avanzado

Alarma de casa con subtítulo, cuatro tipos de sensor en el pie (solo se ven los activos, sin el sensor del trastero):

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.casa
name: Alarma de casa
size: large
subtitle_type: state
neon_palette: emerald
footer_sensors:
  - motion
  - door
  - vibration
  - lock
footer_only_active: true
footer_excluded:
  - binary_sensor.movimiento_trastero
tap_action:
  action: toggle
hold_action:
  action: more-info
```

Con colores propios (punto de estado y sensores activos):

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.casa
footer_sensors:
  - motion
  - door
status_color_disarmed: '#3b82f6'
status_color_armed_away: '#ff00aa'
status_color_transition: '#00ffd5'
status_color_triggered: '#ff3b3b'
sensor_active_color: '#ff3df5'
```

Versión mediana con dos tipos de sensor en el pie:

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.casa
size: medium
footer_sensors:
  - window
  - vibration
```

Versión compacta, solo escudo, nombre y estado:

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.casa
name: Alarma
size: compact
```

### Capturas

> Pendiente de añadir: captura real de la tarjeta (tamaños y estados).

### GIF

> Pendiente de añadir: GIF real de la tarjeta en acción.

### Explicación

Neón Alarm Card controla una entidad `alarm_control_panel` con un escudo
animado que cambia con el estado: cada modo armado (casa, fuera, noche,
vacaciones, personalizado), cada transición (pendiente, armando, desarmando),
la alarma disparada y la entidad no disponible tienen su dibujo y su color en
el punto de estado. El halo neón se enciende mientras la alarma vigila y se
apaga al desarmarla; disparada o no disponible se ve el halo rojo. Al pulsar
una alarma desarmada aparece la selección de modo, con solo los modos que
soporta la entidad (si soporta uno, arma directamente); al pulsar una armada,
en transición o disparada, se desarma. Si la entidad exige código
(`code_format`), la propia tarjeta muestra un teclado numérico (o un campo de
texto) y avisa si el código es incorrecto; armar solo lo pide si
`code_arm_required` no es `false`. El pie (`footer_sensors`) admite hasta cuatro tipos de sensor
de seguridad (cualquier `device_class` de `binary_sensor`, como `motion`,
`door` o `window`, o `lock` para las cerraduras): muestra cuántos de todos los
de ese tipo están activos y, al pulsar el dato, los lista. Los colores del punto de estado (uno por situación) y de los sensores activos se cambian con `status_color_*` y `sensor_active_color` (el editor los trae en la sección «Colores»). Con `footer_only_active: true` solo se ven los tipos con algún sensor activo, y con `footer_excluded` se ocultan sensores concretos (el editor los lista con checks bajo cada tipo). El tamaño se elige
con `size`: `large` (grande, hasta cuatro tipos de sensor), `medium` (mediana,
sin subtítulo y hasta dos) o `compact` (compacta, sin pie). Los huecos de
inicio de la rejilla son 12, 6 y 3 columnas, con alto automático.

---

<a id="examples-english"></a>

# examples/ (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#examples)

Official usage examples for every card and every public API (agreement
nº12 and nº17).

## Neón Card Entity (`custom:neon-card-entity`)

### Minimal YAML

```yaml
type: custom:neon-card-entity
entity: light.living_room
```

### Advanced YAML

```yaml
type: custom:neon-card-entity
name: Living Room
neon_palette: cyberpunk
entities:
  - entity: light.living_room
    name: Ceiling
  - entity: switch.tv_plug
    name: TV
tap_action:
  action: more-info
hold_action:
  action: toggle
double_tap_action:
  action: none
show_status_dot: false
primary_info: name
secondary_info: last-changed
card_orientation: right
```

### Screenshots

![Neón Card Entity scenarios](../assets/screenshots/entity/Entity%20completa.jpg)

### GIF

![Neón Card Entity in action](../assets/gifs/Neón%20Cards.gif)

### Explanation

Neón Card Entity is a switch with a 3-color neon gradient halo around the
pill. Each entity can show primary and secondary information (name,
state, last changed...), an optional status dot, and supports
separately-configurable tap / hold / double-tap actions. The card's
orientation (`card_orientation`) lets you choose whether the pill sits on
the left (default) or the right, with the information on the opposite
side.

See the [full API reference](../docs/en/api.md) for details on every
option.

## Neón Button Card (`custom:neon-button-card`)

### Minimal YAML

```yaml
type: custom:neon-button-card
name: Living Room
icon: mdi:sofa
```

### Advanced YAML

```yaml
type: custom:neon-button-card
entity: light.living_room
subtitle: Lights
neon_palette: cyberpunk
tap_action:
  action: toggle
hold_action:
  action: more-info
double_tap_action:
  action: none
top_sensor:
  entity: sensor.living_room_power
  icon: mdi:flash
  decimals: 0
sensors:
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
    icon: mdi:water-percent
```

### Screenshots

![Neón Button Card scenarios, inactive](../assets/screenshots/button/Button%201.jpg)
![Neón Button Card scenarios, active halo](../assets/screenshots/button/Button%202.jpg)

### GIF

![Neón Button Card in action](../assets/gifs/Button.gif)

### Explanation

Neón Button Card is an action button with an optional main entity: it
can navigate to another tab, open a popup/more-info, run a
script/service, or represent a room/zone without being tied to any
particular domain. In its active state, a 3-color neon gradient halo
draws itself in two directions from the top-left corner, meeting at the
bottom-right — the same visual language as the Neón Card Entity halo,
but with its own mechanism (no shared component between them). It
supports one ungrouped sensor (`top_sensor`) and up to 3 grouped sensors
(`sensors`) below a divider, with icon/state/unit computed
automatically. The card's size (width and height in HA's grid) is
computed automatically from its configured content.

## Neón Thermostat Card (`custom:neon-thermostat-card`)

### Minimal YAML

```yaml
type: custom:neon-thermostat-card
entity: climate.living_room
```

### Advanced YAML

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
  - entity: binary_sensor.living_room_motion
    icon: mdi:motion-sensor
```

### Screenshots

![Neón Thermostat Card, standby](../assets/screenshots/termostato/thermostat-views.jpg)
![Neón Thermostat Card, active](../assets/screenshots/termostato/thermostat-views1.jpg)

### GIF

![Neón Thermostat Card in action](../assets/gifs/Termostato%20Gif.gif)

### Explanation

Neón Thermostat Card controls a `climate` entity with a draggable
semicircular (180°) dial/ring colored by the active HVAC mode. Unlike
Button, its size isn't computed from content — it's chosen with the
`size` key (`large`/`normal`/`compact`), each with its own layout: the
full dial only appears in `large`, `normal`/`compact` use a smaller
circular indicator, and `compact` shows no sensor footer. Each size takes a fixed grid slot:
`compact` 5×4, `normal` ("Medium" in the editor) 8×5 and `large` 12×5
(columns × rows). It optionally
supports a second `climate` entity (`entity_2`) to represent two
separate units (e.g. heating + AC) as one — the mode selector shows the
union of both entities' modes, and
when you pick a mode in the card the other one is turned off if it was in
a different mode (being active together in the *same* mode is allowed);
changes made outside the card are left alone (for those cases, the
thermostat README includes an example automation).
Like Button, it supports a sensor footer (`sensor`/`binary_sensor`
domains, max 3).


---

## Neón Sensor Card (`custom:neon-sensor-card`)

### Minimal YAML

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
```

### Advanced YAML

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
name: Outdoor Temperature
subtitle: Garden
icon: mdi:thermometer
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

Without a subtitle:

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
show_subtitle: false
```

With a binary sensor:

```yaml
type: custom:neon-sensor-card
entity: binary_sensor.front_door
thresholds_enabled: true
alert_state: "on"
```

With a single color and large size:

```yaml
type: custom:neon-sensor-card
entity: sensor.garage_temperature
size: large
neon_effect: single
neon_color: "#ff9f1a"
```

### Screenshots

![Neón Sensor Card, color effects and thresholds](../assets/screenshots/sensor/Neon_Sensor_Cards.png)

### GIF

![Neón Sensor Card in action](../assets/gifs/Sensor.gif)

### Explanation

Neón Sensor Card shows a single `sensor` or `binary_sensor` entity (any
other domain is rejected): name, icon, value with unit and status
and the history drawn like the trace of a vital-signs monitor (in the
`normal` and `large` sizes; `compact` has no graph). `neon_effect` picks the effect of the graph and the icon: `halo`
(default, three-color graph and glow with the sweep), `single` (one
color with the sweep) or `normal` (theme color, no sweep). The card's
perimeter is independent: only the thresholds set it, and they are
optional. With `thresholds_enabled`, below `threshold_low` is Low,
above `threshold_high` is High and in between is OK, each level with
its own color (`threshold_colors`) on the border and its own name
(`threshold_names`) in the status label under the value. Without
thresholds there is no label and the perimeter looks normal. Size is chosen with `size`: `large`
(full width, with graph), `normal` (medium, with graph) or `compact`
(small, no graph). Each size takes a fixed grid slot (columns × rows):
`compact` 3×2, `normal` 6×2 and `large` 12×2. Small always shows one
decimal (`xx.x`). It has no sensor footer.

---

## Neón Lock Card (`custom:neon-lock-card`)

### Minimal YAML

```yaml
type: custom:neon-lock-card
entity: lock.front_door
```

### Advanced YAML

```yaml
type: custom:neon-lock-card
entity: lock.front_door
name: Front door
lock_icon: door
size: large
subtitle_type: state
neon_palette: emerald
status_color_open: "#ffb02e"
footer_items:
  - door
  - battery
  - last_user
door_entity: binary_sensor.front_door_open
battery_entity: sensor.front_door_battery
last_user_entity: sensor.front_door_last_access
confirm_open: true
tap_action:
  action: toggle
hold_action:
  action: more-info
```

Roller garage door, in the compact size and without confirmation:

```yaml
type: custom:neon-lock-card
entity: lock.garage
name: Garage
lock_icon: garage_roller
size: compact
confirm_open: false
```

### Screenshots

![Neón Lock Card, the three sizes, the four icons and the unavailable state](../assets/screenshots/cerradura/cerradura.png)

### GIF

![Neón Lock Card in action](../assets/gifs/Cerradura.gif)

### Explanation

Neón Lock Card controls a `lock` entity with an animated icon that really
opens and closes according to the lock's state. The icon is chosen with
`lock_icon` (padlock, door, roller garage or sliding garage). The neon halo
follows the state: it lights up when the lock opens, stays lit while it is
open and goes off on reaching closed; if it jams or the entity fails, the
error X is shown with a red halo. To the right of the name go the state (a
green, amber or red dot, which can be changed with `status_color_*`) and the
three "more info" dots. Size is chosen with `size`: `large` (large, with
subtitle and footer), `medium` (medium, no subtitle, with the state under the
name) or `compact` (compact, only icon, name and state). The starting grid
slots are 12, 6 and 3 columns, with automatic height. The footer accepts up
to three data points (`footer_items`): door sensor (`door_entity`), battery
and last access; the medium card only shows battery and last access, and the
compact card has no footer. With the door sensor configured, the state says
"Door open" only while the sensor is active. By default, tapping to open
shows an "Open?" view inside the card (`confirm_open: false` disables it);
locking never asks. If the lock also supports opening, tapping lets you
choose between unlocking or opening. In the compact card the command is
chosen with padlock icons, without text.

---

## Neón Alarm Card (`custom:neon-alarm-card`)

### Minimal YAML

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.home
```

### Advanced YAML

Home alarm with a subtitle, four sensor types in the footer (only the active ones are shown, without the storage-room sensor):

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.home
name: Home alarm
size: large
subtitle_type: state
neon_palette: emerald
footer_sensors:
  - motion
  - door
  - vibration
  - lock
footer_only_active: true
footer_excluded:
  - binary_sensor.storage_room_motion
tap_action:
  action: toggle
hold_action:
  action: more-info
```

With custom colors (state dot and active sensors):

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.home
footer_sensors:
  - motion
  - door
status_color_disarmed: '#3b82f6'
status_color_armed_away: '#ff00aa'
status_color_transition: '#00ffd5'
status_color_triggered: '#ff3b3b'
sensor_active_color: '#ff3df5'
```

Medium version with two sensor types in the footer:

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.home
size: medium
footer_sensors:
  - window
  - vibration
```

Compact version, only shield, name and state:

```yaml
type: custom:neon-alarm-card
entity: alarm_control_panel.home
name: Alarm
size: compact
```

### Screenshots

> To be added: real screenshot of the card (sizes and states).

### GIF

> To be added: real GIF of the card in action.

### Explanation

Neón Alarm Card controls an `alarm_control_panel` entity with an animated
shield that changes with the state: each armed mode (home, away, night,
vacation, custom), each transition (pending, arming, disarming), the
triggered alarm and the unavailable entity have their own drawing and their
own color on the state dot. The neon halo lights up while the alarm is
watching and goes off when it is disarmed; triggered or unavailable shows the
red halo. Tapping a disarmed alarm shows the mode selection, with only the
modes the entity supports (if it supports one, it arms straight away);
tapping an armed, transitioning or triggered one disarms it. If the entity
requires a code (`code_format`), the card itself shows a numeric keypad (or a
text field) and warns if the code is wrong; arming only asks for it if
`code_arm_required` is not `false`. The footer (`footer_sensors`) accepts up to four
security sensor types (any `binary_sensor` `device_class`, such as `motion`,
`door` or `window`, or `lock` for locks): it shows how many of all the
sensors of that type are active and lists them when you tap the item. The colors of the state dot (one per situation) and of the active sensors are changed with `status_color_*` and `sensor_active_color` (the editor has them in the "Colors" section). With `footer_only_active: true` only the types with an active sensor are shown, and `footer_excluded` hides specific sensors (the editor lists them with checks under each type). Size is
chosen with `size`: `large` (large, up to four sensor types), `medium`
(medium, no subtitle and up to two) or `compact` (compact, no footer). The
starting grid slots are 12, 6 and 3 columns, with automatic height.
