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

| Estado de HA | Icono | Halo neón | Extra |
|---|---|---|---|
| `locked` | `mdi:lock` | apagado (reposo) | |
| `unlocked` | `mdi:lock-open-variant` | apagado (reposo) | |
| `open` | `mdi:door-open` | apagado (reposo) | |
| `locking` / `unlocking` / `opening` | `mdi:lock-clock` / `mdi:door-open` | encendido | el icono pulsa |
| `jammed` | `mdi:lock-alert` | rojo de alerta | |
| sin entidad, inexistente, `unavailable`/`unknown` | `mdi:close` | rojo de alerta | "No disponible" |

El halo se enciende en dos casos: **al pulsar una acción** (tap, hold o
double tap distinta de `none`; dura 1,5 s, da respuesta inmediata
aunque la integración tarde en informar del movimiento) y **mientras la
cerradura se mueve** (`locking`, `unlocking`, `opening`). El resto del
tiempo la tarjeta queda en reposo, sin halo. El pulso se desactiva con
`prefers-reduced-motion`.

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

| HA state | Icon | Neon halo | Extra |
|---|---|---|---|
| `locked` | `mdi:lock` | off (rest) | |
| `unlocked` | `mdi:lock-open-variant` | off (rest) | |
| `open` | `mdi:door-open` | off (rest) | |
| `locking` / `unlocking` / `opening` | `mdi:lock-clock` / `mdi:door-open` | lit | icon pulses |
| `jammed` | `mdi:lock-alert` | alert red | |
| no entity, missing, `unavailable`/`unknown` | `mdi:close` | alert red | "Unavailable" |

The halo lights up in two cases: **when an action is pressed** (tap,
hold or double tap other than `none`; it lasts 1.5 s and gives instant
feedback even if the integration is slow to report movement) and **while
the lock is moving** (`locking`, `unlocking`, `opening`). The rest of
the time the card stays at rest, with no halo. The pulse is disabled
under `prefers-reduced-motion`.

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
