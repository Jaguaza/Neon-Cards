# How to build a card

Guide for adding a new card to Neón Cards, using the two existing cards
([Entity](../../src/cards/entity) and [Button](../../src/cards/button))
as a side-by-side reference. Before starting, read the
[Repository agreements](./agreements.md) — this guide doesn't repeat the
rules, it just explains how to apply them step by step.

See also the [Spanish version](../es/como-crear-una-tarjeta.md).

## 1. File structure

Each card is an independent folder under `src/cards/<name>/`
(agreements nº1 and nº3). These are the files it needs, using
`src/cards/button/` as the template:

| File | Responsibility |
|---|---|
| `<name>.ts` | Main Lit component — extends `BaseNeonCard`, `render()`, `getCardSize()`, `getGridOptions()`. |
| `<name>-editor.ts` | Visual editor (referenced by `static getConfigElement()`). |
| `<name>.styles.ts` | The card's own `css`, kept separate from the component for size (agreement nº7). |
| `types.ts` | The card's `Config` interface (extends the minimum from `ActionConfig` in `src/ha/types`). |
| `constants.ts` | Card-specific defaults; imports `NEON_CARDS_VERSION` from `../../version` for `CARD_VERSION`. |
| `index.ts` | Registration: `customElements.define`, `window.customCards.push`, console banner. |
| `README.md` | The card's bilingual spec and YAML config (same pattern as `src/cards/button/README.md`). |

One class, one responsibility (agreement nº8): if `<name>.ts` starts
mixing, say, sensor computation with rendering, that computation gets
extracted into a function or into `src/ha`/`src/shared` — it doesn't
stay inline.

## 2. What belongs in `core`/`ha`/`shared`/`utils` vs. local

A card **never** imports from another card (agreement nº3) — only from
`src/core`, `src/ha`, `src/shared` and `src/utils`. Before writing
something new, ask:

- Is it gesture logic, `hass-action` dispatching, or primary/secondary
  info computation? → already in `src/core`, reuse it.
- Does it read `hass.states` for a given entity type? → belongs in
  `src/ha` (see `src/ha/sensors.ts`) — a card never reads `hass.states`
  by hand.
- Is it visual and more than one card would use it (palette, halos,
  animations)? → belongs in `src/shared` (see `src/shared/glow.ts`,
  `src/shared/neon-palette.ts`).
- Is it purely specific to this card (its own layout, its own config)? →
  stays local to `src/cards/<name>/`.

If halfway through building a new card you notice you've written
something that already exists, un-extracted, in another card, that's
the moment to extract it into `shared`/`ha`/`core` (agreement nº4) —
never copy it.

## 3. Registration

1. Add the three registration calls in `index.ts` (see
   `src/cards/button/index.ts` as a template): `customElements.define`
   for the card and its editor, and the `push` to `window.customCards`
   with `type`, `name`, `description`, `preview: true`.
2. Add one import line in `src/neon-cards.ts` — no automatic folder
   discovery (agreement nº10).

## 4. Documentation (agreements nº13, nº14, nº16)

All of it in Spanish **and** English, versioned in the repo:

- `src/cards/<name>/README.md` — the card's spec, same format as
  Button's (YAML config, every option explained, block examples).
- `docs/es/api.md` / `docs/en/api.md` — add the new card's YAML
  configuration section (every `Config` key, with description, type,
  default value). If the card exposes any new public function or
  constant in `core`/`ha`/`shared`, document that there too with
  description, parameters, return value and example (agreement nº16) —
  not just the YAML config.
- `examples/README.md` — minimal YAML, advanced YAML, screenshot, GIF
  and explanation for the new card (agreement nº17).

## 5. Before merging into `main` (agreements nº18, nº20, nº21)

Final checklist, all of it must pass before integrating:

- [ ] `npm run typecheck`, `npm run lint`, `npm run build` with no errors.
- [ ] `npm run perf` — no noticeable performance regression or memory
      leak indication.
- [ ] Working visual editor (not YAML-only).
- [ ] The card's `README.md` and both versions of `docs/*/api.md`
      updated.
- [ ] `examples/README.md` with **real** Home Assistant screenshots and
      GIF, not "pending" placeholders.
- [ ] No `TODO`/`FIXME`/`HACK` in the code (agreement nº19) — any real
      pending item gets registered as an Issue instead.
- [ ] Architecture, API, performance and documentation review
      (agreement nº20) before merging significant changes.

## 6. Framework freeze (agreement nº25)

This process (steps 1-5) is the one followed to build the Button Card on
top of the framework the Entity Card left behind. Once the framework is
frozen (agreement nº25), these steps stop changing — the only evolution
possible from then on is within the conventions already set, without
redesigning `core`/`ha`/`shared`.
