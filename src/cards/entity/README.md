# Neón Card Entity

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#neón-card-entity-english)

`custom:neon-card-entity` — tarjeta de tipo interruptor con un aro neón
degradado de 3 colores, editor visual incluido, gestos tap/hold/double-tap
y varias paletas predefinidas (o colores personalizados).

Construida con [Lit](https://lit.dev) sobre `BaseNeonCard`
(`../../core`), sin decoradores (acuerdo nº10).

## Archivos

- `constants.ts` — versión (importada de `src/version.ts`), autor y
  paletas de degradado (`NEON_PRESETS`).
- `types.ts` — tipos de configuración de la tarjeta.
- `neon-card-entity.ts` — la tarjeta (extiende `BaseNeonCard`).
- `neon-card-entity-editor.ts` — el editor visual (Lit, bindings
  declarativos sobre `ha-entity-picker` / `hui-action-editor`).
- `index.ts` — registra ambos custom elements y el banner de consola.

## Build

```bash
npm run build:cards
```

Empaqueta **todas** las tarjetas de Neón Cards (no solo esta) en un único
`dist-cards/neon-cards.js` — el único archivo que hay que servir como
recurso Lovelace en Home Assistant. Ver el punto de entrada compartido en
[`src/neon-cards.ts`](../../neon-cards.ts).

Ver el ejemplo de uso en [`examples/`](../../../examples/README.md) y la
[referencia de API](../../../docs/es/api.md).

---

<a id="neón-card-entity-english"></a>

# Neón Card Entity (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#neón-card-entity)

`custom:neon-card-entity` — a switch-type card with a 3-color neon
gradient ring, a built-in visual editor, tap/hold/double-tap gestures,
and several preset palettes (or custom colors).

Built with [Lit](https://lit.dev) on top of `BaseNeonCard`
(`../../core`), without decorators (agreement nº10).

## Files

- `constants.ts` — version (imported from `src/version.ts`), author, and
  gradient palettes (`NEON_PRESETS`).
- `types.ts` — the card's configuration types.
- `neon-card-entity.ts` — the card (extends `BaseNeonCard`).
- `neon-card-entity-editor.ts` — the visual editor (Lit, declarative
  bindings over `ha-entity-picker` / `hui-action-editor`).
- `index.ts` — registers both custom elements and the console banner.

## Build

```bash
npm run build:cards
```

Bundles **every** Neón Cards card (not just this one) into a single
`dist-cards/neon-cards.js` — the only file that needs to be served as a
Lovelace resource in Home Assistant. See the shared entry point at
[`src/neon-cards.ts`](../../neon-cards.ts).

See the usage example in [`examples/`](../../../examples/README.md) and
the [API reference](../../../docs/en/api.md).
