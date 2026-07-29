# Contribuir a Neón Cards

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
```

Todo debe pasar en verde. Los cambios significativos se revisan también en
arquitectura, API, rendimiento y documentación (acuerdo nº20).
