# src/cards/alarm

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardsalarm-english)

`custom:neon-alarm-card` — tarjeta para entidades `alarm_control_panel` de
Home Assistant. Muestra el estado con un **escudo animado** y el halo neón de
la familia Neón Cards. El halo se enciende mientras la alarma vigila (armada,
en transición o disparada) y se apaga cuando está desarmada; disparada, no
disponible o sin entidad se ve el halo rojo de alerta. Al pulsar una orden el
halo se enciende ya y espera el cambio de estado (hasta 6 s).

## Diseño

- **Arriba:** el escudo y, a su lado, el nombre con el subtítulo. A la
  derecha, el **estado** con un punto de color y los **tres puntos**, que
  abren «más información» sin disparar la acción de la tarjeta.
- **Abajo (opcional):** una línea de neón y hasta **cuatro tipos de sensor**
  (ver [Pie de sensores](#pie-de-sensores)), apilados uno debajo de otro y
  cada uno a todo el ancho de la tarjeta.

### Estados

La tarjeta distingue todos los estados de `alarm_control_panel`. Cada uno
tiene su dibujo dentro del escudo y su color en el punto de estado:

| Estado | Dibujo | Punto | Halo |
|---|---|---|---|
| `disarmed` | escudo vacío | verde | apagado |
| `armed_home` | casa | ámbar | encendido |
| `armed_away` | check | naranja | encendido |
| `armed_night` | luna | violeta | encendido |
| `armed_vacation` | sol | cian | encendido |
| `armed_custom_bypass` | dos líneas | magenta | encendido |
| `pending` | reloj | amarillo | encendido, pulsa |
| `arming` | check | naranja claro | encendido, pulsa |
| `disarming` | aspa | turquesa | encendido, pulsa |
| `triggered` | exclamación | rojo | rojo, pulsa |
| `unavailable` / sin entidad / `unknown` | aspa | rojo | rojo |

Solo se ofrecen para armar los modos que **soporta la entidad** (según su
atributo `supported_features`). Con `prefers-reduced-motion` no hay pulsos ni
animaciones de entrada.

### Tamaños (`size`)

| `size` | Contenido | Columnas de inicio |
|---|---|---|
| `large` (por defecto) | Escudo, nombre, subtítulo, estado, tres puntos y pie de hasta cuatro tipos de sensor | 12 |
| `medium` | Sin subtítulo, con el estado bajo el nombre; pie de hasta dos tipos de sensor | 6 |
| `compact` | Solo escudo, nombre y estado; sin pie ni tres puntos. Los botones de las vistas son solo iconos | 3 |

El alto es automático. Una vista abierta (modos, teclado…) ocupa el sitio del
contenido y la tarjeta crece lo necesario en vez de cortarla.

## Pulsar: armar y desarmar

Con `tap_action: toggle` (el valor por defecto):

- **Desarmada** → aparece la **selección de modo** con un botón por cada modo
  que soporta la entidad. Si solo soporta uno, arma directamente.
- **Armada, en transición o disparada** → desarma.
- **No disponible o sin entidad** → no hace nada.

Cualquier otra acción (`more-info`, `call-service`…) se despacha como en el
resto de tarjetas. Los servicios que se llaman son `alarm_control_panel.alarm_disarm`,
`alarm_arm_home`, `alarm_arm_away`, `alarm_arm_night`, `alarm_arm_vacation` y
`alarm_arm_custom_bypass`.

### Código

Si la entidad exige código (atributo `code_format`), la tarjeta pide el código
**en la propia tarjeta** antes de lanzar la orden:

- `code_format: number` → teclado numérico, con puntos para lo escrito.
- `code_format: text` → campo de contraseña.
- Desarmar siempre pide código; **armar** solo si `code_arm_required` no es
  `false`.
- Si Home Assistant rechaza el código, la vista sigue abierta, avisa «Código
  incorrecto» y vacía lo escrito para reintentar.

Sin `code_format` no hay teclado.

Pulsar arma o desarma directamente: la tarjeta no pide confirmación (si la
alarma exige código, el teclado ya hace de filtro). Una config antigua con
`confirmation: true` se ignora.

Las vistas se cierran solas tras 30 s sin actividad, y también si la alarma
cambia de estado mientras están abiertas.

## Pie de sensores

`footer_sensors` es una lista de hasta cuatro tipos (dos en `medium`, ninguno en
`compact`). Cada tipo es una `device_class` de `binary_sensor` (`motion`,
`door`, `window`, `vibration`…) o `lock` para las cerraduras. La tarjeta
encuentra **todos** los sensores de Home Assistant de ese tipo (sin filtros por
área ni exclusiones) y muestra cuántos están activos: ámbar si hay alguno, «En
reposo» si no, «—» si no hay ninguno. Una cerradura cuenta como activa si no
está cerrada con llave.

Al pulsar un dato se abre la **lista** de sensores de ese tipo, los activos
primero, sin disparar la acción de la tarjeta.

La compacta no tiene pie: su editor no ofrece los tipos de sensor, «solo
activos», la lista de sensores a ocultar ni el color de sensores activos.

El editor ofrece los tipos de seguridad habituales (`motion`, `occupancy`,
`presence`, `door`, `garage_door`, `window`, `opening`, `vibration`, `tamper`,
`smoke`, `gas`, `carbon_monoxide`, `moisture`, `heat`, `sound`, `safety`,
`problem` y `lock`), pero por YAML se acepta cualquier `device_class`.

### Solo activos y sensores ocultos

- **`footer_only_active: true`** — el pie solo enseña lo que está activo: los
  tipos sin ningún sensor activo desaparecen y, si no queda ninguno, el pie
  entero (también su línea de neón). La lista al pulsar solo enseña los
  sensores activos. Desactivado por defecto.
- **`footer_excluded`** — lista de entidades (`binary_sensor.*` o `lock.*`)
  que la tarjeta no cuenta ni lista, aunque sean del tipo elegido. En el
  editor, al elegir un tipo en un hueco sale un desplegable «Ocultar sensores
  concretos» con todos los que hay en Home Assistant, cada uno con un check:
  los marcados **no** se muestran (y se etiquetan «oculto»). El título dice
  cuántos están ocultos y los botones «Marcar todos» y «Desmarcar todos»
  cambian de golpe todos los del tipo.

La lista que se abre al pulsar un dato se coloca arriba, justo bajo el título,
y hace scroll por dentro si hay muchos sensores.

### Colores

Todo cambia desde el editor, en la sección «Colores» (cada selector parte del
color que ya tiene la tarjeta; el botón «Restablecer» los quita todos):

| Clave | Qué colorea |
|---|---|
| `status_color_disarmed` | El punto de estado con la alarma desarmada |
| `status_color_armed_home`, `status_color_armed_away`, `status_color_armed_night`, `status_color_armed_vacation`, `status_color_armed_custom_bypass` | El punto de cada modo armado (uno por modo) |
| `status_color_transition` | El punto de las tres transiciones a la vez: pendiente, armando y desarmando |
| `status_color_triggered` | El punto con la alarma disparada |
| `status_color_unavailable` | El punto con la alarma no disponible o sin entidad |
| `sensor_active_color` | Los sensores activos, en el pie y en la lista (ámbar por defecto) |

Aceptan hex, `rgb()`/`hsl()`, un nombre de color o `var(--x)`; un valor
inválido se ignora y vale el color por defecto. Sin configurar nada, cada
transición (pendiente, armando, desarmando) conserva su propio color.

## Estructura de la carpeta

| Archivo | Qué hace |
|---|---|
| `neon-alarm-card.ts` | La tarjeta (render, gestos y llamadas a servicios) |
| `alarm-state.ts` | Estado visual, modos soportados y reglas de código |
| `alarm-flow.ts` | Vista abierta, código escrito y temporizadores |
| `alarm-sensors.ts` | Búsqueda y recuento de sensores del pie |
| `shield-icon.ts` | El escudo animado y el dibujo de cada estado |
| `flow-views.ts`, `keypad-view.ts`, `sensors-view.ts`, `footer-view.ts` | Vistas de modos, teclado, lista y pie |
| `*.styles.ts` | Estilos divididos (tarjeta, tamaños, vistas, escudo, editor) |
| `translations/` | Textos en español e inglés |
| `neon-alarm-card-editor.ts` | Editor visual |

---

<a id="srccardsalarm-english"></a>

# src/cards/alarm (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardsalarm)

`custom:neon-alarm-card` — card for Home Assistant `alarm_control_panel`
entities. It shows the state with an **animated shield** and the neon halo of
the Neón Cards family. The halo is on while the alarm is watching (armed,
transitioning or triggered) and off when disarmed; triggered, unavailable or
without an entity you get the red alert halo. When you send a command the halo
turns on right away and waits for the state to change (up to 6 s).

## Design

- **Top:** the shield and, next to it, the name with the subtitle. On the
  right, the **state** with a colored dot and the **three dots**, which open
  "more info" without triggering the card's action.
- **Bottom (optional):** a neon line and up to **four sensor types** (see
  [Sensor footer](#sensor-footer)), stacked one below the other, each one
  using the full width of the card.

### States

The card tells apart every `alarm_control_panel` state. Each one has its own
drawing inside the shield and its own color on the state dot:

| State | Drawing | Dot | Halo |
|---|---|---|---|
| `disarmed` | empty shield | green | off |
| `armed_home` | house | amber | on |
| `armed_away` | check | orange | on |
| `armed_night` | moon | violet | on |
| `armed_vacation` | sun | cyan | on |
| `armed_custom_bypass` | two lines | magenta | on |
| `pending` | clock | yellow | on, pulses |
| `arming` | check | light orange | on, pulses |
| `disarming` | cross | teal | on, pulses |
| `triggered` | exclamation | red | red, pulses |
| `unavailable` / no entity / `unknown` | cross | red | red |

Only the modes the **entity supports** (from its `supported_features`
attribute) are offered for arming. With `prefers-reduced-motion` there are no
pulses or entry animations.

### Sizes (`size`)

| `size` | Content | Starting columns |
|---|---|---|
| `large` (default) | Shield, name, subtitle, state, three dots and a footer of up to four sensor types | 12 |
| `medium` | No subtitle, state under the name; footer of up to two sensor types | 6 |
| `compact` | Only shield, name and state; no footer or three dots. View buttons are icon-only | 3 |

Height is automatic. An open view (modes, keypad…) takes the place of the
content and the card grows as needed instead of clipping it.

## Tapping: arm and disarm

With `tap_action: toggle` (the default):

- **Disarmed** → the **mode selection** appears with one button per mode the
  entity supports. If it only supports one, it arms straight away.
- **Armed, transitioning or triggered** → disarms.
- **Unavailable or no entity** → does nothing.

Any other action (`more-info`, `call-service`…) is dispatched as in the other
cards. The services called are `alarm_control_panel.alarm_disarm`,
`alarm_arm_home`, `alarm_arm_away`, `alarm_arm_night`, `alarm_arm_vacation`
and `alarm_arm_custom_bypass`.

### Code

If the entity requires a code (`code_format` attribute), the card asks for it
**inside the card** before sending the command:

- `code_format: number` → numeric keypad, with dots for what you typed.
- `code_format: text` → password field.
- Disarming always asks for the code; **arming** only if `code_arm_required`
  is not `false`.
- If Home Assistant rejects the code, the view stays open, says "Wrong code"
  and clears what was typed so you can retry.

Without `code_format` there is no keypad.

Tapping arms or disarms straight away: the card asks for no confirmation (if
the alarm requires a code, the keypad already acts as a filter). An old config
with `confirmation: true` is ignored.

Views close by themselves after 30 s without activity, and also if the alarm
changes state while they are open.

## Sensor footer

`footer_sensors` is a list of up to four types (two in `medium`, none in
`compact`). Each type is a `binary_sensor` `device_class` (`motion`, `door`,
`window`, `vibration`…) or `lock` for locks. The card finds **all** Home
Assistant sensors of that type (no area filter or exclusions) and shows how
many are active: amber if any, "Idle" if none, "—" if there are no sensors. A
lock counts as active if it is not locked.

Tapping an item opens the **list** of sensors of that type, active ones first,
without triggering the card's action.

The compact card has no footer: its editor does not offer the sensor types,
"only active", the list of sensors to hide or the active-sensor color.

The editor offers the usual security types (`motion`, `occupancy`, `presence`,
`door`, `garage_door`, `window`, `opening`, `vibration`, `tamper`, `smoke`,
`gas`, `carbon_monoxide`, `moisture`, `heat`, `sound`, `safety`, `problem` and
`lock`), but any `device_class` is accepted from YAML.

### Only active and hidden sensors

- **`footer_only_active: true`** — the footer only shows what is active: types
  with no active sensor disappear and, if none is left, the whole footer
  (including its neon line). The list opened by tapping only shows the active
  sensors. Off by default.
- **`footer_excluded`** — list of entities (`binary_sensor.*` or `lock.*`) the
  card neither counts nor lists, even if they are of the chosen type. In the
  editor, choosing a type in a slot reveals a collapsible "Hide specific
  sensors" with all those in Home Assistant, each with a check: the ticked
  ones are **not** shown (and are labeled "hidden"). The title says how many
  are hidden and the "Tick all" and "Untick all" buttons change all the
  sensors of the type at once.

The list opened by tapping an item sits at the top, right under the title, and
scrolls inside if there are many sensors.

### Colors

Everything changes from the editor, in the "Colors" section (each picker
starts from the color the card already has; the "Reset" button removes them
all):

| Key | What it colors |
|---|---|
| `status_color_disarmed` | The state dot when the alarm is disarmed |
| `status_color_armed_home`, `status_color_armed_away`, `status_color_armed_night`, `status_color_armed_vacation`, `status_color_armed_custom_bypass` | The dot of each armed mode (one per mode) |
| `status_color_transition` | The dot of the three transitions at once: pending, arming and disarming |
| `status_color_triggered` | The dot when the alarm is triggered |
| `status_color_unavailable` | The dot when the alarm is unavailable or has no entity |
| `sensor_active_color` | Active sensors, in the footer and in the list (amber by default) |

They accept hex, `rgb()`/`hsl()`, a color name or `var(--x)`; an invalid value
is ignored and the default color is used. With nothing configured, each
transition (pending, arming, disarming) keeps its own color.

## Folder layout

| File | What it does |
|---|---|
| `neon-alarm-card.ts` | The card (render, gestures and service calls) |
| `alarm-state.ts` | Visual state, supported modes and code rules |
| `alarm-flow.ts` | Open view, typed code and timers |
| `alarm-sensors.ts` | Footer sensor lookup and counting |
| `shield-icon.ts` | The animated shield and each state's drawing |
| `flow-views.ts`, `keypad-view.ts`, `sensors-view.ts`, `footer-view.ts` | Mode, keypad, list and footer views |
| `*.styles.ts` | Split styles (card, sizes, views, shield, editor) |
| `translations/` | Spanish and English texts |
| `neon-alarm-card-editor.ts` | Visual editor |
