# src/cards/lock

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardslock-english)

`custom:neon-lock-card` — tarjeta para entidades `lock` de Home Assistant
(cerraduras, pestillos, cerraduras de garaje). Muestra el estado con un
icono propio y el halo neón de la familia Neón Cards. El halo sigue al
estado de la cerradura: se enciende cuando se abre, permanece encendido
mientras esté abierta (también al cerrarse) y se apaga cuando llega a
cerrada. Como depende solo del estado, todas las tarjetas de la misma
entidad lo muestran a la vez. Al pulsar una acción que opera la cerradura
(`toggle`, `call-service`) el halo se enciende ya y espera el cambio de
estado (hasta 6 s) para las cerraduras lentas.

## Diseño

- **Arriba:** el icono, y a su lado el nombre con el subtítulo. A la derecha,
  el **estado** con un punto de color (verde cerrada, ámbar desbloqueada o
  abierta, rojo atascada o no disponible) y los **tres puntos**, que abren el
  diálogo de «más información» de la entidad sin disparar la acción de la
  tarjeta. Con la entidad no disponible no hay tres puntos, pero se reserva su
  hueco para que el estado quede en el mismo sitio que en una tarjeta
  operativa.
- **Abajo (opcional):** una línea de neón y hasta **tres datos** a elegir
  entre sensor de puerta, batería y último acceso (ver
  [Pie informativo](#pie-informativo)). Los datos se reparten a partes
  iguales por todo el ancho de la tarjeta, cada uno centrado en su hueco y
  separados por una línea.

Misma base visual que la [Button Card](../button) (halo neón que se dibuja
desde la esquina superior izquierda) y mismo framework (`src/core`,
`src/shared`, `src/ha`).

## Estados

| Estado de HA | Icono | Halo neón | Extra |
|---|---|---|---|
| `locked` | cerrado | apagado | |
| `unlocked` | abierto | encendido | |
| `open` | abierto | encendido | |
| `unlocking` / `opening` | se abre | encendido | el icono pulsa |
| `locking` | se cierra | encendido (hasta llegar a `locked`) | el icono pulsa |
| `jammed` | `mdi:close` (sin candado) | rojo de alerta | "Atascada" |
| sin entidad, inexistente, `unavailable`/`unknown` | `mdi:close` (sin candado) | rojo de alerta | "No disponible" |

### Texto del estado: «Abriendo puerta…» y «Puerta abierta»

El rótulo de estado (y el subtítulo si es `state`) no siempre repite el estado
de la entidad:

- **«Puerta abierta» solo sale con el sensor de puerta activo** (`door_entity`
  en `on`) y la cerradura sin cerrar con llave (`unlocked`, `unlocking`,
  `open` u `opening`). **Sin sensor no sale nunca.** El sensor se tiene en
  cuenta aunque el pie no lo muestre; si no existe o no da dato
  (`unavailable`, `unknown`) cuenta como si no hubiera sensor.
- **«Abriendo puerta…»** sale al pulsar **Abrir** (también el «Abrir» de la
  pregunta simple), desde el primer momento y hasta que la entidad cambie de
  estado (como mucho 6 s si no cambia), y mientras la cerradura esté en `open`
  u `opening` con el sensor sin activar: el pestillo está liberado pero la
  puerta aún no está abierta. Desbloquear y Bloquear no lo muestran.
- Con el sensor activo, «Puerta abierta» tiene prioridad sobre «Abriendo
  puerta…». `locked`, `locking`, `jammed` y el error no cambian nunca.

## Iconos

El icono se elige con `lock_icon` (o desde el editor visual, que muestra una
ficha con el dibujo de cada uno). Los iconos son SVG propios, no `mdi`,
para animar la apertura de verdad; todos se mueven con la misma garantía:
la forma se calcula para cada fotograma (no hay transiciones CSS ni giros
por escala, que se dibujan distinto según el navegador); si la cerradura
cambia de estado a mitad del recorrido, el icono continúa desde donde esté,
sin saltos; y si el navegador retrasa la animación, la posición correcta se
recupera con la siguiente actualización. Los estados transitorios adoptan ya
la pose de destino (`unlocking` y `opening` abren, `locking` cierra), así la
animación arranca en cuanto la cerradura empieza a moverse. Con
`prefers-reduced-motion` el icono cambia de pose sin animación.

| `lock_icon` | Dibujo | Abrir (cerrar es el recorrido inverso) | Duración |
|---|---|---|---|
| `padlock` (por defecto) | Candado | El arco **sube** sacando la pata corta del cuerpo y después **gira** sobre la pata larga, que sigue unida: visto de frente se estrecha hasta quedar de canto y se abre hacia el otro lado. | 0,66 s |
| `door` | Puerta | De `mdi:door-closed` a `mdi:door-open`: la hoja **gira sobre la jamba izquierda** como la página de un libro (de frente como contorno, de canto a mitad del giro y maciza por detrás) hasta quedar volcada a la izquierda. | 0,8 s |
| `garage_roller` | Garaje con puerta enrollable | Silueta de `mdi:garage-variant`: la puerta de lamas **sube y se enrolla** bajo el dintel; las lamas se pierden por arriba y abierto queda solo la inferior. | 1,1 s |
| `garage_sliding` | Garaje con puerta corredera | Silueta de `mdi:garage-variant`: el panel (lamas y montante) **se desliza** en horizontal hacia la derecha y se esconde tras la jamba. | 1,0 s |

En estado de error (sin entidad válida) se muestra `mdi:close` con cualquier icono.

## Config

```yaml
type: custom:neon-lock-card
entity: lock.puerta_principal
name: Puerta principal
```

| Clave | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `entity` | string | — | Entidad del dominio `lock`. |
| `name` | string | `friendly_name` | Nombre mostrado. |
| `lock_icon` | `padlock` \| `door` \| `garage_roller` \| `garage_sliding` | `padlock` | Icono animado (ver Iconos). Un valor no válido usa el candado. |
| `subtitle_type` | `none` \| `state` \| `custom` \| `last-changed` \| `last-updated` | `none` | Qué se muestra bajo el nombre. Por defecto nada: el estado ya va arriba a la derecha (`state` lo repite bajo el nombre). |
| `subtitle` | string | — | Texto libre cuando `subtitle_type: custom`. |
| `neon_palette` | `emerald` \| `cyberpunk` \| `electric` \| `sunset` \| `toxic` \| `custom` | `emerald` | Paleta del halo. |
| `neon_color1/2/3` | color | — | Solo con `neon_palette: custom`. |
| `status_color_closed` | color CSS | `#39e07a` (verde) | Color del punto de estado con la cerradura cerrada (`locked`, `locking`). |
| `status_color_open` | color CSS | `#ffb02e` (ámbar) | Color del punto con la cerradura desbloqueada o abierta (`unlocked`, `unlocking`, `open`, `opening`). |
| `status_color_alert` | color CSS | `#ff5c5c` (rojo) | Color del punto con la cerradura atascada o no disponible (`jammed`, `error`). |
| `footer_items` | lista de `door` \| `battery` \| `last_user` | — | Hasta tres datos en el pie, en ese orden. Los repetidos y los desconocidos se ignoran. |
| `door_entity` | string | — | Sensor de puerta (`binary_sensor`) para `door`: `on` abierta, `off` cerrada. |
| `battery_entity` | string | atributo `battery_level` | Sensor de batería (%) para `battery`. Si falta se usa el atributo `battery_level` (o `battery`) de la cerradura. |
| `last_user_entity` | string | atributo `changed_by` | Entidad con el nombre de quien accedió, para `last_user`. Si falta se usa el atributo `changed_by` de la cerradura. |
| `confirm_open` | booleano | `true` | Pide confirmación («¿Abrir?») antes de abrir; ver [Confirmación al abrir](#confirmación-al-abrir). `false` la desactiva. |
| `tap_action` | acción | `toggle` | Cierra o abre la cerradura. |
| `hold_action` | acción | `more-info` | |
| `double_tap_action` | acción | `none` | |

Si la cerradura pide código (`code_format`), `toggle` falla en HA; usa
`more-info` o una acción `call-service` con el código. Para evitar
aperturas accidentales, cualquier acción admite la confirmación estándar
de HA:

```yaml
tap_action:
  action: toggle
  confirmation:
    text: ¿Abrir la puerta?
```

---

## Confirmación al abrir

Como medida de seguridad, al pulsar para **abrir** la cerradura la tarjeta
no actúa de inmediato: muestra una vista «¿Abrir?» dentro de la propia
tarjeta, con el halo encendido y botones de contorno neón con la paleta
elegida. **Abrir** ejecuta la acción; **Cancelar** (o la tecla Esc) la
descarta. El foco empieza en Cancelar para que Intro no abra por accidente.

- Se cancela sola a los 8 s sin respuesta, y también si la cerradura cambia
  de estado o deja de estar disponible mientras se pregunta.
- **Cerrar nunca pide confirmación.**
- Solo afecta a las acciones que operan la cerradura: `toggle` con la
  cerradura cerrada, y servicios que abren (`lock.unlock`, `lock.open`, o
  cualquier otro servicio —un script, por ejemplo— estando cerrada).
  `lock.lock`, más info, navegar, etc. no preguntan.
- `confirm_open: false` la desactiva.

### Cerraduras con varias órdenes (desbloquear **y** abrir)

La tarjeta lee el atributo `supported_features` de la entidad. Si la
cerradura soporta además **abrir** (`lock.open`) y la acción es el `toggle`
por defecto, en lugar de una confirmación simple te deja **elegir**:

| Estado | Pregunta | Opciones |
| --- | --- | --- |
| `locked` (cerrada) | «¿Qué quieres hacer?» | **Desbloquear** · **Abrir** |
| `unlocked` (desbloqueada) | «¿Qué quieres hacer?» | **Bloquear** · **Abrir** |

La opción elegida llama directamente a `lock.unlock`, `lock.open` o
`lock.lock` sobre la entidad; la ✕ cancela. En los demás estados
(`open`, en movimiento…) no hay nada que elegir y se cierra directamente.
Si la cerradura **no** soporta abrir, todo sigue como antes («¿Abrir?» al
desbloquear; cerrar sin preguntar). Una acción con servicio explícito
(`call-service`) no ofrece elección: manda ese servicio. Con
`confirm_open: false` no se pregunta ni se elige.

## Pie informativo

`footer_items` pone hasta tres datos bajo una línea de neón, separados entre
sí. Un dato que no se puede obtener se muestra como «—» (en gris), no
desaparece, para que se note una entidad mal configurada.

| Dato | Muestra | De dónde sale |
| --- | --- | --- |
| `door` | Icono de puerta (abierta/cerrada) y «Abierta» (ámbar) o «Cerrada». Con `device_class: garage_door` o `window` usa su icono. | `door_entity` (obligatoria). |
| `battery` | Icono de batería según el nivel y «85 %». Con 20 % o menos, en rojo. | `battery_entity` o, si falta, el atributo `battery_level` (o `battery`) de la cerradura. |
| `last_user` | «Último acceso» y «Jorge · 08:42» (si no es de hoy, «12 oct, 21:05»). | El nombre: `last_user_entity` (su estado) o el atributo `changed_by` de la cerradura. La hora: `last_updated` de `last_user_entity` o `last_changed` de la cerradura. |

```yaml
type: custom:neon-lock-card
entity: lock.puerta_principal
name: Puerta Principal
subtitle_type: custom
subtitle: Cerradura inteligente
lock_icon: padlock
footer_items: [battery, door, last_user]
door_entity: binary_sensor.puerta_principal
```

### Cómo se configura en el editor visual

El apartado **Pie de la tarjeta** tiene una tarjeta por dato —**Batería**,
**Último acceso** y **Puerta**, siempre en ese orden, que es el orden en que
salen en la tarjeta—. Cada una lleva su interruptor para mostrarla y, al
activarla, el selector de su entidad con una pista de lo que pasa si lo dejas
vacío:

- **Batería** y **Último acceso**: la entidad es opcional; sin ella se usan los
  datos de la propia cerradura.
- **Puerta**: necesita un sensor de puerta (si lo activas sin sensor, el editor
  avisa). El sensor también sirve para el texto «Puerta abierta» del estado
  (ver [Texto del estado](#texto-del-estado-abriendo-puerta-y-puerta-abierta)),
  así que si ya hay uno elegido se sigue viendo aunque el dato esté apagado.
- Desactivar un dato no borra su entidad. Al tocar un interruptor, `footer_items`
  se escribe en el orden fijo (batería, último acceso, puerta); en YAML se respeta
  el orden que escribas.

La hora del último acceso es la del último cambio de estado de la entidad
que la aporta: si la cerradura se vuelve a cerrar sola, esa hora es la del
cierre. Para una hora exacta de apertura usa una entidad propia en
`last_user_entity`.

## Color del punto de estado

El punto junto al estado tiene un color por grupo de estados (cerrada,
desbloqueada o abierta, atascada o no disponible). En el editor visual, el
apartado **Punto de estado** tiene un selector de color para cada uno y un
enlace **Restablecer colores** que los quita los tres. En YAML vale cualquier
color CSS (`#39e07a`, `rgb(...)`, `hsl(...)`, un nombre o `var(--mi-color)`);
un valor que no sea un color válido se ignora y se usa el de por defecto.

```yaml
status_color_closed: '#39e07a'
status_color_open: orange
status_color_alert: var(--error-color)
```

El selector de color del navegador solo entiende `#rrggbb`: si en YAML pones
otro formato, el editor muestra el color por defecto en su selector, pero la
tarjeta usa el de YAML hasta que toques ese selector.

# src/cards/lock (English)

`custom:neon-lock-card` — card for Home Assistant `lock` entities (door
locks, latches, garage locks). Shows the state with a dedicated icon and
the neon halo of the Neón Cards family. The halo follows the lock state: it
lights up when the lock opens, stays on while it is open (also while it
closes) and goes off when it reaches locked. Since it depends only on the
state, every card of the same entity shows it at the same time. When an
action that operates the lock (`toggle`, `call-service`) is pressed, the
halo lights up right away and waits for the state change (up to 6 s) for
slow locks.

## Layout

- **Top:** the icon, with the name and subtitle next to it. On the right, the
  **state** with a coloured dot (green locked, amber unlocked or open, red
  jammed or unavailable) and the **three dots**, which open the entity's
  "more info" dialog without triggering the card's action. With the entity
  unavailable there are no three dots, but their space is reserved so the state
  stays in the same place as on a working card.
- **Bottom (optional):** a neon line and up to **three data points** to pick
  from door sensor, battery and last access (see
  [Information footer](#information-footer)). The data points share the full
  width of the card equally, each one centred in its slot and separated by a
  line.

Same visual base as the [Button Card](../button) (neon halo drawn from the
top-left corner) and the same framework (`src/core`, `src/shared`,
`src/ha`).

## States

| HA state | Icon | Neon halo | Extra |
|---|---|---|---|
| `locked` | closed | off | |
| `unlocked` | open | lit | |
| `open` | open | lit | |
| `unlocking` / `opening` | opens | lit | icon pulses |
| `locking` | closes | lit (until it reaches `locked`) | icon pulses |
| `jammed` | `mdi:close` (no padlock) | alert red | "Jammed" |
| no entity, missing, `unavailable`/`unknown` | `mdi:close` (no padlock) | alert red | "Unavailable" |

### State text: "Opening door…" and "Door open"

The state label (and the subtitle when it is `state`) does not always repeat
the entity's state:

- **"Door open" only appears with the door sensor active** (`door_entity` at
  `on`) and the lock not locked (`unlocked`, `unlocking`, `open` or
  `opening`). **Without a sensor it never appears.** The sensor is used even if
  the footer does not show it; if it does not exist or gives no data
  (`unavailable`, `unknown`) it counts as no sensor.
- **"Opening door…"** appears when **Open** is pressed (also the "Open" of the
  simple prompt), right away and until the entity changes state (at most 6 s if
  it does not), and while the lock is in `open` or `opening` with the sensor
  inactive: the latch is released but the door is not open yet. Unlock and Lock
  do not show it.
- With the sensor active, "Door open" takes priority over "Opening door…".
  `locked`, `locking`, `jammed` and the error never change.

## Icons

The icon is chosen with `lock_icon` (or from the visual editor, which shows a
tile with the drawing of each one). The icons are custom SVGs, not `mdi`, so
they can animate a real opening; all of them move with the same guarantees:
the shape is computed for every frame (no CSS transitions or scale-based
flips, which render differently across browsers); if the lock changes state
midway, the icon continues from wherever it is, with no jumps; and if the
browser delays the animation, the right position is recovered on the next
update. Transitional states already take the target pose (`unlocking` and
`opening` open, `locking` closes), so the animation starts as soon as the lock
begins to move. Under `prefers-reduced-motion` the icon switches pose without
animating.

| `lock_icon` | Drawing | Opening (closing is the reverse path) | Duration |
|---|---|---|---|
| `padlock` (default) | Padlock | The shackle **lifts**, pulling its short leg out of the body, and then **swings** around the long leg, which stays attached: seen from the front it narrows to edge-on and opens out the other way. | 0.66 s |
| `door` | Door | From `mdi:door-closed` to `mdi:door-open`: the leaf **swings on the left jamb** like a book page (outline from the front, edge-on halfway, solid from behind) until it lies folded out to the left. | 0.8 s |
| `garage_roller` | Garage with roller door | `mdi:garage-variant` silhouette: the slatted door **rises and rolls up** under the lintel; the slats vanish at the top and only the bottom one is left when open. | 1.1 s |
| `garage_sliding` | Garage with sliding door | `mdi:garage-variant` silhouette: the panel (slats and stile) **slides** sideways to the right and hides behind the jamb. | 1.0 s |

In the error state (no valid entity) `mdi:close` is shown with any icon.

## Config

```yaml
type: custom:neon-lock-card
entity: lock.front_door
name: Front door
```

| Key | Type | Default | Description |
|---|---|---|---|
| `entity` | string | — | Entity of the `lock` domain. |
| `name` | string | `friendly_name` | Displayed name. |
| `lock_icon` | `padlock` \| `door` \| `garage_roller` \| `garage_sliding` | `padlock` | Animated icon (see Icons). An invalid value uses the padlock. |
| `subtitle_type` | `none` \| `state` \| `custom` \| `last-changed` \| `last-updated` | `none` | What is shown under the name. Nothing by default: the state is already at the top right (`state` repeats it under the name). |
| `subtitle` | string | — | Free text when `subtitle_type: custom`. |
| `neon_palette` | `emerald` \| `cyberpunk` \| `electric` \| `sunset` \| `toxic` \| `custom` | `emerald` | Halo palette. |
| `neon_color1/2/3` | color | — | Only with `neon_palette: custom`. |
| `status_color_closed` | CSS colour | `#39e07a` (green) | Colour of the status dot when the lock is closed (`locked`, `locking`). |
| `status_color_open` | CSS colour | `#ffb02e` (amber) | Colour of the dot when the lock is unlocked or open (`unlocked`, `unlocking`, `open`, `opening`). |
| `status_color_alert` | CSS colour | `#ff5c5c` (red) | Colour of the dot when the lock is jammed or unavailable (`jammed`, `error`). |
| `footer_items` | list of `door` \| `battery` \| `last_user` | — | Up to three data points in the footer, in that order. Duplicates and unknown values are ignored. |
| `door_entity` | string | — | Door sensor (`binary_sensor`) for `door`: `on` open, `off` closed. |
| `battery_entity` | string | `battery_level` attribute | Battery sensor (%) for `battery`. If missing, the lock's `battery_level` (or `battery`) attribute is used. |
| `last_user_entity` | string | `changed_by` attribute | Entity holding the name of who accessed, for `last_user`. If missing, the lock's `changed_by` attribute is used. |
| `confirm_open` | boolean | `true` | Asks for confirmation ("Open?") before opening; see [Confirmation before opening](#confirmation-before-opening). `false` turns it off. |
| `tap_action` | action | `toggle` | Locks or unlocks. |
| `hold_action` | action | `more-info` | |
| `double_tap_action` | action | `none` | |

If the lock requires a code (`code_format`), `toggle` fails in HA; use
`more-info` or a `call-service` action that passes the code. To avoid
accidental unlocks, any action supports HA's standard confirmation:

```yaml
tap_action:
  action: toggle
  confirmation:
    text: Unlock the door?
```

## Confirmation before opening

As a safety measure, pressing to **open** the lock does not act right away:
the card shows an "Open?" view inside itself, with the halo lit and
neon-outlined buttons in the chosen palette. **Open** runs the action;
**Cancel** (or the Esc key) discards it. Focus starts on Cancel so Enter
does not open by accident.

- It cancels itself after 8 s without an answer, and also if the lock
  changes state or becomes unavailable while asking.
- **Closing never asks for confirmation.**
- It only affects actions that operate the lock: `toggle` while locked, and
  services that open (`lock.unlock`, `lock.open`, or any other service —a
  script, for instance— while locked). `lock.lock`, more-info, navigate,
  etc. do not ask.
- `confirm_open: false` turns it off.

### Locks with several commands (unlock **and** open)

The card reads the entity's `supported_features` attribute. If the lock
also supports **open** (`lock.open`) and the action is the default
`toggle`, instead of a simple confirmation it lets you **choose**:

| State | Question | Options |
| --- | --- | --- |
| `locked` | "What do you want to do?" | **Unlock** · **Open** |
| `unlocked` | "What do you want to do?" | **Lock** · **Open** |

The chosen option calls `lock.unlock`, `lock.open` or `lock.lock` on the
entity directly; the ✕ cancels. In other states (`open`, moving…) there is
nothing to choose and it locks straight away. If the lock does **not**
support open, everything works as before ("Open?" when unlocking; locking
without asking). An explicit service action (`call-service`) offers no
choice: it sends that service. With `confirm_open: false` it neither asks
nor offers a choice.

## Information footer

`footer_items` puts up to three data points under a neon line, separated
from each other. Data that cannot be obtained is shown as "—" (greyed out),
it does not disappear, so a misconfigured entity is noticeable.

| Item | Shows | Where it comes from |
| --- | --- | --- |
| `door` | Door icon (open/closed) and "Open" (amber) or "Closed". With `device_class: garage_door` or `window` it uses their icon. | `door_entity` (required). |
| `battery` | Battery icon by level and "85 %". At 20 % or less, in red. | `battery_entity` or, if missing, the lock's `battery_level` (or `battery`) attribute. |
| `last_user` | "Last access" and "Jorge · 08:42" (if not today, "Oct 12, 9:05 PM"). | The name: `last_user_entity` (its state) or the lock's `changed_by` attribute. The time: `last_updated` of `last_user_entity` or `last_changed` of the lock. |

### How it is set up in the visual editor

The **Card footer** section has one card per data point —**Battery**, **Last
access** and **Door**, always in that order, which is the order they appear in
on the card—. Each one has its own switch to show it and, once on, the picker
for its entity with a hint of what happens if you leave it empty:

- **Battery** and **Last access**: the entity is optional; without it the
  lock's own data is used.
- **Door**: needs a door sensor (if you turn it on without one, the editor
  warns you). The sensor is also used for the "Door open" status text (see
  [State text](#state-text-opening-door-and-door-open)), so if one is already
  chosen it stays visible even when the data point is off.
- Turning a data point off does not delete its entity. When a switch is
  touched, `footer_items` is written in the fixed order (battery, last access,
  door); in YAML the order you write is respected.

The last-access time is that of the last state change of the entity that
provides it: if the lock re-locks by itself, that time is the lock time. For
an exact opening time use your own entity in `last_user_entity`.

## Status dot colour

The dot next to the state has one colour per group of states (closed,
unlocked or open, jammed or unavailable). In the visual editor, the **Status
dot** section has a colour picker for each one and a **Reset colours** link
that clears all three. In YAML any CSS colour works (`#39e07a`, `rgb(...)`,
`hsl(...)`, a name or `var(--my-colour)`); a value that is not a valid colour
is ignored and the default is used.

The browser's colour picker only understands `#rrggbb`: if you use another
format in YAML, the editor shows the default colour in its picker, but the
card keeps using the YAML one until you touch that picker.
