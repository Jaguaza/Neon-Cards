# Neón Cards Repository Agreements

## 1. Clear structure

The repository has a simple, easy-to-navigate structure.

- One folder = one responsibility.
- No "misc", "common", or "temp" folders.
- The structure should be understandable in a few minutes.

## 2. Domain-based architecture

Code is organized by responsibility, not by file type:

```
cards/
core/
ha/
shared/
utils/
docs/
examples/
```

## 3. Card independence

Each card is an independent module. It can never import code from another
card. It may only depend on `core`, `ha`, `shared`, and `utils`.

## 4. Reusable code

When functionality becomes reusable, it moves into the framework. It is
never copied between cards.

## 5. No circular dependencies

No circular dependency may exist between modules.

## 6. No generic folders

No `helpers/`, `commons/`, `manager/`, or `misc/` folders. Every folder must
clearly describe its content.

## 7. Small files

Guideline targets: function ≤ 50 lines, class ≤ 500 lines, file ≤ 500 lines.

## 8. One responsibility per class

A class does one thing. If it starts taking on multiple responsibilities,
it gets split.

## 9. Self-documenting code

We prefer good names and small functions over comments. Comments explain
why, not what.

## 10. No magic

Nothing happens automatically without the developer seeing it. Avoid
automatic registration, hidden conventions, and complex decorators.

## 11. Minimal dependencies

Add a library only when it brings a clear benefit. Prefer simple in-house
solutions.

## 12. Official examples

Every public feature has an example. `examples/` is part of the repository
and of the documentation.

## 13. Documentation lives in the repository

All documentation is versioned alongside the code. There is no "external"
documentation as a primary source.

## 14. Bilingual documentation

All official documentation is available in Spanish and English.

## 15. Documented architecture

Developer-facing documentation covers: architecture, API, conventions,
examples, and how to build a card.

## 16. Documented API

Every public API has: description, parameters, return value, and example.

## 17. One example per card

Every card includes: minimal YAML, advanced YAML, screenshot, GIF, and
explanation.

## 18. Mandatory quality gate before publishing

A card is not published until it has: code, visual editor, documentation,
examples, animations, and validated performance.

## 19. No technical debt on main

No `TODO`, `FIXME`, or `HACK`. Anything pending must be tracked as an
Issue.

## 20. Mandatory review

Before merging significant changes, the following are reviewed:
architecture, API, performance, documentation.

## 21. Mandatory lint and checks

A version is not published if ESLint, TypeScript, tests, or the build fail.

## 22. Development mode

Two modes: development (logs, warnings, diagnostics) and production (no
debug code, maximum performance).

## 23. Internal feature flags

Experimental features can be enabled via internal flags. They never reach
production enabled by default.

## 24. Planned compatibility

Only a defined range of Home Assistant versions is supported. Indefinite
compatibility is not maintained.

## 25. Framework freeze

Once the Neón Card Entity is finished, the architecture, public API, and
conventions are frozen. From that point on, the framework evolves without
being redesigned.
