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

Neón Card Entity es un interruptor con un aro neón degradado de 3 colores
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
ningún dominio concreto. En estado activo, un aro neón con degradado de
3 colores se dibuja en dos direcciones desde la esquina superior
izquierda, encontrándose en la inferior derecha — mismo lenguaje visual
que el aro de Neón Card Entity, pero con mecanismo propio (no comparte
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
entity: climate.calefaccion
entity_2: climate.aire_acondicionado
name: Salón
size: large
mode_owner:
  fan_only: 2
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
step: 0.5
neon_palette: cyberpunk
footer:
  - entity: sensor.salon_humidity
  - entity: sensor.salon_power
    icon: mdi:flash
```

### Explicación

Neón Thermostat Card controla una o dos entidades `climate`. Según
`size`, la consigna se maneja en un dial semicircular (`large`), en un
aro alrededor de la temperatura actual (`normal`) o en una línea
(`compact`); en las tres se puede arrastrar o ajustar con la píldora
−/+, y el modo HVAC se cambia desde el selector inferior. Con
`entity_2` reúne dos equipos separados (por ejemplo calefacción y aire
acondicionado) en una sola tarjeta: el selector muestra la unión de sus
modos y `mode_owner` decide cuál gestiona un modo que ambos soportan.
Cada modo tiene su color (semántico por defecto, personalizable con
`color`), y el aro perimetral usa la paleta neón de `neon_palette`. El
pie de sensores (`footer`, hasta 3) no aparece en la vista compacta.

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

Neón Card Entity is a switch with a 3-color neon gradient ring around the
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
particular domain. In its active state, a 3-color neon gradient ring
draws itself in two directions from the top-left corner, meeting at the
bottom-right — the same visual language as the Neón Card Entity ring,
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
entity: climate.heating
entity_2: climate.air_conditioning
name: Living room
size: large
mode_owner:
  fan_only: 2
color:
  mode: custom
  heat: "#ff4500"
  cool: "#0080ff"
step: 0.5
neon_palette: cyberpunk
footer:
  - entity: sensor.living_room_humidity
  - entity: sensor.living_room_power
    icon: mdi:flash
```

### Explanation

Neón Thermostat Card controls one or two `climate` entities. Depending
on `size`, the target is handled on a semicircular dial (`large`), on a
ring around the current temperature (`normal`) or on a line
(`compact`); in all three it can be dragged or adjusted with the −/+
pill, and the HVAC mode is changed from the selector below. With
`entity_2` it brings two separate devices (for example heating and air
conditioning) into a single card: the selector shows the union of their
modes and `mode_owner` decides which one handles a mode both support.
Each mode has its own color (semantic by default, customizable with
`color`), and the perimeter ring uses the neon palette from
`neon_palette`. The sensor footer (`footer`, up to 3) is not shown in
the compact view.
