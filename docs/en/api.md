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
  - [Translations (`localize.ts`)](#translations-localizets)
- [`src/ha` — Home Assistant types](#srcha--home-assistant-types)
  - [Sensors (`sensors.ts`)](#sensors-sensorsts)
- [`src/shared` — Shared neon palette and effects](#srcshared--shared-neon-palette-and-effects)
  - [Palette (`neon-palette.ts`)](#palette-neon-palettets)
  - [Icon halo (`glow.ts`)](#icon-halo-glowts)
  - [Split ring (`glow.ts`)](#split-ring-glowts)
  - [Editor: shared shell (`editor-form.styles.ts`)](#editor-shared-shell-editor-formstylests)
  - [Shared translations (`translations/`)](#shared-translations-translations)
- [Neón Card Entity — YAML configuration](#neón-card-entity--yaml-configuration)
- [Neón Button Card — YAML configuration](#neón-button-card--yaml-configuration)

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
every `src/cards/<name>`). Today only `es` dictionaries are populated
across the repo; the infrastructure is already in place for when `en`
or another locale gets added (see "How to build a card", section 4,
"Translations").

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
| `SUPPORTED_LOCALES` | `['es']` today — extend this here when a new locale is added. |
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
  neonRingSplitTemplate(this._ringUid, this._ringSize.width, this._ringSize.height, this._ringSize.radius)
  ```

**Usage:** the host card adds `NEON_RING_SPLIT_STYLES` to its `static
styles`, puts the `neon-ring-host` class on the container, and
`neon-halo-active` when the state is active (shared class with
`NEON_HALO_STYLES`).

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
