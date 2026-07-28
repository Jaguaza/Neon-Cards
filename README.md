# Neón Cards

Paquete de tarjetas Lovelace personalizadas para Home Assistant, con
estética neón.

🇪🇸 Español (este archivo) · 🇬🇧 [English](./docs/en/README.md)

> **Estado:** en desarrollo temprano. Todavía no hay ninguna tarjeta
> publicada — ver [docs/es](./docs/es/README.md) para el plan de fases.

## Estructura del repositorio

```
core/           # Paquete npm independiente: clases y contratos base
src/
  ha/           # Integración específica con Home Assistant
  shared/       # Componentes visuales y estilos reutilizables
  utils/        # Utilidades genéricas sin dependencias de HA
  cards/        # Cada tarjeta, aislada de las demás (una subcarpeta = una tarjeta)
  index.ts      # Punto de entrada del paquete raíz
docs/           # Documentación versionada (es/en)
examples/       # YAML de ejemplo de cada tarjeta
scripts/        # Scripts de mantenimiento del repositorio (release, etc.)
```

`core` se mantiene como paquete npm independiente (workspace aparte) porque
es el candidato natural a publicarse por separado si algún día conviene
reutilizarlo fuera de este repositorio. El resto vive junto en `src/` para
minimizar el número de `package.json`/`tsconfig.json` que mantener.

Ver los [acuerdos completos del repositorio](./docs/es/acuerdos.md) para el
detalle de cada regla de arquitectura, calidad y proceso.

## Desarrollo

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

## Releases

Este repo usa versionado semántico gestionado por `scripts/release.js`:

```bash
npm run release:patch   # 0.1.0 → 0.1.1 (arreglos pequeños)
npm run release:minor   # 0.1.0 → 0.2.0 (nueva funcionalidad compatible)
npm run release:major   # 0.1.0 → 1.0.0 (cambios incompatibles)
npm run release -- 1.0.0  # salto directo a una versión concreta
npm run release:beta    # publica un tag de prueba sin cambiar la versión
```

Cada `release:patch|minor|major` o `release -- X.Y.Z` crea un commit, un tag
`vX.Y.Z` y lo empuja a `main`; el workflow de GitHub Actions se encarga de
construir los assets y publicar el GitHub Release.

## Licencia

[MIT](./LICENSE)
