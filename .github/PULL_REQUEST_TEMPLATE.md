<!--
Revisión obligatoria antes de mergear (acuerdo nº20 de docs/es/acuerdos.md).
El CI (.github/workflows/ci.yml) ya valida lint/typecheck/test/build/perf —
este checklist es para lo que el CI no puede juzgar por ti: si el diseño
tiene sentido. Márcalo con criterio, no por rellenar; una casilla marcada
sin haberlo pensado no vale nada.
-->

## Qué cambia y por qué

<!-- Resumen breve. Si toca una tarjeta nueva o una sección de acuerdos.md
     concreta, enlázala. -->

## Checklist de revisión (acuerdo nº20)

- [ ] **Arquitectura** — respeta la independencia entre tarjetas (nº3): no
      hay imports de una tarjeta a otra. Lo reutilizable entre tarjetas
      vive en `core`/`ha`/`shared`/`utils` (nº4), no duplicado.
- [ ] **API** — toda función/constante pública nueva está documentada en
      `docs/es/api.md` **y** `docs/en/api.md` con descripción, parámetros,
      valor devuelto y ejemplo (nº16).
- [ ] **Rendimiento** — sin regresión notable ni indicio de fuga de
      memoria (el job `perf` del CI ya lo comprueba; si toca una tarjeta
      nueva, añádela a `scripts/perf-check.mjs`).
- [ ] **Documentación** — `README.md` de la tarjeta afectada, ambos
      `docs/*/api.md` y `examples/README.md` actualizados si el cambio
      toca config YAML o el API pública.

## Si es una tarjeta nueva o cambia su comportamiento visible

- [ ] Editor visual probado, no solo YAML.
- [ ] `examples/README.md` con capturas y GIF **reales** de Home
      Assistant (nº17/18) — nada de placeholders "pendiente".
- [ ] Sin `TODO`/`FIXME`/`HACK` en el código (nº19).
