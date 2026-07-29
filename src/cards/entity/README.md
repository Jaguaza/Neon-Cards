# Neón Card Entity

`custom:neon-card-entity` — tarjeta de tipo interruptor con un aro neón
degradado de 3 colores, editor visual incluido, gestos tap/hold/double-tap
y varias paletas predefinidas (o colores personalizados).

Custom Element nativo (sin LitElement, sin decoradores — acuerdo nº10).

## Archivos

- `constants.ts` — versión, autor y paletas de degradado (`NEON_PRESETS`).
- `types.ts` — tipos de configuración y de los elementos de Home Assistant
  que usa el editor (`ha-entity-picker`, `hui-action-editor`, etc.).
- `neon-card-entity.ts` — la tarjeta.
- `neon-card-entity-editor.ts` — el editor visual.
- `index.ts` — registra ambos custom elements y el banner de consola.

## Build

```bash
npm run build:cards
```

Genera `dist-cards/neon-card-entity.js` — el único archivo que hay que
servir como recurso Lovelace en Home Assistant.

Ver el ejemplo de uso en [`examples/`](../../../examples/README.md).
