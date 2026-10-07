# API Reference

Documentation for all of Neón Cards' public API: the base framework
(`src/core`), the Home Assistant types (`src/ha`), and each card's YAML
configuration. Follows agreement nº16's format: description, parameters,
return value, and example.

See also the [Spanish version](../es/api.md).

## Table of contents

- [`src/core` — Base framework](#srccore--base-framework)
  - [`BaseNeonCard`](#baseneoncard)
  - [Gestures (`gestures.ts`)](#gestures-gesturests)
  - [Actions (`actions.ts`)](#actions-actionsts)
  - [Primary/secondary info (`info.ts`)](#primarysecondary-info-infots)
  - [Version banner (`banner.ts`)](#version-banner-bannerts)
  - [Translations (`localize.ts`)](#translations-localizets)
- [`src/ha` — Home Assistant types](#srcha--home-assistant-types)
  - [Sensors (`sensors.ts`)](#sensors-sensorsts)
  - [Climate (`climate.ts`)](#climate-climatets)
- [`src/shared` — Shared neon palette and effects](#srcshared--shared-neon-palette-and-effects)
  - [Palette (`neon-palette.ts`)](#palette-neon-palettets)
  - [Icon halo (`glow.ts`)](#icon-halo-glowts)
  - [Split ring (`glow.ts`)](#split-ring-glowts)
  - [Ring size (`ring-size.ts`)](#ring-size-ring-sizets)
  - [Editor: shared shell (`editor-form.styles.ts`)](#editor-shared-shell-editor-formstylests)
  - [Shared translations (`translations/`)](#shared-translations-translations)
- [Neón Card Entity — YAML configuration](#neón-card-entity--yaml-configuration)
- [Neón Button Card — YAML configuration](#neón-button-card--yaml-configuration)
- [Neón Thermostat Card — YAML configuration](#neón-thermostat-card--yaml-configuration)

---

## `src/core` — Base framework

### `BaseNeonCard`

Abstract base class every Neón Cards card extends. Built on
[Lit](https://lit.dev), **without decorators** (agreement nº10).

```ts
import { BaseNeonCard } from '../../core';

export class MyCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };
  // ...
}
```

#### Properties

| Property | Type | Description |
|---|---|---|
| `hass` | `HomeAssistant \| undefined` | Home Assistant's `hass` object. Declared as a Lit reactive property (`static properties`), so assigning it triggers a `render()`. |

#### `getCardSize()`

- **Description:** the card's size for the masonry-style view (1 unit ≈ 50px). Defaults to `1`.
- **Parameters:** none.
- **Returns:** `number`.
- **Example:**
  ```ts
  getCardSize(): number {
    return this._rows; // overridden in a subclass based on actual content
  }
  ```

#### `getGridOptions()`

- **Description:** the card's size for Home Assistant's sections view (1 row ≈ 56px + gap). Defaults to `{ rows: 1, columns: 12 }`.
- **Parameters:** none.
- **Returns:** `{ rows: number; columns: number }`.
- **Example:**
  ```ts
  getGridOptions(): { rows: number; columns: number } {
    return { rows: this._rows, columns: 12 };
  }
  ```

---

### Gestures (`gestures.ts`)

Tap / hold / double-tap gesture handling, shared by every card (agreement
nº4). Each gesture's state is kept **outside** of `render()` on purpose:
in Lit, `render()` re-runs on every reactive update, so local variables
wouldn't survive between taps.

#### `createGestureState()`

- **Description:** creates an empty state object for a gesture. Each card keeps one instance per entity (typically in a `Map`).
- **Parameters:** none.
- **Returns:** `GestureState` — `{ holdTimer?, isHoldActive: boolean, lastTapTime: number, tapTimeout? }`.
- **Example:**
  ```ts
  private _gestures = new Map<string, GestureState>();
  const state = this._gestures.get(entityId) ?? createGestureState();
  ```

#### `handlePointerDown(state, ev, ignoreSelector, onHold)`

- **Description:** starts the "hold" timer. Called on the `pointerdown` event.
- **Parameters:**
  - `state: GestureState` — that entity's gesture state.
  - `ev: PointerEvent` — the browser event.
  - `ignoreSelector: string` — CSS selector for elements where a tap should not start a gesture (e.g. `.switch`, so tapping the switch itself doesn't also trigger `hold`).
  - `onHold: () => void` — callback run if the hold completes.
- **Returns:** `void`.
- **Example:**
  ```ts
  @pointerdown=${(ev: PointerEvent) =>
    handlePointerDown(gesture, ev, '.switch', () => this._handleAction(ent, 'hold'))}
  ```

#### `cancelHold(state)`

- **Description:** cancels an in-progress hold timer (`pointerup`/`pointercancel` event).
- **Parameters:** `state: GestureState`.
- **Returns:** `void`.
- **Example:** `@pointerup=${() => cancelHold(gesture)}`

#### `handleClick(state, ev, ignoreSelector, handlers)`

- **Description:** resolves a click as `tap` or `double_tap`, only waiting out the double-tap window (`DOUBLE_TAP_DELAY_MS`) if the card has a double-tap action configured.
- **Parameters:**
  - `state: GestureState`.
  - `ev: MouseEvent`.
  - `ignoreSelector: string`.
  - `handlers: TapHandlers` — `{ onTap: () => void; onDoubleTap: () => void; hasDoubleTap: boolean }`.
- **Returns:** `void`.
- **Example:**
  ```ts
  @click=${(ev: MouseEvent) =>
    handleClick(gesture, ev, '.switch', {
      onTap: () => this._handleAction(ent, 'tap'),
      onDoubleTap: () => this._handleAction(ent, 'double_tap'),
      hasDoubleTap,
    })}
  ```

#### Constants

| Constant | Value | Description |
|---|---|---|
| `HOLD_DELAY_MS` | `500` | Milliseconds to hold before `hold` fires. |
| `DOUBLE_TAP_DELAY_MS` | `280` | Time window to detect a double tap. |

---

### Actions (`actions.ts`)

#### `dispatchHassAction(el, actionConfig, action)`

- **Description:** dispatches the `hass-action` event Home Assistant listens for to run `tap_action` / `hold_action` / `double_tap_action`.
- **Parameters:**
  - `el: HTMLElement` — the element to dispatch from (usually `this`, with `bubbles: true`).
  - `actionConfig: Record<string, unknown>` — the action configuration (entity, tap_action, hold_action, double_tap_action).
  - `action: string` — which of the three to run: `'tap' | 'hold' | 'double_tap'`.
- **Returns:** `void`.
- **Example:**
  ```ts
  dispatchHassAction(this, {
    entity: ent.entity,
    tap_action: this._config.tap_action,
    hold_action: this._config.hold_action,
    double_tap_action: this._config.double_tap_action,
  }, 'tap');
  ```

#### `openMoreInfo(el, entityId)`

- **Description:** opens HA's "more info" dialog for a specific entity
  directly — without going through `tap_action` (a whole-card
  configurable action meant for a single target). Useful for a fixed
  access icon to one particular entity within the card (e.g. several
  `climate` entities on the same card, each with its own button — see
  the Neón Thermostat Card). Dispatches the standard `hass-more-info`
  event, which HA's UI already listens for anywhere in the tree.
- **Parameters:**
  - `el: HTMLElement` — the element to dispatch from (`bubbles: true`, `composed: true`).
  - `entityId: string`.
- **Returns:** `void`.
- **Example:**
  ```ts
  openMoreInfo(this, 'climate.living_room');
  ```

---

### Version banner (`banner.ts`)

#### `logCardBanner(cardName, author, version)`

- **Description:** writes a card's version banner to the console (`NEON BUTTON CARD · By Jaguaza · v1.0.0`). It is a log, so it follows agreement nº22: **it only exists in development mode** (`npm run build:cards:dev`). In production `__DEV__` is `false`, the bundle includes neither the code nor the banner texts, and the user's console stays silent. It is the only place in the repository that writes this message: each card calls it once from its `index.ts`.
- **Parameters:**
  - `cardName: string` — display name in capitals, e.g. `'NEON BUTTON CARD'`.
  - `author: string`.
  - `version: string`.
- **Returns:** `void`.
- **Example:**
  ```ts
  logCardBanner('NEON BUTTON CARD', CARD_AUTHOR, CARD_VERSION);
  ```

---

### Primary/secondary info (`info.ts`)

#### `computeInfoDisplay(info, name, state, stateObj, hass)`

- **Description:** computes what to display as an entity's primary or secondary info.
- **Parameters:**
  - `info: InfoOption` — one of `'name' | 'state' | 'last-changed' | 'last-updated' | 'none'`.
  - `name: string` — the entity's already-resolved name.
  - `state: string` — the current state (`stateObj.state`).
  - `stateObj: HassEntityState` — the full state object (used for `last_changed`/`last_updated`).
  - `hass: HomeAssistant`.
- **Returns:** `string | TemplateResult | typeof nothing` — a plain string for `name`/`state`, a Lit template with `<ha-relative-time>` for the date-based options, or `nothing` when `info` is `'none'`.
- **Example:**
  ```ts
  const primaryText = computeInfoDisplay('last-changed', name, stateObj.state, stateObj, hass);
  ```

#### Constants and types

| Name | Description |
|---|---|
| `INFO_OPTIONS` | `['name', 'state', 'last-changed', 'last-updated', 'none']` — the valid options. |
| `InfoOption` | TypeScript type derived from `INFO_OPTIONS`. |

#### `getInfoLabels(hass)`

- **Description:** `INFO_OPTIONS` labels in the locale resolved from
  `hass` — used by both editors to render the primary/secondary
  info/subtitle `<select>`. It used to be `INFO_LABELS`, a fixed
  Spanish `Record`; it's a function now because the language depends on
  `hass.locale.language` on every call (see `localize` below).
- **Parameters:** `hass: HomeAssistant | undefined`.
- **Returns:** `Record<InfoOption, string>`.
- **Example:**
  ```ts
  getInfoLabels(hass).state; // 'Estado'
  ```

---

### Translations (`localize.ts`)

Generic translation engine — no text lives in here, that's in each
module's `translations/<locale>.ts` (`src/core`, `src/shared`, and
every `src/cards/<name>`). `es` and `en` are populated across the
repo's 5 dictionaries; adding a third locale follows the same pattern
(see "How to build a card", section 4, "Translations").

#### `resolveLocale(hass)`

- **Description:** resolves which locale to use from
  `hass.locale.language` (e.g. `'es'`, `'en'`, `'es-419'` — only the
  part before the dash is compared).
- **Parameters:** `hass: HomeAssistant | undefined`.
- **Returns:** `Locale` — falls back to `DEFAULT_LOCALE` if `hass` is
  missing, `hass.locale` is missing, or the language isn't in
  `SUPPORTED_LOCALES`.
- **Example:**
  ```ts
  resolveLocale(hass); // 'es'
  ```

#### `localize(hass, dict, key)`

- **Description:** returns the translation for `key` in the locale
  resolved from `hass`, using `dict` — the calling module's
  `Record<Locale, T>`.
- **Parameters:**
  - `hass: HomeAssistant | undefined`.
  - `dict: Record<Locale, T>` — e.g. `CORE_TRANSLATIONS`,
    `SHARED_TRANSLATIONS`, or a card's `<NAME>_TRANSLATIONS`.
  - `key: keyof T`.
- **Returns:** `string` — falls back to `dict[DEFAULT_LOCALE][key]` if
  the resolved locale doesn't have that key (a runtime safety net; this
  shouldn't happen if the dictionary satisfies its `T` interface).
- **Example:**
  ```ts
  localize(hass, CORE_TRANSLATIONS, 'info_state'); // 'Estado'
  ```

#### Constants and types

| Name | Description |
|---|---|
| `SUPPORTED_LOCALES` | `['es', 'en']` — extend this here when a new locale is added. |
| `Locale` | TypeScript type derived from `SUPPORTED_LOCALES`. |
| `DEFAULT_LOCALE` | `'es'` — used when `hass.locale.language` is missing or unsupported. |

---

## `src/ha` — Home Assistant types

Minimal types for the `hass` object, extended as each card needs more of
the surface (never copied into an individual card — agreement nº4).

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

- **`locale?.language`** — HA's UI language (e.g. `'es'`, `'en'`,
  `'es-419'`). This is where `localize` (see `src/core`) gets the
  language it uses for cards. Optional because it may be absent in some
  contexts (tests, a partial `hass`).
- **`callService(domain, service, serviceData)`** — calls a Home Assistant service.
  - `domain: string` — e.g. `'light'`, `'switch'`, `'homeassistant'`.
  - `service: string` — e.g. `'toggle'`, `'turn_on'`.
  - `serviceData?: Record<string, unknown>` — e.g. `{ entity_id: 'light.living_room' }`.
  - **Returns:** `Promise<void>`.

---

### Sensors (`sensors.ts`)

Helpers for `sensor`/`binary_sensor` entities (cards never read
`hass.states` by hand for this — agreement nº4). Currently used by the
Button Card (`top_sensor`/`sensors`); any future card that shows
contextual sensors should reuse these instead of reading `hass.states`
directly.

#### `getSensorDisplay(entityId, hass, options?)`

- **Description:** already-formatted icon/state/unit for a
  `sensor`/`binary_sensor` entity, ready to render. The icon is
  computed from `device_class` when none is given explicitly; the
  state is rounded to `options.decimals` decimals (default `1`) when
  numeric, and left untouched otherwise (e.g. `"Closed"`, a
  `binary_sensor`'s `"on"`/`"off"`).
- **Parameters:**
  - `entityId: string` — e.g. `'sensor.living_room_temperature'`.
  - `hass: HomeAssistant`.
  - `options?: { icon?: string; decimals?: number }` — override the
    automatically computed icon/decimals for that sensor.
- **Returns:** `SensorDisplay | null` — `null` if `entityId` doesn't
  belong to the `sensor`/`binary_sensor` domains (`SENSOR_DOMAINS`).
  ```ts
  interface SensorDisplay {
    entity: string;
    icon: string;
    state: string;
    unit: string;
    available: boolean; // false when unavailable/unknown or missing
  }
  ```
- **Example:**
  ```ts
  const d = getSensorDisplay('sensor.living_room_humidity', hass, { decimals: 0 });
  // d?.icon === 'mdi:water-percent', d?.state === '47', d?.unit === '%'
  ```

#### `formatSensorState(state, decimals?)`

- **Description:** rounds a numeric state to `decimals` decimals
  (default `1`); leaves any non-numeric state untouched.
- **Parameters:**
  - `state: string` — `stateObj.state` as-is.
  - `decimals?: number` — defaults to `DEFAULT_SENSOR_DECIMALS` (`1`).
- **Returns:** `string`.
- **Example:**
  ```ts
  formatSensorState('21.456', 1); // '21.5'
  formatSensorState('unavailable'); // 'unavailable' (unchanged)
  ```

#### Constants and types

| Name | Description |
|---|---|
| `SENSOR_DOMAINS` | `['sensor', 'binary_sensor']` — the only domains accepted by `getSensorDisplay`. |
| `SensorDomain` | TypeScript type derived from `SENSOR_DOMAINS`. |
| `DEFAULT_SENSOR_DECIMALS` | `1` — default decimals when a sensor doesn't specify its own. |

---

### Climate (`climate.ts`)

Helpers for `climate` entities (agreement nº4: cards never read
`hass.states` by hand for this). Used by the Neón Thermostat Card; any
future climate-control card should reuse these instead of re-reading
`hass.states` on its own.

#### `getClimateState(entityId, hass)`

- **Description:** reads state and capabilities of a `climate` entity —
  current mode, supported modes, current/target temperature,
  min/max/step (with a fallback when the entity doesn't expose them),
  and availability.
- **Parameters:**
  - `entityId: string` — must start with `climate.`.
  - `hass: HomeAssistant`.
- **Returns:** `ClimateState | null` — `null` if `entityId` isn't in
  the `climate` domain or doesn't exist in `hass.states`.
  ```ts
  interface ClimateState {
    entity: string;
    mode: HvacMode;
    hvacModes: HvacMode[];
    hvacAction: HvacAction | null;
    currentTemperature: number | null;
    targetTemperature: number | null;
    minTemp: number; // falls back to 7 if the entity doesn't expose it
    maxTemp: number; // falls back to 35
    step: number; // falls back to 0.5
    available: boolean; // false if unavailable/unknown
    presetMode: string | null; // current `preset_mode`
    presetModes: string[]; // `preset_modes`; [] = no presets
    fanMode: string | null; // current `fan_mode`
    fanModes: string[]; // `fan_modes`; [] = no fan
  }
  ```
  The lists drop duplicates and non-text values.
- **Example:**
  ```ts
  const c = getClimateState('climate.living_room', hass);
  // c?.mode === 'heat', c?.targetTemperature === 21
  ```

#### `formatClimateOption(hass, entityId, attribute, value)`

- **Description:** human-readable name of a `preset_mode` or `fan_mode` value. It uses `hass.formatEntityAttributeValue` when available (already translated to the user's language); otherwise, or if it returns an empty string, it humanizes the raw value (`away_mode` → `Away mode`).
- **Parameters:**
  - `hass: HomeAssistant | undefined`.
  - `entityId: string`.
  - `attribute: 'preset_mode' | 'fan_mode'`.
  - `value: string`.
- **Returns:** `string`.
- **Example:**
  ```ts
  formatClimateOption(hass, 'climate.living_room', 'fan_mode', 'medium_high'); // 'Medium high' (without HA's formatter)
  ```

#### `clampToStep(value, min, max, step)`

- **Description:** rounds `value` to the nearest multiple of `step`,
  within `[min, max]` — used by the −/+ controls and by dragging the
  dial/ring.
- **Parameters:** `value: number`, `min: number`, `max: number`, `step: number`.
- **Returns:** `number`.
- **Example:**
  ```ts
  clampToStep(21.3, 7, 35, 0.5); // 21.5
  ```

#### `isClimateRunning(state)`

- **Description:** `true` if the equipment is actually running right
  now, not just "selected on mode X". Uses `hvac_action` when the
  entity exposes it; otherwise compares target vs. current temperature
  based on the mode (`heat`: current < target; `cool`: current >
  target).
- **Parameters:** `state: ClimateState`.
- **Returns:** `boolean` — always `false` in `'off'` mode.
- **Example:**
  ```ts
  isClimateRunning(c); // true if it's actually heating
  ```

#### Constants and types

| Name | Description |
|---|---|
| `HVAC_MODES` | `['off', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only']`. |
| `HvacMode` | TypeScript type derived from `HVAC_MODES`. |
| `HvacAction` | `'off' \| 'idle' \| 'preheating' \| 'heating' \| 'cooling' \| 'drying' \| 'fan'` — what the equipment is doing RIGHT NOW, distinct from the selected mode. |

---

## `src/shared` — Shared neon palette and effects

The visual pieces shared between cards (agreement nº4: never copied
per card). Born in Neón Card Entity, also consumed by Neón Button
Card. Intentionally independent from the Home Assistant theme: the
"neon" identity doesn't depend on the active theme — only the rest of
the card (background, text) does, through HA CSS variables.

### Palette (`neon-palette.ts`)

#### `resolveGradientColors(config)`

- **Description:** resolves a card's 3 neon gradient colors from its
  config — the same calculation for every card (it used to live
  duplicated inside each one).
- **Parameters:**
  - `config: NeonPaletteConfig | undefined`
    ```ts
    interface NeonPaletteConfig {
      neon_palette?: string; // 'emerald' | 'cyberpunk' | 'electric' | 'sunset' | 'toxic' | 'custom'
      neon_color1?: string;  // only read when neon_palette === 'custom'
      neon_color2?: string;
      neon_color3?: string;
    }
    ```
- **Returns:** `GradientColors` — `{ c1: string; c2: string; c3: string }`. With `neon_palette: 'custom'` it uses `neon_color1/2/3` (falling back to the default preset if missing); with any other value (or none) it uses the matching preset's colors from `NEON_PRESETS`.
- **Example:**
  ```ts
  resolveGradientColors({ neon_palette: 'cyberpunk' });
  // { c1: '#ff2a85', c2: '#ff0055', c3: '#7a00ff' }
  ```

#### Constants and types

| Name | Description |
|---|---|
| `NEON_PRESETS` | `Record<string, NeonPreset>` — the 5 presets (`emerald`, `cyberpunk`, `electric`, `sunset`, `toxic`), each `{ name, c1, c2, c3 }`. |
| `DEFAULT_PALETTE` | `'emerald'` — preset used when `neon_palette` is unset or doesn't exist. |
| `NeonPreset` | `{ name: string; c1: string; c2: string; c3: string }`. `name` is a frozen field (agreement nº25) that is **not** used to render the UI — see `getPaletteName` right below for that. |
| `GradientColors` | `{ c1: string; c2: string; c3: string }` — what `resolveGradientColors` returns. |

#### `getPaletteName(hass, presetId)`

- **Description:** a preset's visible name, in the locale resolved from
  `hass` (see `localize` in `src/core`) — the real source both editors
  use to render the palette `<select>`. Different from
  `NEON_PRESETS[x].name`: that field was frozen with whatever text it
  had at freeze time and nothing reads it to render anymore.
- **Parameters:**
  - `hass: HomeAssistant | undefined`
  - `presetId: string` — e.g. `'emerald'`.
- **Returns:** `string` — the localized text, or `presetId` itself
  as-is if it doesn't match any known preset.
- **Example:**
  ```ts
  getPaletteName(hass, 'cyberpunk'); // 'Cyberpunk Pink (Rosa / Carmesí / Púrpura)'
  ```

#### `getPaletteCustomLabel(hass)`

- **Description:** text for the palette selector's own `"custom"`
  option — shared across cards for the same reason as `getPaletteName`.
- **Parameters:** `hass: HomeAssistant | undefined`.
- **Returns:** `string`.

---

### Icon halo (`glow.ts`)

Reusable icon glow: in the active state it takes on the palette's
color with a double/triple `drop-shadow` layer instead of the theme's
neutral color, so the light appears to originate from the icon itself.

- **`NEON_HALO_STYLES`** — Lit `css` block with the
  `.neon-halo-icon` / `.neon-halo-active .neon-halo-icon` /
  `.neon-halo-error .neon-halo-icon` rules. Added to the host card's
  `static styles`.
- **`neonHaloVars(colors)`**
  - **Description:** sets the `--neon-c1/c2/c3` CSS variables that
    `NEON_HALO_STYLES` consumes.
  - **Parameters:** `colors: GradientColors`.
  - **Returns:** `string` — for direct use in the host's `style`
    attribute.
  - **Example:** `style=${neonHaloVars(resolveGradientColors(this._config))}`

**Usage:** the host card adds `NEON_HALO_STYLES` to its `static
styles`, puts the `neon-halo-icon` class on the `<ha-icon>`, and
`neon-halo-active` (active state) or `neon-halo-error` (broken/missing
entity — fixed neon red, not the palette) on an ancestor (usually the
host), setting `--neon-c1/c2/c3` with `neonHaloVars`.

---

### Split ring (`glow.ts`)

A crisp 3-color gradient ring split into two halves that both start
from the same point (top-left corner) and draw in opposite directions,
meeting at the bottom-right corner — requires JavaScript because a
`<path>` with corner arcs needs real-unit coordinates (the `d`
attribute doesn't support `%` or `calc()`).

#### `neonRingSplitPaths(width, height, radius, inset)`

- **Description:** computes the two path (`d`) strings for the ring's
  halves for a rounded rectangle, inset by `inset` px from the actual
  edge (so the stroke sits centered on the border).
- **Parameters:**
  - `width: number`, `height: number` — the card's real measured size
    in pixels.
  - `radius: number` — `ha-card`'s corner radius.
  - `inset: number` — normally half the stroke width.
- **Returns:** `{ top: string; bottom: string }` — the two `d`
  attributes, ready for a `<path>`.

#### `neonRingSplitTemplate(uid, width, height, radius)`

- **Description:** full `<svg>` markup with both halves of the ring
  (uses `neonRingSplitPaths` internally), ready to insert as the first
  child inside `ha-card`.
- **Parameters:**
  - `uid: string` — stable, per-instance-unique identifier, so the
    `<linearGradient>`'s `id` doesn't collide when several Button
    cards share the same dashboard.
  - `width: number`, `height: number`, `radius: number` — same as
    `neonRingSplitPaths`.
- **Returns:** `TemplateResult` (Lit).
- **Example:**
  ```ts
  neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)
  ```

**Usage:** the host card adds `NEON_RING_SPLIT_STYLES` to its `static
styles`, puts the `neon-ring-host` class on the container, and
`neon-halo-active` when the state is active (shared class with
`NEON_HALO_STYLES`).

---

### Ring size (`ring-size.ts`)

#### `RingSizeController`

- **Description:** Lit reactive controller that keeps the real size of `ha-card` (width, height and border radius) up to date, which `neonRingSplitTemplate` needs because a `<path>`'s `d` attribute does not accept percentages. It replaces the continuous `requestAnimationFrame` loop Button and Thermostat used (60 callbacks per second per card, even at rest). It only measures when something may have changed:
  1. `ResizeObserver` on the **current** `ha-card`: if Lit replaces it (e.g. going from "entity unavailable" to the normal view), the new one is observed again, because an observer bound to a discarded node never notifies again.
  2. A measurement after each render, coalesced into a single frame, which picks up what the observer cannot see (the theme's border radius).
  3. A short burst of measurements on connect (30 frames, ~0.5 s) for the layout race when the HA editor creates or moves the card.

  On disconnect everything is cancelled, and on reconnect a new observer is created. At rest no callback is left scheduled.
- **Constructor:** `new RingSizeController(host, selector = 'ha-card')`, with `host` a `ReactiveElement` (it registers itself with `addController`).
- **Property:** `size: RingSize` — `{ width, height, radius }`, the last valid measurement. Readings under 4 px (hidden card or no layout) are discarded.
- **Effect:** when the measurement changes, it calls `host.requestUpdate()`; the card only has to read `size` in `render()`.
- **Requirement:** `ResizeObserver` only reports elements with a box (`display` other than `inline`). Home Assistant's `ha-card` has one; if a card uses another element, its CSS must give it `display: block` or `flex`.
- **Example:**
  ```ts
  private readonly _ring = new RingSizeController(this);

  render() {
    const { width, height, radius } = this._ring.size;
    return html`<ha-card>${neonRingSplitTemplate(this._ringUid, width, height, radius)}…</ha-card>`;
  }
  ```

---

### Editor: shared shell (`editor-form.styles.ts`)

#### `NEON_EDITOR_FORM_STYLES`

- **Description:** `css` sheet (Lit) with the visual "shell" common to
  any card editor with a section-based form —
  `.editor-container`, `.editor-section`, `.section-header`,
  `.action-item`/`.action-title`, `.custom-colors-grid`,
  `.color-picker-wrapper`, `input[type=color]`, `.native-select-label`,
  `.native-select`, `.native-input`. Button and Entity used to have
  these 11 rules duplicated byte for byte, each in its own styles file
  (agreement nº4).
- **Usage:** a card's editor composes it in `static styles` alongside
  whatever is actually specific to it:
  ```ts
  static styles = [NEON_EDITOR_FORM_STYLES, MY_CARD_EDITOR_STYLES];
  ```
  What does NOT go here: classes specific to a single card (in Button,
  `.sensor-card`/`.sensor-row`/`.field`; in Entity,
  `.two-col-grid`/`.field-col`/`ha-formfield`) — those stay in each
  editor's own styles file.

---

### Shared translations (`translations/`)

Text content that is **the same widget with the same fixed text**
across more than one card — not just any text coincidence (see the full
rule in "How to build a card", section 4). Today: palette preset names
and the "custom" option (consumed via
`getPaletteName`/`getPaletteCustomLabel`, above), the 3 gradient-stop
labels in the palette selector, and the tap/hold/double_tap actions
section.

Used the same as any other `localize` dictionary (see `src/core`):

```ts
localize(hass, SHARED_TRANSLATIONS, 'action_tap'); // '1 Toque (Tap)'
```

#### Constants and types

| Name | Description |
|---|---|
| `SHARED_TRANSLATIONS` | `Record<Locale, SharedTranslations>` — today just `{ es }`. |
| `SharedTranslations` | Interface with 13 keys: `palette_emerald`, `palette_cyberpunk`, `palette_electric`, `palette_sunset`, `palette_toxic`, `palette_custom`, `color_start`, `color_middle`, `color_end`, `section_actions`, `action_tap`, `action_hold`, `action_double_tap`. |

---

## Neón Card Entity — YAML configuration

Every key of `NeonCardEntityConfig` (`src/cards/entity/types.ts`). See
full examples in [`examples/`](../../examples/README.md).

| Key | Type | Default | Description |
|---|---|---|---|
| `entity` | `string` | — | Entity to control (single-entity mode). Required if `entities` is not used. |
| `entities` | `{ entity: string; name?: string }[]` | — | List of entities (multi-entity mode). Required if `entity` is not used. |
| `name` | `string` | entity's name | Custom name (single-entity mode only). |
| `columns` | `number` | number of entities | Columns of the internal grid. |
| `neon_palette` | `'emerald' \| 'cyberpunk' \| 'electric' \| 'sunset' \| 'toxic' \| 'custom'` | `'emerald'` | The neon ring's palette. `'custom'` enables `neon_color1/2/3`. |
| `neon_color1` / `neon_color2` / `neon_color3` | `string` (hex) | palette-dependent | Gradient colors when `neon_palette: custom`. |
| `show_status_dot` | `boolean` | `true` | Shows/hides the status dot. |
| `primary_info` | `'name' \| 'state' \| 'last-changed' \| 'last-updated' \| 'none'` | `'name'` | What to show as the primary text. |
| `secondary_info` | same as `primary_info` | `'none'` | What to show as the secondary text (second line). |
| `card_orientation` | `'left' \| 'right'` | `'left'` | Position of the switch pill: left (info on the right) or right (info on the left). |
| `tap_action` / `hold_action` / `double_tap_action` | `ActionConfig` | `more-info` / `none` / `none` | Standard Home Assistant actions (`{ action: 'more-info' \| 'toggle' \| 'navigate' \| 'url' \| 'call-service' \| 'assist' \| 'none', ... }`). |

### Full example

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

---

## Neón Button Card — YAML configuration

Every key of `NeonButtonCardConfig` (`src/cards/button/types.ts`). See
full examples in [`examples/`](../../examples/README.md).

| Key | Type | Default | Description |
|---|---|---|---|
| `entity` | `string` | — | Main entity, optional. Drives the active ring/icon when set; without it, the card still works (e.g. for `tap_action: navigate`) but is never marked active by state. |
| `icon` | `string` | entity's icon, or `mdi:gesture-tap-button` | Button icon. |
| `name` | `string` | — (empty) | Card title. |
| `subtitle` | `string` | — (empty) | Free text under the name, when `subtitle_type` is `'custom'` or unset. |
| `subtitle_type` | `'custom' \| 'name' \| 'state' \| 'last-changed' \| 'last-updated' \| 'none'` | `'custom'` | Any value other than `'custom'` computes the subtitle from `entity` (reuses `computeInfoDisplay` from `src/core`) — requires `entity`. |
| `top_sensor` | `SensorItemConfig` | — | A single, ungrouped sensor above the divider. |
| `sensors` | `SensorItemConfig[]` (max 3) | `[]` | The grouped row below the divider, with a vertical separator between each one. |
| `neon_palette` | `'emerald' \| 'cyberpunk' \| 'electric' \| 'sunset' \| 'toxic' \| 'custom'` | `'emerald'` | The neon ring's palette. `'custom'` enables `neon_color1/2/3`. |
| `neon_color1` / `neon_color2` / `neon_color3` | `string` (hex) | palette-dependent | Gradient colors when `neon_palette: custom`. |
| `tap_action` / `hold_action` / `double_tap_action` | `ActionConfig` | `toggle`/`more-info` (if `entity` set) / `more-info` / `none` | Standard Home Assistant actions. |

`SensorItemConfig` (`top_sensor` or each item in `sensors`):

| Key | Type | Default | Description |
|---|---|---|---|
| `entity` | `string` | — (required) | Only `sensor` or `binary_sensor` domains. |
| `icon` | `string` | computed from `device_class` | Sensor's own icon. |
| `decimals` | `number` | `1` (`DEFAULT_SENSOR_DECIMALS`) | Decimals when rounding a numeric state. |

### `getGridOptions()` — automatic sizing

The card's width (`columns`) and height (`rows: 'auto'`) in HA's grid
are computed automatically from its content — no need to set
`grid_options` unless you want to force a different size:

| Content | `columns` |
|---|---|
| No grouped sensors, or just 1 (with or without `top_sensor`/`subtitle`) | `3` |
| 2 grouped sensors | `5` |
| 3 grouped sensors | `6` |

### Full example

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

---

## Neón Thermostat Card — YAML configuration

All keys of `NeonThermostatCardConfig`
(`src/cards/thermostat/types.ts`). See full examples in
[`examples/`](../../examples/README.md).

| Key | Type | Default | Description |
|---|---|---|---|
| `entity` | `string` | — (required) | Main `climate` entity. |
| `entity_2` | `string` | — | Optional second `climate` entity — two separate units (e.g. heating + AC) instead of one that supports every mode. Without it, the card behaves exactly like it does with a single entity. |
| `mode_owner` | `Partial<Record<HvacMode, 1 \| 2>>` | — | Only relevant with `entity_2`, and only for modes both entities support at once — `1` = `entity`, `2` = `entity_2`. With no entry for a mode, `entity` wins by default. |
| `name` | `string` | entity's name | Card title. In the compact view, when unset, no name is shown at all (to save space). |
| `size` | `'large' \| 'normal' \| 'compact'` | `'normal'` | Card size — see `getGridOptions()` below. |
| `color` | `string \| { mode: 'state' } \| { mode: 'custom', heat?, cool?, heat_cool?, auto?, dry?, fan_only?, off? }` | `{ mode: 'state' }` | Dial/ring color per HVAC mode. `string`: a single color for every mode. `{ mode: 'state' }`: automatic semantic colors per mode (equivalent to leaving `color` unset). `{ mode: 'custom', ... }`: a color per mode; unset ones fall back to that mode's semantic default. |
| `neon_palette` | `'emerald' \| 'cyberpunk' \| 'electric' \| 'sunset' \| 'toxic' \| 'custom'` | `'emerald'` | Palette of the card's PERIMETER ring (the border, not the dial — that follows `color` above). |
| `neon_color1` / `neon_color2` / `neon_color3` | `string` (hex) | per palette | Perimeter ring gradient colors when `neon_palette: custom`. |
| `step` | `number` | entity's `target_temp_step`, or `0.5` | Increment for the −/+ controls and dragging. |
| `footer` | `FooterSensorConfig[]` (max 3) | `[]` | Only `sensor`/`binary_sensor` domains. No footer in the compact view (`size: compact`), regardless of what's configured here. |

`FooterSensorConfig` (each item in `footer`):

| Key | Type | Default | Description |
|---|---|---|---|
| `entity` | `string` | — (required) | Only `sensor` or `binary_sensor` domains. |
| `icon` | `string` | computed from `device_class` | Sensor's own icon. |

There's no card-level `icon` field: the icon isn't configurable, it's
always derived from the current HVAC mode (`HVAC_MODE_ICONS`).

### `getGridOptions()` — size driven by `size`

Unlike Button, the size isn't computed from content — it's chosen
directly by the `size` key:

| `size` | `columns` | `rows` |
|---|---|---|
| `'compact'` | `4` | `'auto'` |
| `'normal'` (default) | `6` | `'auto'` |
| `'large'` | `12` | `'auto'` |

### Full example

```yaml
type: custom:neon-thermostat-card
name: Living Room
entity: climate.living_room_heat
entity_2: climate.living_room_cool
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
  - entity: sensor.living_room_temperature
  - entity: sensor.living_room_humidity
  - entity: binary_sensor.living_room_motion
    icon: mdi:motion-sensor
```
