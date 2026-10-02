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
| `types.ts` | The card's `Config` interface (extends the minimum from `ActionConfig` in `src/ha/types`; ends in `[key: string]: unknown` — needed so the editor's `_configChanged` compiles with a dynamic key, not filler "just in case". Document it the same way `src/cards/button/types.ts` does). |
| `constants.ts` | Card-specific defaults; imports `NEON_CARDS_VERSION` from `../../version` for `CARD_VERSION`. |
| `index.ts` | Registration: `customElements.define`, `window.customCards.push`, console banner. |
| `README.md` | The card's bilingual spec and YAML config (same pattern as `src/cards/button/README.md`). |
| `translations/` | All of this card's own visible text, in Spanish for now — `types.ts`+`es.ts`+`index.ts` — see section 4, "Translations". |

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

## 4. Translations

Right now the config UI (both visual editors) and a couple of
runtime-visible strings (error messages, "unavailable") only exist in
Spanish — but the infrastructure is already in place so more languages
can be added later without touching any of this again.

**Generic engine, no text inside it — `src/core/localize.ts`:**
`resolveLocale(hass)` reads `hass.locale.language` and falls back to
`DEFAULT_LOCALE` when it isn't supported; `localize(hass, dict, key)`
looks up `key` in the resolved language's dictionary.

**One dictionary per module, not one giant shared one** — each card
owns its own text (agreement nº3):

```
src/cards/<name>/translations/
  types.ts   — <Name>Translations interface with ALL keys
  es.ts      — export const es: <Name>Translations = {...}
  index.ts   — export const <NAME>_TRANSLATIONS: Record<Locale, ...> = { es }
```

In the component/editor:

```ts
private _t(key: keyof MyCardTranslations): string {
  return localize(this.hass, MY_CARD_TRANSLATIONS, key);
}
```

**Before adding a new string, check whether it already belongs to
`src/shared`** — `src/shared/translations` holds text that is *the same
widget with the same fixed text* across more than one card (today:
palette preset names, the 3 gradient-stop labels in that same picker,
the tap/hold/double_tap actions section). If your card also has a
palette picker or an actions section, use those shared keys
(`localize(this.hass, SHARED_TRANSLATIONS, 'action_tap')`, for example)
instead of duplicating the text in your own dictionary — that's exactly
the bug that got fixed the first time this was built (Button and Entity
each had their own literal copy, already drifted apart). An
*incidental* text match (two cards both calling their first section
"Main Configuration" without it being the same concept) doesn't
count — that stays in each card's own dictionary.

**When the first new language arrives:** create `translations/en.ts` in
every module that needs it (`core`, `shared`, and each card)
implementing its interface — TypeScript throws a compile error if a key
is missing, it won't let a half-translated Spanish string slip through
— add it to each `index.ts`'s `Record<Locale, ...>`, and add `'en'` to
`SUPPORTED_LOCALES` in `src/core/localize.ts`.

## 5. Documentation (agreements nº13, nº14, nº16)

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

## 6. Development diagnostics (agreement nº22)

For warnings that only help while editing a card (malformed config, an
entity of the wrong domain, something being silently truncated or
skipped) use the global constant `__DEV__`:

```ts
if (__DEV__) {
  console.warn('[my-card] explain here what is wrong and why');
}
```

`__DEV__` gets replaced by `@rollup/plugin-replace` at build time (see
`rollup.config.mjs`) — a normal `npm run build:cards` sets it to
`false` and terser strips the whole block as dead code, so it never
reaches the published bundle; `npm run build:cards:dev` sets it to
`true` and the warning shows up. Don't use bare
`console.warn`/`console.log` without wrapping it in `if (__DEV__)` —
that would ship to production as-is. Scripts that import the `.ts`
directly without going through rollup (like
`scripts/perf-check.mjs`) need their own
`globalThis.__DEV__ = false` at the top.

## 7. Before merging into `main` (agreements nº18, nº20, nº21)

Final checklist, all of it must pass before integrating:

- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`
      with no errors.
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

## 8. Framework freeze (agreement nº25)

This process (steps 1-7) is the one followed to build the Button Card on
top of the framework the Entity Card left behind. The framework is now
frozen — see the [full declaration](./framework-freeze.md) for the exact
baseline and what to do if a future bug forces breaking something
already frozen. From here on these steps stop changing — the only
evolution possible from now on is within the conventions already set,
without redesigning `core`/`ha`/`shared`.
