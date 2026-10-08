# Changelog

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#changelog-english)

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- **Neón Thermostat Card** (`custom:neon-thermostat-card`): tarjeta para
  una o dos entidades `climate`, con vista grande (dial semicircular),
  normal (aro alrededor de la temperatura) y compacta (línea), consigna
  arrastrable o con píldora −/+, selector de modo HVAC, color por modo,
  pie de sensores (hasta 3) y editor visual. Con `entity_2` reúne dos
  equipos separados y `mode_owner` resuelve los modos compartidos. En
  la vista grande, el selector de modo se acompaña de uno de **preset**
  y otro de **ventilador** cuando la entidad los expone.
- **Inglés** en las 5 zonas de texto del repositorio (núcleo, compartido,
  Entity, Button y Thermostat): la interfaz de configuración se muestra
  en el idioma de Home Assistant, con el español como respaldo.
- `src/ha/climate.ts` (`getClimateState`, `clampToStep`,
  `isClimateRunning`, `formatClimateOption`) y `openMoreInfo` en `src/core`, documentados en la
  referencia de API.
- Perfil `thermostat` en `npm run perf` y tests nuevos para `climate`,
  la geometría del dial y el estado combinado.
- README de la tarjeta, capturas y entrada en `examples/` (YAML mínimo
  y avanzado, explicación), en español e inglés.

### Changed

- En la interfaz de configuración de Entity y Thermostat, el término
  «aro» pasa a llamarse «halo», como en el resto del proyecto.
- El CI (`ci.yml`) se ejecuta en cualquier push a cualquier rama y en
  las PR hacia `main`, no solo en `main`: antes una rama de trabajo solo
  pasaba por la validación de HACS y nadie comprobaba ESLint,
  TypeScript, tests, build ni rendimiento hasta llegar a `main`.
- Button y Thermostat ya no ejecutan un `requestAnimationFrame` continuo
  (60 callbacks por segundo y tarjeta, incluso en reposo) para medir el
  aro. Lo sustituye `RingSizeController` (nuevo, en `src/shared`):
  `ResizeObserver` sobre el `ha-card` actual, una medida tras cada
  renderizado y una ráfaga corta al conectar. Con 10 tarjetas en reposo,
  de 600 callbacks por segundo y ~30 ms de CPU por segundo a 0 y 0,3 ms;
  con actualizaciones de Home Assistant, el coste queda acotado por su
  frecuencia. El aro sigue el tamaño en los mismos casos que antes
  (redimensionar, cambiar el contenido, mover la tarjeta, tarjeta
  oculta, cambio de radio del tema).
- El banner de versión de las tarjetas (Entity, Button y Thermostat) pasa
  a `logCardBanner` (nuevo, en `src/core`) y solo se escribe en modo
  desarrollo (acuerdo nº22): el bundle de producción ya no escribe nada
  en la consola del usuario, ni incluye los textos del banner. Antes cada
  tarjeta tenía su propio `console.info` sin proteger.
- Los editores de Entity y Thermostat dividen su `render()` en métodos
  por sección (acuerdo nº7); el DOM resultante es idéntico.
- Los archivos del termostato que superaban las 500 líneas se dividen
  por responsabilidad: estilos por zona, y la tarjeta (de 700 a menos
  de 500 líneas) delega la presentación en `dial-views.ts`, `header.ts`,
  `footer.ts`, `target-pill.ts` y `selector-pill.ts`, y el cálculo en
  `dial-geometry.ts` y `combined-climate.ts` (acuerdo nº7). El DOM, el
  arrastre y las llamadas a servicios resultan idénticos.

## [1.0.0] - 2026-10-02

Primera versión estable. Con la declaración del Framework Freeze
(acuerdo nº25, ver [`docs/es/framework-freeze.md`](docs/es/framework-freeze.md))
la arquitectura, la API pública y las convenciones quedan congeladas: a
partir de aquí el framework evoluciona sin rediseñarse.

### Added

- **Neón Button Card** (`custom:neon-button-card`): botón de acción con
  entidad principal opcional, icono protagonista y aro neón animado de
  trazado partido. Subtítulo de texto libre o calculado desde la entidad,
  sensor suelto (`top_sensor`) y hasta 3 sensores agrupados con icono y
  decimales configurables, y tamaño de grid automático según el contenido.
  Si la entidad configurada no existe o está `unavailable`/`unknown`, el
  icono principal pasa a una X neón. Editor visual con selector de iconos
  (`ha-icon-picker`).
- Infraestructura de traducciones para la UI de configuración
  (`src/core/localize` y traducciones por zona), por ahora solo en español.
- `src/shared`: paleta neón, halo y aro compartidos, y la carcasa común de
  los editores (`editor-form.styles.ts`).
- Modo desarrollo/producción (acuerdo nº22) con la constante `__DEV__` y
  el script `build:cards:dev`.
- Vitest con suites para la paleta, los sensores, el aro, la información
  calculada, la localización y la lógica pura de Button
  (`button-state.ts`).
- El workflow de CI ejecuta también `npm run perf` y la plantilla de PR
  incluye la checklist de revisión (acuerdo nº20).
- Documentación: acuerdos del repositorio, guía para crear una tarjeta,
  referencia de API, ejemplos de Button (YAML mínimo y avanzado, capturas
  y GIF) y secciones de cada tarjeta en el README.

### Changed

- Los editores de Button y Entity dividen su renderizado en métodos por
  sección, y los métodos de más de 50 líneas del editor de Button se
  parten en subplantillas (acuerdo nº7).
- La lógica pura de Button (columnas del grid, filas, entidad rota,
  estado activo e icono) vive en `button-state.ts`, con tests propios.
