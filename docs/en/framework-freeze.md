# Framework Freeze declaration

**In effect since:** 2026-08-13
**Baseline:** commit [`12da870`](https://github.com/Jaguaza/Neon-Cards/commit/12da870275fc2d568878ae267b527b1b0530a308)
on `feature/neon-button-card` — Entity Card and Button Card both already
built on top of the shared framework.

## What's frozen

As currently described in [`api.md`](./api.md) (EN) /
[`api.md`](../es/api.md) (ES):

- **Architecture** — the shape of `src/core`, `src/ha`, `src/shared`,
  `src/utils`, and the independence between cards (agreements nº1-nº6).
- **Public API** — every function/constant exported from those four
  modules: signature, parameter types, return type, and documented
  behavior. Examples: `resolveGradientColors`, `getSensorDisplay`,
  `formatSensorState`, `neonRingSplitPaths`, `neonHaloVars`,
  `computeInfoDisplay`, `BaseNeonCard`.
- **Conventions** — card registration via `index.ts` +
  `src/neon-cards.ts` (no automatic discovery, nº10), the per-card folder
  structure (nº1), the process described in
  [`how-to-build-a-card.md`](./how-to-build-a-card.md).

## What this does NOT freeze

The freeze protects against **redesigns** — it's not a promise that the
code is bug-free, nor a reason to leave a bug unfixed.

- A bug is behavior that already broke what the architecture/API
  *promised* at the baseline above. Fixing it isn't a redesign — it's
  handled like any other fix, following the rest of the agreements
  (review nº20, lint/tests/build nº21, etc.).
- An internal refactor that doesn't change the public shape doesn't
  break the freeze either — e.g. splitting an internal method into
  several without touching its public signature (what was done for
  agreement nº7).

## Exception process — a bug that forces breaking the frozen surface

If fixing a bug genuinely requires changing a public signature, an
import path, or the documented behavior of something already frozen:

1. **Fix it anyway.** The freeze is not an excuse to leave something
   broken on purpose.
2. **It's a major (semver) version bump**, never a silent patch slipped
   into a minor release — the repo already uses `v*` tags and
   `scripts/release.js major` for this.
3. **Document it as an exception** in that version's `CHANGELOG` (or, if
   one doesn't exist yet, in the GitHub Release notes): which part of
   the baseline broke, why the fix wasn't possible without breaking it,
   and what changes for anyone already relying on that API/config.

## What's outside the freeze

`src/cards/<name>/` — each card keeps evolving normally (new config
options, new bugs to fix, entirely new cards) as long as it respects the
architecture/API/conventions frozen above. The freeze covers the shared
framework, not the cards built on top of it.
