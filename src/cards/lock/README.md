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

Misma base visual que la [Button Card](../button) (icono protagonista,
nombre, subtítulo, halo neón que se dibuja desde la esquina superior
izquierda) y mismo framework (`src/core`, `src/shared`, `src/ha`).

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
| `subtitle_type` | `state` \| `custom` \| `last-changed` \| `last-updated` \| `none` | `state` | Qué se muestra bajo el nombre. `state` es el estado traducido (Cerrada, Abierta…). |
| `subtitle` | string | — | Texto libre cuando `subtitle_type: custom`. |
| `neon_palette` | `emerald` \| `cyberpunk` \| `electric` \| `sunset` \| `toxic` \| `custom` | `emerald` | Paleta del halo. |
| `neon_color1/2/3` | color | — | Solo con `neon_palette: custom`. |
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

Same visual base as the [Button Card](../button) (large icon, name,
subtitle, neon halo drawn from the top-left corner) and the same
framework (`src/core`, `src/shared`, `src/ha`).

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
| `subtitle_type` | `state` \| `custom` \| `last-changed` \| `last-updated` \| `none` | `state` | What is shown under the name. `state` is the translated state (Locked, Unlocked…). |
| `subtitle` | string | — | Free text when `subtitle_type: custom`. |
| `neon_palette` | `emerald` \| `cyberpunk` \| `electric` \| `sunset` \| `toxic` \| `custom` | `emerald` | Halo palette. |
| `neon_color1/2/3` | color | — | Only with `neon_palette: custom`. |
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
