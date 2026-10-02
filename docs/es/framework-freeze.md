# Declaración de Framework Freeze

**Vigente desde:** 2026-08-13
**Línea base:** commit [`12da870`](https://github.com/Jaguaza/Neon-Cards/commit/12da870275fc2d568878ae267b527b1b0530a308)
de `feature/neon-button-card` — Entity Card + Button Card ya construidas
sobre el framework compartido.

## Qué queda congelado

Tal y como está descrito hoy en [`api.md`](./api.md) (ES) /
[`api.md`](../en/api.md) (EN):

- **Arquitectura** — la forma de `src/core`, `src/ha`, `src/shared`,
  `src/utils` y la independencia entre tarjetas (acuerdos nº1-nº6).
- **API pública** — toda función/constante exportada de esos cuatro
  módulos: firma, tipos de parámetros, tipo de retorno y comportamiento
  documentado. Ejemplos: `resolveGradientColors`, `getSensorDisplay`,
  `formatSensorState`, `neonRingSplitPaths`, `neonHaloVars`,
  `computeInfoDisplay`, `BaseNeonCard`.
- **Convenciones** — registro de tarjetas vía `index.ts` +
  `src/neon-cards.ts` (sin descubrimiento automático, nº10), estructura
  de carpetas por tarjeta (nº1), el proceso descrito en
  [`como-crear-una-tarjeta.md`](./como-crear-una-tarjeta.md).

## Qué NO congela esto

El freeze protege de **rediseños** — no es una promesa de que el código
esté libre de bugs, ni una razón para dejar uno sin arreglar.

- Un bug es un comportamiento que ya rompía lo que la arquitectura/API
  *prometían* en la línea base de arriba. Arreglarlo no es rediseñar
  nada — se hace igual que cualquier otro fix, siguiendo el resto de
  acuerdos (revisión nº20, lint/tests/build nº21, etc.).
- Un refactor interno que no cambia la forma pública tampoco rompe el
  freeze — por ejemplo, dividir un método interno en varios sin tocar su
  firma pública (lo que se hizo para el acuerdo nº7).

## Proceso de excepción — bug que exige romper la superficie congelada

Si arreglar un bug de verdad exige cambiar una firma pública, una ruta de
import, o el comportamiento documentado de algo ya congelado:

1. **Se arregla igualmente.** El freeze no es excusa para dejar algo roto
   a propósito.
2. **Es un cambio de versión mayor (semver)**, nunca un parche silencioso
   colado en una versión menor — el repo ya usa tags `v*` y
   `scripts/release.js major` para esto.
3. **Se documenta como excepción** en el `CHANGELOG` de esa versión (o,
   si no existe todavía, en las notas del GitHub Release): qué parte de
   la línea base se rompió, por qué el fix no era posible sin romperla, y
   qué cambia para quien ya usaba esa API/config.

## Qué queda fuera del freeze

`src/cards/<nombre>/` — cada tarjeta sigue evolucionando con normalidad
(nuevas opciones de config, nuevos bugs que arreglar, nuevas tarjetas
enteras) siempre que respete la arquitectura/API/convenciones ya fijadas
arriba. El freeze es del framework compartido, no de las tarjetas que lo
usan.