- `subtitle_type` (Button) y `primary_info`/`secondary_info` (Entity) se
  tipan con la unión real de `InfoOption` en vez de `string`.
- El tamaño de la tarjeta Button se calcula solo (`getGridOptions()` con
  filas automáticas y columnas según el número de sensores agrupados).

### Fixed

- `NeonPreset.name` restaurado: la infraestructura de traducciones había
  roto la superficie congelada sin pasar por el proceso de excepción.

## [0.1.1] - 2026-08-16

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

### Added

- **Neón Thermostat Card** (`custom:neon-thermostat-card`): card for one
  or two `climate` entities, with a large (semicircular dial), normal
  (ring around the temperature) and compact (line) view, a draggable
  target or a −/+ pill, an HVAC mode selector, a color per mode, a sensor
  footer (up to 3) and a visual editor. With `entity_2` it brings two
  separate devices together and `mode_owner` resolves shared modes. In
  the large view, the mode selector is joined by a **preset** and a
  **fan** selector when the entity exposes them.
- **English** in the repository's 5 text areas (core, shared, Entity,
  Button and Thermostat): the configuration UI is shown in Home
  Assistant's language, with Spanish as a fallback.
- `src/ha/climate.ts` (`getClimateState`, `clampToStep`,
  `isClimateRunning`, `formatClimateOption`) and `openMoreInfo` in `src/core`, documented in
  the API reference.
- A `thermostat` profile in `npm run perf` and new tests for `climate`,
  the dial geometry and the combined state.
- Card README, screenshots and an entry in `examples/` (minimal and
  advanced YAML, explanation), in Spanish and English.

### Changed

- In the Entity and Thermostat configuration UI, the term "ring" ("aro"
  in Spanish) is renamed "halo", as in the rest of the project.
- CI (`ci.yml`) runs on any push to any branch and on pull requests to
  `main`, not only on `main`: before, a working branch only went through
  the HACS validation and nobody checked ESLint, TypeScript, tests, build
  or performance until it reached `main`.
- Button and Thermostat no longer run a continuous
  `requestAnimationFrame` (60 callbacks per second per card, even at
  rest) to measure the ring. `RingSizeController` (new, in `src/shared`)
  replaces it: `ResizeObserver` on the current `ha-card`, a measurement
  after each render and a short burst on connect. With 10 cards at rest,
  from 600 callbacks per second and ~30 ms of CPU per second to 0 and
  0.3 ms; with Home Assistant updates, the cost is bounded by their
  frequency. The ring follows the size in the same cases as before
  (resizing, content changes, moving the card, hidden card, theme radius
  change).
- The cards' version banner (Entity, Button and Thermostat) moves to
  `logCardBanner` (new, in `src/core`) and is only written in development
  mode (agreement nº22): the production bundle no longer writes anything
  to the user's console, nor includes the banner texts. Before, each card
  had its own unguarded `console.info`.
- The Entity and Thermostat editors split their `render()` into
  per-section methods (agreement nº7); the resulting DOM is identical.
- The thermostat files that exceeded 500 lines are split by
  responsibility: styles per area, and the card (from 700 to under 500
  lines) delegates presentation to `dial-views.ts`, `header.ts`,
  `footer.ts`, `target-pill.ts` and `selector-pill.ts`, and computation
  to `dial-geometry.ts` and `combined-climate.ts` (agreement nº7). The
  DOM, dragging and service calls come out identical.

## [1.0.0] - 2026-10-02

First stable release. With the Framework Freeze declared (agreement nº25,
see [`docs/en/framework-freeze.md`](docs/en/framework-freeze.md)) the
architecture, the public API and the conventions are frozen: from here on
the framework evolves without being redesigned.

### Added

- **Neón Button Card** (`custom:neon-button-card`): action button with an
  optional main entity, a prominent icon and an animated neon ring drawn
  in two halves. Subtitle as free text or computed from the entity, a
  standalone sensor (`top_sensor`) and up to 3 grouped sensors with
  configurable icon and decimals, and an automatic grid size based on its
  content. If the configured entity does not exist or is
  `unavailable`/`unknown`, the main icon switches to a neon X. Visual
  editor with an icon picker (`ha-icon-picker`).
- Translation infrastructure for the configuration UI (`src/core/localize`
  and per-area translations), Spanish only for now.
- `src/shared`: shared neon palette, halo and ring, and the common editor
  shell (`editor-form.styles.ts`).
- Development/production mode (agreement nº22) with the `__DEV__`
  constant and the `build:cards:dev` script.
- Vitest suites for the palette, sensors, ring, computed info,
  localization and Button's pure logic (`button-state.ts`).
- The CI workflow also runs `npm run perf`, and the PR template includes
  the review checklist (agreement nº20).
- Documentation: repository agreements, how-to-build-a-card guide, API
  reference, Button examples (minimal and advanced YAML, screenshots and
  GIF) and a section per card in the README.

### Changed

- The Button and Entity editors split their rendering into per-section
  methods, and Button editor methods over 50 lines are split into smaller
  sub-templates (agreement nº7).
- Button's pure logic (grid columns, rows, broken entity, active state and
  icon) lives in `button-state.ts`, with its own tests.
- `subtitle_type` (Button) and `primary_info`/`secondary_info` (Entity)
  are typed with the real `InfoOption` union instead of `string`.
- The Button card size is computed automatically (`getGridOptions()` with
  automatic rows and columns based on the number of grouped sensors).

### Fixed

- `NeonPreset.name` restored: the translation infrastructure had broken
  the frozen surface without going through the exception process.

## [0.1.1] - 2026-08-16

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
