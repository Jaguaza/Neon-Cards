# Referencia de API

Documentación de toda la API pública de Neón Cards: el framework base
(`src/core`), los tipos de Home Assistant (`src/ha`) y la configuración
YAML de cada tarjeta. Sigue el formato del acuerdo nº16: descripción,
parámetros, valor devuelto y ejemplo.

Ver también la versión en [inglés](../en/api.md).

## Índice

- [`src/core` — Framework base](#srccore--framework-base)
  - [`BaseNeonCard`](#baseneoncard)
  - [Gestos (`gestures.ts`)](#gestos-gesturests)
  - [Acciones (`actions.ts`)](#acciones-actionsts)
  - [Información primaria/secundaria (`info.ts`)](#información-primariasecundaria-infots)
- [`src/ha` — Tipos de Home Assistant](#srcha--tipos-de-home-assistant)
- [Neón Card Entity — Configuración YAML](#neón-card-entity--configuración-yaml)

---

## `src/core` — Framework base

### `BaseNeonCard`

Clase base abstracta que toda tarjeta de Neón Cards extiende. Construida
sobre [Lit](https://lit.dev), **sin decoradores** (acuerdo nº10).

```ts
import { BaseNeonCard } from '../../core';

export class MiTarjeta extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };
  // ...
}
```

#### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `hass` | `HomeAssistant \| undefined` | El objeto `hass` de Home Assistant. Se declara como propiedad reactiva de Lit (`static properties`), así que asignarla dispara un `render()`. |

#### `getCardSize()`

- **Descripción:** tamaño de la tarjeta para la vista de tipo masonry (1 unidad ≈ 50px). Por defecto devuelve `1`.
- **Parámetros:** ninguno.
- **Devuelve:** `number`.
- **Ejemplo:**
  ```ts
  getCardSize(): number {
    return this._rows; // sobrescrito en una subclase según el contenido real
  }
  ```

#### `getGridOptions()`

- **Descripción:** tamaño de la tarjeta para la vista de secciones de Home Assistant (1 fila ≈ 56px + gap). Por defecto devuelve `{ rows: 1, columns: 12 }`.
- **Parámetros:** ninguno.
- **Devuelve:** `{ rows: number; columns: number }`.
- **Ejemplo:**
  ```ts
  getGridOptions(): { rows: number; columns: number } {
    return { rows: this._rows, columns: 12 };
  }
  ```

---

### Gestos (`gestures.ts`)

Gestión de gestos tap / mantener pulsado / doble toque, compartida por
todas las tarjetas (acuerdo nº4). El estado de cada gesto se guarda
**fuera** de `render()` a propósito: en Lit, `render()` se vuelve a
ejecutar en cada actualización reactiva, así que variables locales no
sobrevivirían entre pulsaciones.

#### `createGestureState()`

- **Descripción:** crea un objeto de estado vacío para un gesto. Cada tarjeta guarda una instancia por entidad (normalmente en un `Map`).
- **Parámetros:** ninguno.
- **Devuelve:** `GestureState` — `{ holdTimer?, isHoldActive: boolean, lastTapTime: number, tapTimeout? }`.
- **Ejemplo:**
  ```ts
  private _gestures = new Map<string, GestureState>();
  const state = this._gestures.get(entityId) ?? createGestureState();
  ```

#### `handlePointerDown(state, ev, ignoreSelector, onHold)`

- **Descripción:** inicia el temporizador de "mantener pulsado". Se llama en el evento `pointerdown`.
- **Parámetros:**
  - `state: GestureState` — el estado del gesto para esa entidad.
  - `ev: PointerEvent` — el evento del navegador.
  - `ignoreSelector: string` — selector CSS de elementos donde un tap no debe iniciar un gesto (p. ej. `.switch`, para que pulsar el propio interruptor no dispare también `hold`).
  - `onHold: () => void` — callback que se ejecuta si el hold se completa.
- **Devuelve:** `void`.
- **Ejemplo:**
  ```ts
  @pointerdown=${(ev: PointerEvent) =>
    handlePointerDown(gesture, ev, '.switch', () => this._handleAction(ent, 'hold'))}
  ```

#### `cancelHold(state)`

- **Descripción:** cancela el temporizador de hold en marcha (evento `pointerup`/`pointercancel`).
- **Parámetros:** `state: GestureState`.
- **Devuelve:** `void`.
- **Ejemplo:** `@pointerup=${() => cancelHold(gesture)}`

#### `handleClick(state, ev, ignoreSelector, handlers)`

- **Descripción:** resuelve un click como `tap` o `double_tap`, esperando el margen de doble toque (`DOUBLE_TAP_DELAY_MS`) solo si la tarjeta tiene configurada una acción de doble toque.
- **Parámetros:**
  - `state: GestureState`.
  - `ev: MouseEvent`.
  - `ignoreSelector: string`.
  - `handlers: TapHandlers` — `{ onTap: () => void; onDoubleTap: () => void; hasDoubleTap: boolean }`.
- **Devuelve:** `void`.
- **Ejemplo:**
  ```ts
  @click=${(ev: MouseEvent) =>
    handleClick(gesture, ev, '.switch', {
      onTap: () => this._handleAction(ent, 'tap'),
      onDoubleTap: () => this._handleAction(ent, 'double_tap'),
      hasDoubleTap,
    })}
  ```

#### Constantes

| Constante | Valor | Descripción |
|---|---|---|
| `HOLD_DELAY_MS` | `500` | Milisegundos que hay que mantener pulsado para que se dispare `hold`. |
| `DOUBLE_TAP_DELAY_MS` | `280` | Ventana de tiempo para detectar un doble toque. |

---

### Acciones (`actions.ts`)

#### `dispatchHassAction(el, actionConfig, action)`

- **Descripción:** despacha el evento `hass-action` que Home Assistant escucha para ejecutar `tap_action` / `hold_action` / `double_tap_action`.
- **Parámetros:**
  - `el: HTMLElement` — el elemento desde el que se despacha (normalmente `this`, con `bubbles: true`).
  - `actionConfig: Record<string, unknown>` — la configuración de acciones (entity, tap_action, hold_action, double_tap_action).
  - `action: string` — cuál de las tres se ejecuta: `'tap' | 'hold' | 'double_tap'`.
- **Devuelve:** `void`.
- **Ejemplo:**
  ```ts
  dispatchHassAction(this, {
    entity: ent.entity,
    tap_action: this._config.tap_action,
    hold_action: this._config.hold_action,
    double_tap_action: this._config.double_tap_action,
  }, 'tap');
  ```

---

### Información primaria/secundaria (`info.ts`)

#### `computeInfoDisplay(info, name, state, stateObj, hass)`

- **Descripción:** calcula qué mostrar como información primaria o secundaria de una entidad — mismo concepto que usa Home Assistant/Mushroom.
- **Parámetros:**
  - `info: InfoOption` — una de `'name' | 'state' | 'last-changed' | 'last-updated' | 'none'`.
  - `name: string` — nombre ya resuelto de la entidad.
  - `state: string` — estado actual (`stateObj.state`).
  - `stateObj: HassEntityState` — el objeto de estado completo (usado para `last_changed`/`last_updated`).
  - `hass: HomeAssistant`.
- **Devuelve:** `string | TemplateResult | typeof nothing` — un string para `name`/`state`, una plantilla Lit con `<ha-relative-time>` para las fechas, o `nothing` si `info` es `'none'`.
- **Ejemplo:**
  ```ts
  const primaryText = computeInfoDisplay('last-changed', name, stateObj.state, stateObj, hass);
  ```

#### Constantes y tipos

| Nombre | Descripción |
|---|---|
| `INFO_OPTIONS` | `['name', 'state', 'last-changed', 'last-updated', 'none']` — las opciones válidas. |
| `InfoOption` | Tipo TypeScript derivado de `INFO_OPTIONS`. |
| `INFO_LABELS` | `Record<InfoOption, string>` — etiquetas en español para mostrar en el editor. |

---

## `src/ha` — Tipos de Home Assistant

Tipos mínimos del objeto `hass`, ampliados según lo que cada tarjeta
necesite (nunca se copian dentro de una tarjeta — acuerdo nº4).

### `HassEntityState`

```ts
interface HassEntityState {
  entity_id: string;
  state: string;
  last_changed: string; // ISO 8601
  last_updated: string; // ISO 8601
  attributes: Record<string, unknown> & { friendly_name?: string };
}
```

### `HomeAssistant`

```ts
interface HomeAssistant {
  states: Record<string, HassEntityState>;
  callService(domain: string, service: string, serviceData?: Record<string, unknown>): Promise<void>;
}
```

- **`callService(domain, service, serviceData)`** — llama a un servicio de Home Assistant.
  - `domain: string` — p. ej. `'light'`, `'switch'`, `'homeassistant'`.
  - `service: string` — p. ej. `'toggle'`, `'turn_on'`.
  - `serviceData?: Record<string, unknown>` — p. ej. `{ entity_id: 'light.salon' }`.
  - **Devuelve:** `Promise<void>`.

---

## Neón Card Entity — Configuración YAML

Todas las claves de `NeonCardEntityConfig` (`src/cards/entity/types.ts`).
Ver ejemplos completos en [`examples/`](../../examples/README.md).

| Clave | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `entity` | `string` | — | Entidad a controlar (modo de una sola entidad). Requerida si no se usa `entities`. |
| `entities` | `{ entity: string; name?: string }[]` | — | Lista de entidades (modo multi-entidad). Requerida si no se usa `entity`. |
| `name` | `string` | nombre de la entidad | Nombre personalizado (solo en modo de una entidad). |
| `columns` | `number` | número de entidades | Columnas del grid interno. |
| `neon_palette` | `'emerald' \| 'cyberpunk' \| 'electric' \| 'sunset' \| 'toxic' \| 'custom'` | `'emerald'` | Paleta del aro neón. `'custom'` habilita `neon_color1/2/3`. |
| `neon_color1` / `neon_color2` / `neon_color3` | `string` (hex) | según paleta | Colores del degradado cuando `neon_palette: custom`. |
| `show_status_dot` | `boolean` | `true` | Muestra/oculta el punto de estado. |
| `primary_info` | `'name' \| 'state' \| 'last-changed' \| 'last-updated' \| 'none'` | `'name'` | Qué mostrar como texto principal. |
| `secondary_info` | igual que `primary_info` | `'none'` | Qué mostrar como texto secundario (segunda línea). |
| `card_orientation` | `'left' \| 'right'` | `'left'` | Posición de la píldora/interruptor: izquierda (información a la derecha) o derecha (información a la izquierda). |
| `tap_action` / `hold_action` / `double_tap_action` | `ActionConfig` | `more-info` / `none` / `none` | Acciones estándar de Home Assistant (`{ action: 'more-info' \| 'toggle' \| 'navigate' \| 'url' \| 'call-service' \| 'assist' \| 'none', ... }`). |

### Ejemplo completo

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
