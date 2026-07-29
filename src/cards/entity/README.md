# Neón Card Entity

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

Genera `dist-cards/neon-card-entity.js` — el único archivo que hay que
servir como recurso Lovelace en Home Assistant.

Ver el ejemplo de uso en [`examples/`](../../../examples/README.md).
