# Contribuir a Neón Cards

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#contributing-to-neón-cards-english)

Antes de proponer un cambio, lee los
[acuerdos del repositorio](./docs/es/acuerdos.md) — recogen las reglas de
arquitectura, calidad y proceso que rigen este proyecto.

## Versión única

La versión de todo el proyecto vive en un solo sitio: `package.json`. Cada
tarjeta la referencia importando `NEON_CARDS_VERSION` desde
`src/version.ts` — nunca declares un número de versión propio en una
tarjeta. `scripts/release.js` mantiene ambos sincronizados en cada
release; no edites ninguno de los dos a mano.

## Resumen rápido

- Una tarjeta nunca importa código de otra tarjeta. Solo puede depender de
  `core`, `ha`, `shared` y `utils`.
- Nada de carpetas genéricas (`helpers/`, `commons/`, `manager/`, `misc/`).
- Sin `TODO` / `FIXME` / `HACK` en `main` — cualquier pendiente se registra
  como Issue.
- No se publica una versión si falla ESLint, TypeScript, los tests o el
  build.
- Toda funcionalidad pública necesita un ejemplo en `examples/` y
  documentación en `docs/es` y `docs/en`.

## Antes de abrir un Pull Request

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm test
npm run perf
```

Todo debe pasar en verde. Los cambios significativos se revisan también en
arquitectura, API, rendimiento y documentación (acuerdo nº20).

`npm run perf` ejecuta el render real de cada tarjeta en jsdom para
detectar renders lentos o fugas de memoria (acuerdo nº18) — no sustituye
una prueba manual en el navegador con muchas tarjetas reales, pero sí
detecta regresiones antes de llegar ahí.

---

# Contributing to Neón Cards (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#contribuir-a-neón-cards)

Before proposing a change, read the
[repository agreements](./docs/en/agreements.md) — they lay out the
architecture, quality, and process rules that govern this project.

## Single version

The whole project's version lives in one place: `package.json`. Every
card references it by importing `NEON_CARDS_VERSION` from
`src/version.ts` — never declare a card's own version number.
`scripts/release.js` keeps both in sync on every release; don't edit
either by hand.

## Quick summary

- A card never imports code from another card. It can only depend on
  `core`, `ha`, `shared`, and `utils`.
- No generic folders (`helpers/`, `commons/`, `manager/`, `misc/`).
- No `TODO` / `FIXME` / `HACK` on `main` — anything pending is tracked
  as an Issue.
- A version isn't published if ESLint, TypeScript, tests, or the build
  fail.
- Every public feature needs an example in `examples/` and
  documentation in `docs/es` and `docs/en`.

## Before opening a Pull Request

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm test
npm run perf
```

Everything must pass. Significant changes are also reviewed for
architecture, API, performance, and documentation (agreement nº20).

`npm run perf` runs each card's real render in jsdom to catch slow
renders or memory leaks (agreement nº18) — it doesn't replace a manual
browser test with many real cards, but it does catch regressions before
you get there.
