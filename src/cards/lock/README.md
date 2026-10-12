# src/cards/lock

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardslock-english)

`custom:neon-lock-card` — tarjeta para entidades `lock` de Home Assistant
(cerraduras, pestillos, cerraduras de garaje). Muestra el estado con un
icono propio y el halo neón de la familia Neón Cards.

Misma base visual que la [Button Card](../button) (icono protagonista,
nombre, subtítulo, aro neón que se dibuja desde la esquina superior
izquierda) y mismo framework (`src/core`, `src/shared`, `src/ha`).

## Estados

| Estado de HA | Icono | Aro neón | Extra |
|---|---|---|---|
| `locked` | `mdi:lock` | encendido (paleta) | |
| `unlocked` | `mdi:lock-open-variant` | apagado | |
| `locking` / `unlocking` | `mdi:lock-clock` | encendido | el icono pulsa |
| `opening` | `mdi:door-open` | apagado | el icono pulsa |
| `open` | `mdi:door-open` | apagado | |
| `jammed` | `mdi:lock-alert` | rojo de alerta | |
| sin entidad, inexistente, `unavailable`/`unknown` | `mdi:close` | rojo de alerta | "No disponible" |

El pulso se desactiva con `prefers-reduced-motion`.

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
the neon halo of the Neón Cards family.

Same visual base as the [Button Card](../button) (large icon, name,
subtitle, neon ring drawn from the top-left corner) and the same
framework (`src/core`, `src/shared`, `src/ha`).

## States

| HA state | Icon | Neon ring | Extra |
|---|---|---|---|
| `locked` | `mdi:lock` | lit (palette) | |
| `unlocked` | `mdi:lock-open-variant` | off | |
| `locking` / `unlocking` | `mdi:lock-clock` | lit | icon pulses |
| `opening` | `mdi:door-open` | off | icon pulses |
| `open` | `mdi:door-open` | off | |
| `jammed` | `mdi:lock-alert` | alert red | |
| no entity, missing, `unavailable`/`unknown` | `mdi:close` | alert red | "Unavailable" |

The pulse is disabled under `prefers-reduced-motion`.

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
