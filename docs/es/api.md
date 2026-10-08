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
  - [Banner de versión (`banner.ts`)](#banner-de-versión-bannerts)
  - [Traducciones (`localize.ts`)](#traducciones-localizets)
- [`src/ha` — Tipos de Home Assistant](#srcha--tipos-de-home-assistant)
  - [Sensores (`sensors.ts`)](#sensores-sensorsts)
  - [Climate (`climate.ts`)](#climate-climatets)
- [`src/shared` — Paleta y efectos neón compartidos](#srcshared--paleta-y-efectos-neón-compartidos)
  - [Paleta (`neon-palette.ts`)](#paleta-neon-palettets)
  - [Halo de icono (`glow.ts`)](#halo-de-icono-glowts)
  - [Aro partido (`glow.ts`)](#aro-partido-glowts)
  - [Tamaño del aro (`ring-size.ts`)](#tamaño-del-aro-ring-sizets)
  - [Editor: carcasa común (`editor-form.styles.ts`)](#editor-carcasa-común-editor-formstylests)
  - [Traducciones compartidas (`translations/`)](#traducciones-compartidas-translations)
- [Neón Card Entity — Configuración YAML](#neón-card-entity--configuración-yaml)
- [Neón Button Card — Configuración YAML](#neón-button-card--configuración-yaml)
- [Neón Thermostat Card — Configuración YAML](#neón-thermostat-card--configuración-yaml)

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

#### `openMoreInfo(el, entityId)`

- **Descripción:** abre el diálogo "más información" de HA para una
  entidad concreta, directamente — sin pasar por `tap_action` (que es
  una acción configurable de toda la tarjeta, pensada para un único
  objetivo). Útil para un icono de acceso fijo a una entidad puntual
  dentro de la tarjeta (p. ej. varias entidades `climate` en la misma
  tarjeta, cada una con su propio botón — ver Neón Thermostat Card).
  Despacha el evento estándar `hass-more-info`, que la interfaz de HA
  ya escucha en cualquier parte del árbol.
- **Parámetros:**
  - `el: HTMLElement` — el elemento desde el que se despacha (`bubbles: true`, `composed: true`).
  - `entityId: string`.
- **Devuelve:** `void`.
- **Ejemplo:**
  ```ts
  openMoreInfo(this, 'climate.salon');
  ```

---

### Banner de versión (`banner.ts`)

#### `logCardBanner(cardName, author, version)`

- **Descripción:** escribe en la consola el banner de versión de una tarjeta (`NEON BUTTON CARD · By Jaguaza · v1.0.0`). Es un log, así que sigue el acuerdo nº22: **solo existe en modo desarrollo** (`npm run build:cards:dev`). En producción `__DEV__` vale `false`, el bundle no incluye ni el código ni los textos del banner, y la consola del usuario queda en silencio. Es el único punto del repositorio que escribe este mensaje: cada tarjeta lo llama una vez desde su `index.ts`.
- **Parámetros:**
  - `cardName: string` — nombre visible en mayúsculas, p. ej. `'NEON BUTTON CARD'`.
  - `author: string`.
  - `version: string`.
- **Devuelve:** `void`.
- **Ejemplo:**
  ```ts
  logCardBanner('NEON BUTTON CARD', CARD_AUTHOR, CARD_VERSION);
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

#### `getInfoLabels(hass)`

- **Descripción:** etiquetas de `INFO_OPTIONS` en el idioma resuelto de
  `hass` — usadas por ambos editores para pintar el `<select>` de
  información primaria/secundaria/subtítulo. Antes era `INFO_LABELS`, un
  `Record` fijo en español; ahora es una función porque el idioma
  depende de `hass.locale.language` en cada llamada (ver `localize` más
  abajo).
- **Parámetros:** `hass: HomeAssistant | undefined`.
- **Devuelve:** `Record<InfoOption, string>`.
- **Ejemplo:**
  ```ts
  getInfoLabels(hass).state; // 'Estado'
  ```

---

### Traducciones (`localize.ts`)

Motor de traducción genérico — ni un texto dentro, eso vive en
`translations/<locale>.ts` de cada módulo (`src/core`,
`src/shared`, y cada `src/cards/<nombre>`). `es` y `en` están poblados
en los 5 diccionarios del repo; añadir un tercer idioma sigue el mismo
patrón (ver "Cómo crear una tarjeta", sección 4, "Traducciones").

#### `resolveLocale(hass)`

- **Descripción:** resuelve qué locale usar a partir de
  `hass.locale.language` (p. ej. `'es'`, `'en'`, `'es-419'` — se compara
  solo la parte antes del guion).
- **Parámetros:** `hass: HomeAssistant | undefined`.
- **Devuelve:** `Locale` — cae a `DEFAULT_LOCALE` si no hay `hass`, si
  `hass.locale` falta, o si el idioma no está entre `SUPPORTED_LOCALES`.
- **Ejemplo:**
  ```ts
  resolveLocale(hass); // 'es'
  ```

#### `localize(hass, dict, key)`

- **Descripción:** devuelve la traducción de `key` en el idioma resuelto
  de `hass`, usando `dict` — el `Record<Locale, T>` del módulo que
  llama.
- **Parámetros:**
  - `hass: HomeAssistant | undefined`.
  - `dict: Record<Locale, T>` — p. ej. `CORE_TRANSLATIONS`,
    `SHARED_TRANSLATIONS`, o el `<NOMBRE>_TRANSLATIONS` de una tarjeta.
  - `key: keyof T`.
- **Devuelve:** `string` — cae a `dict[DEFAULT_LOCALE][key]` si el
  idioma resuelto no tiene esa clave (red de seguridad en runtime; no
  debería pasar si el diccionario cumple su interfaz `T`).
- **Ejemplo:**
  ```ts
  localize(hass, CORE_TRANSLATIONS, 'info_state'); // 'Estado'
  ```

#### Constantes y tipos

| Nombre | Descripción |
|---|---|
| `SUPPORTED_LOCALES` | `['es', 'en']` — se amplía aquí cuando se añade un idioma nuevo. |
| `Locale` | Tipo TypeScript derivado de `SUPPORTED_LOCALES`. |
| `DEFAULT_LOCALE` | `'es'` — idioma usado cuando `hass.locale.language` falta o no está soportado. |

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
  locale?: { language: string };
  callService(domain: string, service: string, serviceData?: Record<string, unknown>): Promise<void>;
}
```

- **`locale?.language`** — el idioma de la UI de HA (p. ej. `'es'`,
  `'en'`, `'es-419'`). De aquí sale el idioma que usa `localize` (ver
  `src/core`) para las tarjetas. Opcional porque en algunos contextos
  (tests, `hass` parcial) puede no estar.
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

### Climate (`climate.ts`)

Helpers de entidades `climate` (acuerdo nº4: las tarjetas nunca leen
`hass.states` a mano para esto). Los usa la Neón Thermostat Card;
cualquier tarjeta futura que controle climatización debería
reutilizarlos en vez de releer `hass.states` por su cuenta.

#### `getClimateState(entityId, hass)`

- **Descripción:** lee estado y capacidades de una entidad `climate` —
  modo actual, modos soportados, temperaturas actual/consigna,
  min/max/step (con fallback si la entidad no los expone), y si está
  disponible.
- **Parámetros:**
  - `entityId: string` — debe empezar por `climate.`.
  - `hass: HomeAssistant`.
- **Devuelve:** `ClimateState | null` — `null` si `entityId` no es del
  dominio `climate` o no existe en `hass.states`.
  ```ts
  interface ClimateState {
    entity: string;
    mode: HvacMode;
    hvacModes: HvacMode[];
    hvacAction: HvacAction | null;
    currentTemperature: number | null;
    targetTemperature: number | null;
    minTemp: number; // fallback 7 si la entidad no lo expone
    maxTemp: number; // fallback 35
    step: number; // fallback 0.5
    available: boolean; // false si unavailable/unknown
    presetMode: string | null; // `preset_mode` actual
    presetModes: string[]; // `preset_modes`; [] = sin presets
    fanMode: string | null; // `fan_mode` actual
    fanModes: string[]; // `fan_modes`; [] = sin ventilador
  }
  ```
  Las listas descartan duplicados y valores que no sean texto.
- **Ejemplo:**
  ```ts
  const c = getClimateState('climate.salon', hass);
  // c?.mode === 'heat', c?.targetTemperature === 21
  ```

#### `formatClimateOption(hass, entityId, attribute, value)`

- **Descripción:** nombre legible de un valor de `preset_mode` o `fan_mode`. Usa `hass.formatEntityAttributeValue` si existe (ya viene traducido al idioma del usuario); si no, o si devuelve un texto vacío, humaniza el valor crudo (`away_mode` → `Away mode`).
- **Parámetros:**
  - `hass: HomeAssistant | undefined`.
  - `entityId: string`.
  - `attribute: 'preset_mode' | 'fan_mode'`.
  - `value: string`.
- **Devuelve:** `string`.
- **Ejemplo:**
  ```ts
  formatClimateOption(hass, 'climate.salon', 'fan_mode', 'medium_high'); // 'Medium high' (sin formateador de HA)
  ```

#### `clampToStep(value, min, max, step)`

- **Descripción:** redondea `value` al múltiplo de `step` más cercano,
  dentro de `[min, max]` — usado por los controles −/+ y por el
  arrastre del dial/aro.
- **Parámetros:** `value: number`, `min: number`, `max: number`, `step: number`.
- **Devuelve:** `number`.
- **Ejemplo:**
  ```ts
  clampToStep(21.3, 7, 35, 0.5); // 21.5
  ```

#### `isClimateRunning(state)`

- **Descripción:** `true` si el equipo está funcionando de verdad ahora
  mismo, no solo "seleccionado en modo X". Usa `hvac_action` si la
  entidad lo expone; si no, compara consigna vs. temperatura actual
  según el modo (`heat`: actual < consigna; `cool`: actual > consigna).
- **Parámetros:** `state: ClimateState`.
- **Devuelve:** `boolean` — siempre `false` en modo `'off'`.
- **Ejemplo:**
  ```ts
  isClimateRunning(c); // true si está calentando de verdad
  ```

#### Constantes y tipos

| Nombre | Descripción |
|---|---|
| `HVAC_MODES` | `['off', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only']`. |
| `HvacMode` | Tipo TypeScript derivado de `HVAC_MODES`. |
| `HvacAction` | `'off' \| 'idle' \| 'preheating' \| 'heating' \| 'cooling' \| 'drying' \| 'fan'` — lo que el equipo está haciendo AHORA, distinto del modo seleccionado. |

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
| `NeonPreset` | `{ name: string; c1: string; c2: string; c3: string }`. `name` es un campo congelado (acuerdo nº25) que **no** se usa para pintar la UI — para eso está `getPaletteName`, justo abajo. |
| `GradientColors` | `{ c1: string; c2: string; c3: string }` — lo que devuelve `resolveGradientColors`. |

#### `getPaletteName(hass, presetId)`

- **Descripción:** nombre visible de un preset, en el idioma resuelto de
  `hass` (ver `localize` en `src/core`) — la fuente real que ambos
  editores usan para pintar el `<select>` de paleta. Distinto de
  `NEON_PRESETS[x].name`: ese campo quedó congelado con el texto que
  tenía en el momento del freeze y ya no lo lee nadie para renderizar.
- **Parámetros:**
  - `hass: HomeAssistant | undefined`
  - `presetId: string` — p. ej. `'emerald'`.
- **Devuelve:** `string` — el texto localizado, o el propio `presetId`
  tal cual si no coincide con ningún preset conocido.
- **Ejemplo:**
  ```ts
  getPaletteName(hass, 'cyberpunk'); // 'Cyberpunk Pink (Rosa / Carmesí / Púrpura)'
  ```

#### `getPaletteCustomLabel(hass)`

- **Descripción:** texto de la opción `"custom"` del propio selector de
  paleta — compartido entre tarjetas por el mismo motivo que
  `getPaletteName`.
- **Parámetros:** `hass: HomeAssistant | undefined`.
- **Devuelve:** `string`.

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
  neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)
  ```

**Uso:** la tarjeta anfitriona añade `NEON_RING_SPLIT_STYLES` a su
`static styles`, pone la clase `neon-ring-host` en el contenedor y
`neon-halo-active` cuando el estado es activo (comparte la clase con
`NEON_HALO_STYLES`).

---

### Tamaño del aro (`ring-size.ts`)

#### `RingSizeController`

- **Descripción:** controlador reactivo de Lit que mantiene al día el tamaño real de `ha-card` (ancho, alto y radio de borde), que `neonRingSplitTemplate` necesita porque el atributo `d` de un `<path>` no admite porcentajes. Sustituye al bucle `requestAnimationFrame` continuo que usaban Button y Thermostat (60 callbacks por segundo y tarjeta, también en reposo). Mide solo cuando puede haber cambiado algo:
  1. `ResizeObserver` sobre el `ha-card` **actual**: si Lit lo sustituye (p. ej. al pasar de «entidad no disponible» a la vista normal), se vuelve a observar el nuevo, porque un observer atado a un nodo descartado no avisa más.
  2. Una medida tras cada renderizado, fusionada en un único frame, que recoge lo que el observer no ve (el radio de borde del tema).
  3. Una ráfaga corta de medidas al conectar (30 frames, ~0,5 s) para la carrera de layout cuando el editor de HA crea o mueve la tarjeta.

  Al desconectar se cancela todo, y al reconectar se crea un observer nuevo. En reposo no queda ningún callback programado.
- **Constructor:** `new RingSizeController(host, selector = 'ha-card')`, con `host` una `ReactiveElement` (se registra solo con `addController`).
- **Propiedad:** `size: RingSize` — `{ width, height, radius }`, última medida válida. Se descartan las lecturas menores de 4 px (tarjeta oculta o sin layout).
- **Efecto:** cuando la medida cambia, llama a `host.requestUpdate()`; la tarjeta solo tiene que leer `size` en `render()`.
- **Requisito:** `ResizeObserver` solo informa de elementos con caja (`display` distinto de `inline`). El `ha-card` de Home Assistant la tiene; si una tarjeta usa otro elemento, su CSS debe darle `display: block` o `flex`.
- **Ejemplo:**
  ```ts
  private readonly _ring = new RingSizeController(this);

  render() {
    const { width, height, radius } = this._ring.size;
    return html`<ha-card>${neonRingSplitTemplate(this._ringUid, width, height, radius)}…</ha-card>`;
  }
  ```

---

### Editor: carcasa común (`editor-form.styles.ts`)

#### `NEON_EDITOR_FORM_STYLES`

- **Descripción:** hoja `css` (Lit) con la "carcasa" visual común a
  cualquier editor de tarjeta con formulario de secciones —
  `.editor-container`, `.editor-section`, `.section-header`,
  `.action-item`/`.action-title`, `.custom-colors-grid`,
  `.color-picker-wrapper`, `input[type=color]`, `.native-select-label`,
  `.native-select`, `.native-input`. Antes Button y Entity tenían estas
  11 reglas duplicadas byte a byte, cada una en su propio archivo de
  estilos (acuerdo nº4).
- **Uso:** el editor de una tarjeta la compone en `static styles` junto
  a lo que sí es específico suyo:
  ```ts
  static styles = [NEON_EDITOR_FORM_STYLES, MI_TARJETA_EDITOR_STYLES];
  ```
  Lo que NO va aquí: clases específicas de una sola tarjeta (en Button,
  `.sensor-card`/`.sensor-row`/`.field`; en Entity,
  `.two-col-grid`/`.field-col`/`ha-formfield`) — esas se quedan en el
  archivo de estilos propio de cada editor.

---

### Traducciones compartidas (`translations/`)

Contenido textual que es **el mismo widget con el mismo texto fijo** en
más de una tarjeta — no cualquier coincidencia textual (ver la regla
completa en "Cómo crear una tarjeta", sección 4). Hoy: los nombres de
preset de paleta y su opción "personalizado" (consumidos vía
`getPaletteName`/`getPaletteCustomLabel`, arriba), los 3 stops de color
del selector de paleta, y la sección de acciones tap/hold/double_tap.

Se usa igual que cualquier otro diccionario de `localize` (ver
`src/core`):

```ts
localize(hass, SHARED_TRANSLATIONS, 'action_tap'); // '1 Toque (Tap)'
```

#### Constantes y tipos

| Nombre | Descripción |
|---|---|
| `SHARED_TRANSLATIONS` | `Record<Locale, SharedTranslations>` — hoy solo `{ es }`. |
| `SharedTranslations` | Interfaz con las 13 claves: `palette_emerald`, `palette_cyberpunk`, `palette_electric`, `palette_sunset`, `palette_toxic`, `palette_custom`, `color_start`, `color_middle`, `color_end`, `section_actions`, `action_tap`, `action_hold`, `action_double_tap`. |

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

---

## Neón Thermostat Card — Configuración YAML

Todas las claves de `NeonThermostatCardConfig`
(`src/cards/thermostat/types.ts`). Ver ejemplos completos en
[`examples/`](../../examples/README.md).

| Clave | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `entity` | `string` | — (requerida) | Entidad `climate` principal. |
| `entity_2` | `string` | — | Segunda entidad `climate` opcional — dos equipos separados (p. ej. calefacción + aire acondicionado) en vez de uno solo que soporte todos los modos. Sin ella, la tarjeta se comporta exactamente igual que con una sola entidad. |
| `mode_owner` | `Partial<Record<HvacMode, 1 \| 2>>` | — | Solo relevante con `entity_2` y solo para modos que soportan AMBAS entidades a la vez — `1` = `entity`, `2` = `entity_2`. Sin entrada para un modo, gana `entity` por defecto. |
| `name` | `string` | nombre de la entidad | Título de la tarjeta. En la vista compacta, si no se indica, no se muestra ningún nombre (para no ocupar espacio). |
| `size` | `'large' \| 'normal' \| 'compact'` | `'normal'` | Tamaño de la tarjeta — ver `getGridOptions()` más abajo. |
| `color` | `string \| { mode: 'state' } \| { mode: 'custom', heat?, cool?, heat_cool?, auto?, dry?, fan_only?, off? }` | `{ mode: 'state' }` | Color del dial/aro por modo HVAC. `string`: un único color para todos los modos. `{ mode: 'state' }`: colores semánticos automáticos por modo (equivalente a no indicar `color`). `{ mode: 'custom', ... }`: color propio por modo; los no indicados caen al semántico por defecto de ese modo. |
| `neon_palette` | `'emerald' \| 'cyberpunk' \| 'electric' \| 'sunset' \| 'toxic' \| 'custom'` | `'emerald'` | Paleta del ARO PERIMETRAL de la tarjeta (el borde, no el dial — ese sigue `color` arriba). |
| `neon_color1` / `neon_color2` / `neon_color3` | `string` (hex) | según paleta | Colores del degradado del aro perimetral cuando `neon_palette: custom`. |
| `step` | `number` | `target_temp_step` de la entidad, o `0.5` | Incremento de los controles −/+ y del arrastre. |
| `footer` | `FooterSensorConfig[]` (máx. 3) | `[]` | Solo dominios `sensor`/`binary_sensor`. Sin footer en la vista compacta (`size: compact`), da igual lo que se configure aquí. |

`FooterSensorConfig` (cada elemento de `footer`):

| Clave | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `entity` | `string` | — (requerida) | Solo dominios `sensor` o `binary_sensor`. |
| `icon` | `string` | calculado por `device_class` | Icono propio del sensor. |

No hay campo `icon` a nivel de tarjeta: el icono no es configurable,
siempre se deriva del modo HVAC actual (`HVAC_MODE_ICONS`).

### `getGridOptions()` — tamaño según `size`

A diferencia de Button, el tamaño no se calcula del contenido — lo
elige directamente la clave `size`:

| `size` | `columns` | `rows` |
|---|---|---|
| `'compact'` | `4` | `'auto'` |
| `'normal'` (por defecto) | `6` | `'auto'` |
| `'large'` | `12` | `'auto'` |

### Ejemplo completo

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
step: 0.5
footer:
  - entity: sensor.salon_temperature
  - entity: sensor.salon_humidity
  - entity: binary_sensor.salon_presencia
    icon: mdi:motion-sensor
```

