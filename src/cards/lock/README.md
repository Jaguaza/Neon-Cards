# src/cards/lock

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardslock-english)

`custom:neon-lock-card` — tarjeta para entidades `lock` de Home Assistant
(cerraduras, pestillos, cerraduras de garaje). Muestra el estado con un
icono propio y el halo neón de la familia Neón Cards. En reposo la
tarjeta no lleva halo: se enciende al accionar la cerradura.

Misma base visual que la [Button Card](../button) (icono protagonista,
nombre, subtítulo, halo neón que se dibuja desde la esquina superior
izquierda) y mismo framework (`src/core`, `src/shared`, `src/ha`).

## Estados

| Estado de HA | Candado | Halo neón | Extra |
|---|---|---|---|
| `locked` | cerrado | apagado (reposo) | |
| `unlocked` | abierto | apagado (reposo) | |
| `open` | abierto | apagado (reposo) | |
| `unlocking` / `opening` | se abre | encendido | el icono pulsa |
| `locking` | se cierra | encendido | el icono pulsa |
| `jammed` | cerrado | rojo de alerta | |
| sin entidad, inexistente, `unavailable`/`unknown` | `mdi:close` (sin candado) | rojo de alerta | "No disponible" |

El candado es un SVG propio, no un icono `mdi`, para animar la apertura
como la de un candado real: el cuerpo queda fijo, el arco **sube sacando
la pata corta del cuerpo** y después **gira sobre la pata larga** (la que
sigue unida): visto de frente se estrecha hasta quedar de canto y se abre
hacia el otro lado (≈0,7 s). Al cerrar hace el recorrido inverso (primero
gira de vuelta y después baja). Los estados transitorios adoptan ya la
pose de destino, así la animación arranca en cuanto la cerradura empieza
a moverse. Con `prefers-reduced-motion` el arco cambia de pose sin
animación.

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
| `subtitle_type` | `state` \| `custom` \| `last-changed` \| `last-updated` \| `none` | `state` | Qué se muestra bajo el nombre. `state` es el estado traducido (Cerrada, Abierta…). |
| `subtitle` | string | — | Texto libre cuando `subtitle_type: custom`. |
| `neon_palette` | `emerald` \| `cyberpunk` \| `electric` \| `sunset` \| `toxic` \| `custom` | `emerald` | Paleta del halo (al accionar). |
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
the neon halo of the Neón Cards family. At rest the card has no halo: it
lights up when the lock is operated.

Same visual base as the [Button Card](../button) (large icon, name,
subtitle, neon halo drawn from the top-left corner) and the same
framework (`src/core`, `src/shared`, `src/ha`).

## States

| HA state | Padlock | Neon halo | Extra |
|---|---|---|---|
| `locked` | closed | off (rest) | |
| `unlocked` | open | off (rest) | |
| `open` | open | off (rest) | |
| `unlocking` / `opening` | opens | lit | icon pulses |
| `locking` | closes | lit | icon pulses |
| `jammed` | closed | alert red | |
| no entity, missing, `unavailable`/`unknown` | `mdi:close` (no padlock) | alert red | "Unavailable" |

The padlock is a custom SVG, not an `mdi` icon, so it can animate the
opening like a real padlock: the body stays fixed, the shackle **lifts,
pulling its short leg out of the body**, and then **swings around the
long leg** (the one that stays attached): seen from the front it narrows
to edge-on and opens out the other way (≈0.7 s). Closing plays the same
path in reverse (it swings back first, then drops). Transitional states
already take the target pose, so the animation starts as soon as the
lock begins to move. Under `prefers-reduced-motion` the shackle switches
pose without animating.

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
| `subtitle_type` | `state` \| `custom` \| `last-changed` \| `last-updated` \| `none` | `state` | What is shown under the name. `state` is the translated state (Locked, Unlocked…). |
| `subtitle` | string | — | Free text when `subtitle_type: custom`. |
| `neon_palette` | `emerald` \| `cyberpunk` \| `electric` \| `sunset` \| `toxic` \| `custom` | `emerald` | Halo palette (on action). |
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
