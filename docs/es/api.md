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
  - [Sensores (`sensors.ts`)](#sensores-sensorsts)
- [`src/shared` — Paleta y efectos neón compartidos](#srcshared--paleta-y-efectos-neón-compartidos)
  - [Paleta (`neon-palette.ts`)](#paleta-neon-palettets)
  - [Halo de icono (`glow.ts`)](#halo-de-icono-glowts)
  - [Aro partido (`glow.ts`)](#aro-partido-glowts)
- [Neón Card Entity — Configuración YAML](#neón-card-entity--configuración-yaml)
- [Neón Button Card — Configuración YAML](#neón-button-card--configuración-yaml)

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

- **Descripción:** calcula qué mostrar como información primaria o secundaria de una entidad.
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

### Sensores (`sensors.ts`)

Helpers de entidades `sensor`/`binary_sensor` (las tarjetas nunca leen
`hass.states` a mano para esto — acuerdo nº4). Hoy los usa la Button
Card (`top_sensor`/`sensors`); cualquier tarjeta futura que muestre
sensores contextuales debería reutilizarlos.

#### `getSensorDisplay(entityId, hass, options?)`

- **Descripción:** icono/estado/unidad ya formateados de una entidad
  `sensor`/`binary_sensor`, listos para pintar. El icono se calcula por
  `device_class` si no se indica uno explícito; el estado se redondea a
  `options.decimals` decimales (por defecto `1`) cuando es numérico, y
  se deja intacto si no lo es (p. ej. `"Cerrada"`, `"on"`/`"off"` de un
  `binary_sensor`).
- **Parámetros:**
  - `entityId: string` — p. ej. `'sensor.salon_temperature'`.
  - `hass: HomeAssistant`.
  - `options?: { icon?: string; decimals?: number }` — sobreescriben el
    icono/decimales calculados automáticamente para ese sensor.
- **Devuelve:** `SensorDisplay | null` — `null` si `entityId` no
  pertenece a los dominios `sensor`/`binary_sensor` (`SENSOR_DOMAINS`).
  ```ts
  interface SensorDisplay {
    entity: string;
    icon: string;
    state: string;
    unit: string;
    available: boolean; // false si unavailable/unknown o no existe
  }
  ```
- **Ejemplo:**
  ```ts
  const d = getSensorDisplay('sensor.salon_humidity', hass, { decimals: 0 });
  // d?.icon === 'mdi:water-percent', d?.state === '47', d?.unit === '%'
  ```

#### `formatSensorState(state, decimals?)`

- **Descripción:** redondea un estado numérico a `decimals` decimales
  (por defecto `1`); deja intacto cualquier estado no numérico.
- **Parámetros:**
  - `state: string` — `stateObj.state` tal cual.
  - `decimals?: number` — por defecto `DEFAULT_SENSOR_DECIMALS` (`1`).
- **Devuelve:** `string`.
- **Ejemplo:**
  ```ts
  formatSensorState('21.456', 1); // '21.5'
  formatSensorState('unavailable'); // 'unavailable' (sin cambios)
  ```

#### Constantes y tipos

| Nombre | Descripción |
|---|---|
| `SENSOR_DOMAINS` | `['sensor', 'binary_sensor']` — únicos dominios aceptados por `getSensorDisplay`. |
| `SensorDomain` | Tipo TypeScript derivado de `SENSOR_DOMAINS`. |
| `DEFAULT_SENSOR_DECIMALS` | `1` — decimales por defecto cuando el sensor no especifica los suyos. |

---

## `src/shared` — Paleta y efectos neón compartidos

Lo visual reutilizable entre tarjetas (acuerdo nº4: nunca se copia por
tarjeta). Nace en Neón Card Entity y lo consume también Neón Button
Card. Es intencionadamente independiente del tema de Home Assistant: la
identidad "neón" no depende del tema activo, solo el resto de la
tarjeta (fondo, texto) sí lo hace a través de variables CSS de HA.

### Paleta (`neon-palette.ts`)

#### `resolveGradientColors(config)`

- **Descripción:** resuelve los 3 colores del degradado neón a partir
  de la config de una tarjeta — mismo cálculo para todas las tarjetas
  (antes vivía duplicado dentro de cada una).
- **Parámetros:**
  - `config: NeonPaletteConfig | undefined`
    ```ts
    interface NeonPaletteConfig {
      neon_palette?: string; // 'emerald' | 'cyberpunk' | 'electric' | 'sunset' | 'toxic' | 'custom'
      neon_color1?: string;  // solo se leen si neon_palette === 'custom'
      neon_color2?: string;
      neon_color3?: string;
    }
    ```
- **Devuelve:** `GradientColors` — `{ c1: string; c2: string; c3: string }`. Con `neon_palette: 'custom'` usa `neon_color1/2/3` (con fallback al preset por defecto si faltan); con cualquier otro valor (o ninguno) usa los colores del preset correspondiente de `NEON_PRESETS`.
- **Ejemplo:**
  ```ts
  resolveGradientColors({ neon_palette: 'cyberpunk' });
  // { c1: '#ff2a85', c2: '#ff0055', c3: '#7a00ff' }
  ```

#### Constantes y tipos

| Nombre | Descripción |
|---|---|
| `NEON_PRESETS` | `Record<string, NeonPreset>` — los 5 presets (`emerald`, `cyberpunk`, `electric`, `sunset`, `toxic`), cada uno con `{ name, c1, c2, c3 }`. |
| `DEFAULT_PALETTE` | `'emerald'` — preset usado cuando no se indica `neon_palette` o el valor no existe. |
| `NeonPreset` | `{ name: string; c1: string; c2: string; c3: string }`. |
| `GradientColors` | `{ c1: string; c2: string; c3: string }` — lo que devuelve `resolveGradientColors`. |

---

### Halo de icono (`glow.ts`)

Brillo de icono reutilizable: en estado activo adopta el color de la
paleta con doble/triple capa de `drop-shadow` en vez del color neutro
del tema, para que la luz parezca nacer del propio icono.

- **`NEON_HALO_STYLES`** — bloque `css` de Lit con las reglas
  `.neon-halo-icon` / `.neon-halo-active .neon-halo-icon` /
  `.neon-halo-error .neon-halo-icon`. Se añade a `static styles` de la
  tarjeta anfitriona.
- **`neonHaloVars(colors)`**
  - **Descripción:** fija las variables CSS `--neon-c1/c2/c3` que
    consume `NEON_HALO_STYLES`.
  - **Parámetros:** `colors: GradientColors`.
  - **Devuelve:** `string` — para usar directamente en el atributo
    `style` del host.
  - **Ejemplo:** `style=${neonHaloVars(resolveGradientColors(this._config))}`

**Uso:** la tarjeta anfitriona añade `NEON_HALO_STYLES` a su `static
styles`, pone la clase `neon-halo-icon` en el `<ha-icon>`, y
`neon-halo-active` (estado activo) o `neon-halo-error` (entidad
rota/no encontrada — rojo neón fijo, no la paleta) en un ancestro
(normalmente el host), fijando `--neon-c1/c2/c3` con `neonHaloVars`.

---

### Aro partido (`glow.ts`)

Aro nítido con gradiente de 3 colores dividido en dos mitades que
arrancan del mismo punto (esquina superior izquierda) y se dibujan en
direcciones opuestas, encontrándose en la esquina inferior derecha —
requiere JavaScript porque un `<path>` con arcos de esquina necesita
coordenadas en unidades reales (el atributo `d` no admite `%` ni
`calc()`).

#### `neonRingSplitPaths(width, height, radius, inset)`

- **Descripción:** calcula los dos trazados (`d`) de las mitades del
  aro para un rectángulo redondeado, separado `inset` px del borde real
  (para que el trazo quede centrado sobre el borde).
- **Parámetros:**
  - `width: number`, `height: number` — tamaño real medido de la
    tarjeta en píxeles.
  - `radius: number` — radio de esquina de `ha-card`.
  - `inset: number` — normalmente la mitad del grosor del trazo.
- **Devuelve:** `{ top: string; bottom: string }` — los dos atributos
  `d` listos para un `<path>`.

#### `neonRingSplitTemplate(uid, width, height, radius)`

- **Descripción:** markup completo del `<svg>` con las dos mitades del
  aro (usa `neonRingSplitPaths` internamente), listo para insertar como
  primer hijo dentro de `ha-card`.
- **Parámetros:**
  - `uid: string` — identificador estable y único por instancia, evita
    que el `id` del `<linearGradient>` choque cuando hay varias
    tarjetas en el mismo dashboard.
  - `width: number`, `height: number`, `radius: number` — igual que en
    `neonRingSplitPaths`.
- **Devuelve:** `TemplateResult` (Lit).
- **Ejemplo:**
  ```ts
  neonRingSplitTemplate(this._ringUid, this._ringSize.width, this._ringSize.height, this._ringSize.radius)
  ```

**Uso:** la tarjeta anfitriona añade `NEON_RING_SPLIT_STYLES` a su
`static styles`, pone la clase `neon-ring-host` en el contenedor y
`neon-halo-active` cuando el estado es activo (comparte la clase con
`NEON_HALO_STYLES`).

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

---

## Neón Button Card — Configuración YAML

Todas las claves de `NeonButtonCardConfig` (`src/cards/button/types.ts`).
Ver ejemplos completos en [`examples/`](../../examples/README.md).

| Clave | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `entity` | `string` | — | Entidad principal, opcional. Determina el aro/icono activo cuando se define; sin ella, la tarjeta funciona igual (p. ej. para `tap_action: navigate`) pero nunca se marca como activa por estado. |
| `icon` | `string` | icono de la entidad o `mdi:gesture-tap-button` | Icono del botón. |
| `name` | `string` | — (vacío) | Título de la tarjeta. |
| `subtitle` | `string` | — (vacío) | Texto libre bajo el nombre, cuando `subtitle_type` es `'custom'` o no se indica. |
| `subtitle_type` | `'custom' \| 'name' \| 'state' \| 'last-changed' \| 'last-updated' \| 'none'` | `'custom'` | Con cualquier valor distinto de `'custom'`, calcula el subtítulo a partir de `entity` (reutiliza `computeInfoDisplay` de `src/core`) — requiere `entity`. |
| `top_sensor` | `SensorItemConfig` | — | Sensor suelto, encima del divisor, sin agrupar. |
| `sensors` | `SensorItemConfig[]` (máx. 3) | `[]` | Fila agrupada bajo el divisor, con separador vertical entre cada uno. |
| `neon_palette` | `'emerald' \| 'cyberpunk' \| 'electric' \| 'sunset' \| 'toxic' \| 'custom'` | `'emerald'` | Paleta del aro neón. `'custom'` habilita `neon_color1/2/3`. |
| `neon_color1` / `neon_color2` / `neon_color3` | `string` (hex) | según paleta | Colores del degradado cuando `neon_palette: custom`. |
| `tap_action` / `hold_action` / `double_tap_action` | `ActionConfig` | `toggle`/`more-info` (si hay `entity`) / `more-info` / `none` | Acciones estándar de Home Assistant. |

`SensorItemConfig` (`top_sensor` o cada elemento de `sensors`):

| Clave | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `entity` | `string` | — (requerida) | Solo dominios `sensor` o `binary_sensor`. |
| `icon` | `string` | calculado por `device_class` | Icono propio del sensor. |
| `decimals` | `number` | `1` (`DEFAULT_SENSOR_DECIMALS`) | Decimales al redondear el estado numérico. |

### `getGridOptions()` — tamaño automático

El ancho (`columns`) y el alto (`rows: 'auto'`) de la tarjeta en el grid
de HA se calculan solos según el contenido — no hace falta indicar
`grid_options` salvo para forzar un tamaño distinto:

| Contenido | `columns` |
|---|---|
| Sin sensores agrupados, o con 1 solo (con o sin `top_sensor`/`subtitle`) | `3` |
| 2 sensores agrupados | `5` |
| 3 sensores agrupados | `6` |

### Ejemplo completo

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
