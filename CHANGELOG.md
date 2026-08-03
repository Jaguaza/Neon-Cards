# Changelog

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#changelog-english)

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Changed

- Licencia: de PolyForm Noncommercial 1.0.0 a **Apache License 2.0**.
  PolyForm no está en la lista de licencias que GitHub/HACS reconocen
  automáticamente (`licensee`/`choosealicense.com`), así que la
  comprobación de licencia de HACS nunca pasaba, ni siquiera para
  instalación como repositorio personalizado.

### Fixed

- Quitadas todas las menciones a Mushroom en código y documentación
  (comentarios, CHANGELOG, `hacs.json`); la clase CSS `.mushroom-section`
  del editor pasa a llamarse `.editor-section`. El proyecto queda
  completamente independiente en su propio código.
- El campo "Nombre personalizado" del editor usaba `ha-textfield` (un
  componente interno de HA) y no se veía; ahora es un `<input>` nativo,
  como el resto de campos del editor.
- `getStubConfig()` devolvía `entity: ''`, lo que hacía que `setConfig()`
  lanzara un error al generar la vista previa en el selector de tarjetas
  de HA — por eso no se veía ningún ejemplo ahí. Ahora recibe `hass` y
  busca una entidad `light`/`switch` real para la vista previa (igual
  que hace la card `entity` oficial de Home Assistant).

## [0.1.0] - 2026-08-02

### Added

- Esqueleto inicial del proyecto: `src/core`, `src/ha`, `src/shared`,
  `src/utils`, `src/cards`, `docs/` (es/en), `examples/` — paquete único,
  sin workspaces.
- Scripts de release (`release:patch|minor|major|beta`, `release -- X.Y.Z`).
- Workflow de CI (lint, typecheck, test, build) y workflow de release
  (adjunta los `.js` de `dist-cards/` al GitHub Release).
- Rollup empaqueta **todas** las tarjetas juntas en un único
  `dist-cards/neon-cards.js` — un solo recurso Lovelace instala toda la
  colección.
- `BaseNeonCard` (`src/core`): framework base en Lit (sin decoradores) con
  gestión de gestos tap/hold/double-tap y despacho de `hass-action`
  reutilizables entre tarjetas.
- Primera tarjeta: **Neón Card Entity** (`custom:neon-card-entity`) —
  interruptor con aro neón degradado de 3 colores, editor visual, gestos
  tap/hold/double-tap y paletas predefinidas o personalizadas. Construida
  sobre `BaseNeonCard`.
- `hacs.json`: fase 3, prepara el repositorio para instalación vía HACS
  (`filename: neon-cards.js`, `homeassistant: 2025.10.0`).
- `scripts/perf-check.mjs` (`npm run perf`): benchmark automatizado del
  render real de cada tarjeta en jsdom, detecta renders lentos y fugas de
  memoria (acuerdo nº18).
- Workflow oficial de validación de HACS (`hacs/action`, disparo manual
  hasta el primer release estable).
- `docs/es/api.md` / `docs/en/api.md`: referencia de API pública
  (acuerdo nº16).

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

---

<a id="changelog-english"></a>

# Changelog (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#changelog)

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- License: from PolyForm Noncommercial 1.0.0 to **Apache License 2.0**.
  PolyForm isn't on the list of licenses GitHub/HACS automatically
  recognize (`licensee`/`choosealicense.com`), so HACS's license check
  never passed, not even for custom-repository installation.

### Fixed

- Removed every mention of Mushroom from code and docs (comments,
  CHANGELOG, `hacs.json`); the editor's `.mushroom-section` CSS class is
  now `.editor-section`. The project is now fully independent in its
  own codebase.
- The editor's "Custom name" field used `ha-textfield` (an internal HA
  component) and wasn't showing up; it's now a native `<input>`, like
  every other field in the editor.
- `getStubConfig()` returned `entity: ''`, which made `setConfig()`
  throw while generating the preview in HA's card picker — that's why
  no example ever showed up there. It now receives `hass` and looks for
  a real `light`/`switch` entity for the preview (same approach as
  Home Assistant's own `entity` card).

## [0.1.0] - 2026-08-02

### Added

- Initial project skeleton: `src/core`, `src/ha`, `src/shared`,
  `src/utils`, `src/cards`, `docs/` (es/en), `examples/` — single
  package, no workspaces.
- Release scripts (`release:patch|minor|major|beta`, `release -- X.Y.Z`).
- CI workflow (lint, typecheck, test, build) and release workflow
  (attaches the `dist-cards/` `.js` files to the GitHub Release).
- Rollup bundles **all** cards together into a single
  `dist-cards/neon-cards.js` — one single Lovelace resource installs the
  whole collection.
- `BaseNeonCard` (`src/core`): base framework in Lit (no decorators)
  with tap/hold/double-tap gesture handling and `hass-action`
  dispatching, reusable across cards.
- First card: **Neón Card Entity** (`custom:neon-card-entity`) — a
  switch with a 3-color neon gradient ring, visual editor,
  tap/hold/double-tap gestures, and preset or custom color palettes.
  Built on top of `BaseNeonCard`.
- `hacs.json`: phase 3, prepares the repository for installation via
  HACS (`filename: neon-cards.js`, `homeassistant: 2025.10.0`).
- `scripts/perf-check.mjs` (`npm run perf`): automated benchmark of
  each card's real render in jsdom, catches slow renders and memory
  leaks (agreement nº18).
- Official HACS validation workflow (`hacs/action`, manual trigger
  until the first stable release).
- `docs/es/api.md` / `docs/en/api.md`: public API reference
  (agreement nº16).

### Fixed

- Neón Card Entity: `getCardSize()`/`getGridOptions()` returned a fixed
  size that was too small (1 unit ≈ 50-56px), so the next card in the
  dashboard would overlap it. After working out the real Home Assistant
  formula (`rows × 56px + (rows-1) × 8px` in sections view), the
  correct fix wasn't to add extra grid rows (too coarse, leaves huge
  gaps) but to reduce `ha-card`'s vertical padding so that 1 row of
  content fits exactly within 1 grid unit — no special-casing needed
  for secondary info, it already fits comfortably.
- Neón Card Entity: the internal grid used `minmax(0, auto)` and
  `justify-items: start`, which let text overflow the card when
  narrowing its width from "Layout". Now uses `minmax(0, 1fr)` +
  `justify-items: stretch`.
