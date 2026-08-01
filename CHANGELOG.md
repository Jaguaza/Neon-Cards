# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- `scripts/perf-check.mjs` (`npm run perf`): benchmark automatizado del
  render real de cada tarjeta en jsdom, detecta renders lentos y fugas de
  memoria (acuerdo nº18).

### Fixed

- Neón Card Entity: `getCardSize()`/`getGridOptions()` daban un tamaño
  fijo demasiado pequeño (1 unidad ≈ 50-56px), así que la tarjeta
  siguiente en el dashboard se montaba encima. Tras hacer los cálculos
  con la fórmula real de Home Assistant (`filas × 56px + (filas-1) ×
  8px` en la vista de secciones), la solución correcta no era sumar
  filas de grid extra (demasiado tosco, deja huecos enormes), sino
  reducir el padding vertical de `ha-card` para que 1 fila de contenido
  quepa justo dentro de 1 unidad de grid — sin ajustes especiales para
  la información secundaria, ya cabe con margen de sobra.
- Neón Card Entity: el grid interno usaba `minmax(0, auto)` y
  `justify-items: start`, lo que permitía que el texto se saliera de la
  tarjeta al estrechar su ancho desde "Diseño". Ahora usa
  `minmax(0, 1fr)` + `justify-items: stretch`.
- Esqueleto inicial del proyecto: `src/core`, `src/ha`, `src/shared`,
  `src/utils`, `src/cards`, `docs/` (es/en), `examples/` — paquete único,
  sin workspaces.
- Scripts de release (`release:patch|minor|major|beta`, `release -- X.Y.Z`).
- Workflow de CI (lint, typecheck, test, build) y workflow de release
  (adjunta los `.js` de `dist-cards/` al GitHub Release).
- Rollup empaqueta **todas** las tarjetas juntas en un único
  `dist-cards/neon-cards.js` (igual que Mushroom con `mushroom.js`) — un
  solo recurso Lovelace instala toda la colección.
- `BaseNeonCard` (`src/core`): framework base en Lit (sin decoradores) con
  gestión de gestos tap/hold/double-tap y despacho de `hass-action`
  reutilizables entre tarjetas.
- Primera tarjeta: **Neón Card Entity** (`custom:neon-card-entity`) —
  interruptor con aro neón degradado de 3 colores, editor visual, gestos
  tap/hold/double-tap y paletas predefinidas o personalizadas. Construida
  sobre `BaseNeonCard`.
