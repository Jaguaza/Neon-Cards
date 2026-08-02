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
- [`src/ha` — Home Assistant types](#srcha--home-assistant-types)
- [Neón Card Entity — YAML configuration](#neón-card-entity--yaml-configuration)

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

- **Description:** computes what to display as an entity's primary or secondary info — the same concept Home Assistant/Mushroom use.
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
| `INFO_LABELS` | `Record<InfoOption, string>` — labels (in Spanish) shown in the editor. |

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
  callService(domain: string, service: string, serviceData?: Record<string, unknown>): Promise<void>;
}
```

- **`callService(domain, service, serviceData)`** — calls a Home Assistant service.
  - `domain: string` — e.g. `'light'`, `'switch'`, `'homeassistant'`.
  - `service: string` — e.g. `'toggle'`, `'turn_on'`.
  - `serviceData?: Record<string, unknown>` — e.g. `{ entity_id: 'light.living_room' }`.
  - **Returns:** `Promise<void>`.

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
