# Cómo crear una tarjeta

Guía para añadir una tarjeta nueva a Neón Cards, usando las dos tarjetas
existentes ([Entity](../../src/cards/entity) y
[Button](../../src/cards/button)) como referencia paralela. Antes de
empezar, lee los [Acuerdos del repositorio](./acuerdos.md) — esta guía
no repite las reglas, solo explica cómo aplicarlas paso a paso.

Ver también la versión en [inglés](../en/how-to-build-a-card.md).

## 1. Estructura de archivos

Cada tarjeta es una carpeta independiente en `src/cards/<nombre>/`
(acuerdo nº1 y nº3). Estos son los archivos que necesita, tomando
`src/cards/button/` como plantilla:

| Archivo | Responsabilidad |
|---|---|
| `<nombre>.ts` | Componente Lit principal — extiende `BaseNeonCard`, `render()`, `getCardSize()`, `getGridOptions()`. |
| `<nombre>-editor.ts` | Editor visual (`static getConfigElement()` lo referencia). |
| `<nombre>.styles.ts` | `css` propio de la tarjeta, separado del componente por tamaño (acuerdo nº7). |
| `types.ts` | Interfaz `Config` de la tarjeta (extiende lo mínimo de `ActionConfig` de `src/ha/types`; termina en `[key: string]: unknown` — necesario para que `_configChanged` del editor compile con clave dinámica, no relleno "por si acaso". Documéntalo igual que en `src/cards/button/types.ts`). |
| `constants.ts` | Valores por defecto propios; importa `NEON_CARDS_VERSION` de `../../version` para `CARD_VERSION`. |
| `index.ts` | Registro: `customElements.define`, `window.customCards.push`, banner de consola. |
| `README.md` | Spec y config YAML bilingüe de la tarjeta (mismo patrón que `src/cards/button/README.md`). |
| `translations/` | Todo el texto visible en español de esta tarjeta, `types.ts`+`es.ts`+`index.ts` — ver sección 4, "Traducciones". |

Una clase, una responsabilidad (acuerdo nº8): si `<nombre>.ts` empieza a
mezclar, por ejemplo, cálculo de sensores con renderizado, ese cálculo
se extrae a una función o a `src/ha`/`src/shared`, no se queda inline.

## 2. Qué va en `core`/`ha`/`shared`/`utils` y qué no

Una tarjeta **nunca** importa de otra tarjeta (acuerdo nº3) — solo de
`src/core`, `src/ha`, `src/shared` y `src/utils`. Antes de escribir algo
nuevo, pregúntate:

- ¿Es lógica de gestos, acciones `hass-action`, o cálculo de
  información primaria/secundaria? → ya existe en `src/core`, reutilízalo.
- ¿Lee `hass.states` para un tipo de entidad? → va en `src/ha` (ver
  `src/ha/sensors.ts`), la tarjeta nunca lee `hass.states` a mano.
- ¿Es visual y lo usaría más de una tarjeta (paleta, halos, animaciones)?
  → va en `src/shared` (ver `src/shared/glow.ts`,
  `src/shared/neon-palette.ts`).
- ¿Es puramente de esta tarjeta (su propio layout, su propia config)? →
  se queda local a `src/cards/<nombre>/`.

Si a mitad de construir una tarjeta nueva te das cuenta de que algo que
escribiste ya existe en otra tarjeta sin extraer, ese es el momento de
extraerlo a `shared`/`ha`/`core` (acuerdo nº4) — nunca copiarlo.

## 3. Registro

1. Añade los tres registros en `index.ts` (ver
   `src/cards/button/index.ts` como plantilla): `customElements.define`
   para la tarjeta y su editor, y el `push` a `window.customCards` con
   `type`, `name`, `description`, `preview: true`.
2. Añade una línea de import en `src/neon-cards.ts` — sin descubrimiento
   automático de carpetas (acuerdo nº10).

## 4. Traducciones

Hoy la UI de configuración (los dos editores visuales) y un par de
textos visibles en tiempo de ejecución (mensajes de error, "no
disponible") solo existen en español — pero la infraestructura ya está
lista para que en el futuro se añadan más idiomas sin volver a tocar
esto.

**Motor genérico, sin texto dentro — `src/core/localize.ts`:**
`resolveLocale(hass)` lee `hass.locale.language` y cae a
`DEFAULT_LOCALE` si no está soportado; `localize(hass, dict, key)`
busca `key` en el diccionario del idioma resuelto.

**Un diccionario por módulo, no uno gigante compartido** — cada tarjeta
es dueña de su propio texto (acuerdo nº3):

```
src/cards/<nombre>/translations/
  types.ts   — interfaz <Nombre>Translations con TODAS las claves
  es.ts      — export const es: <Nombre>Translations = {...}
  index.ts   — export const <NOMBRE>_TRANSLATIONS: Record<Locale, ...> = { es }
```

En el componente/editor:

```ts
private _t(key: keyof MiTarjetaTranslations): string {
  return localize(this.hass, MI_TARJETA_TRANSLATIONS, key);
}
```

**Antes de añadir un texto nuevo, comprueba si ya es de `src/shared`** —
`src/shared/translations` tiene lo que es *el mismo widget con el mismo
texto fijo* en más de una tarjeta (hoy: nombres de preset de paleta,
los 3 stops de color del selector, la sección de acciones
tap/hold/double_tap). Si tu tarjeta también tiene selector de paleta o
acciones, usa esas claves compartidas (`localize(this.hass,
SHARED_TRANSLATIONS, 'action_tap')`, por ejemplo) en vez de duplicar el
texto en tu propio diccionario — eso fue justo el bug que se corrigió
la primera vez que se hizo esto (Button y Entity tenían cada una su
propia copia literal, ya divergida). Una coincidencia de texto
*incidental* (dos tarjetas que llaman "Configuración Principal" a su
primera sección sin ser el mismo concepto) no cuenta — eso se queda en
el diccionario propio de cada una.

**Cuando llegue el primer idioma nuevo:** crear
`translations/en.ts` en cada módulo que lo necesite (`core`, `shared`,
y cada tarjeta) implementando su interfaz — TypeScript da error de
compilación si falta una clave, no deja pasar un texto en español a
medias — añadirlo al `Record<Locale, ...>` de cada `index.ts`, y añadir
`'en'` a `SUPPORTED_LOCALES` en `src/core/localize.ts`.

## 5. Documentación (acuerdo nº13, nº14, nº16)

Toda en español **e** inglés, versionada en el repo:

- `src/cards/<nombre>/README.md` — spec de la tarjeta, igual formato que
  el de Button (config YAML, cada opción explicada, ejemplos de bloque).
- `docs/es/api.md` / `docs/en/api.md` — añade la sección de
  configuración YAML de la tarjeta nueva (todas las claves del `Config`,
  con descripción, tipo, valor por defecto). Si la tarjeta expone alguna
  función o constante pública nueva en `core`/`ha`/`shared`, documéntala
  ahí también con descripción, parámetros, valor devuelto y ejemplo
  (acuerdo nº16) — no solo la config YAML.
- `examples/README.md` — YAML mínimo, YAML avanzado, captura, GIF y
  explicación para la tarjeta nueva (acuerdo nº17).

## 6. Diagnóstico en desarrollo (acuerdo nº22)

Para avisos que solo ayudan mientras se edita una tarjeta (config mal
formada, entidad de dominio equivocado, algo que se recorta o se
ignora en silencio) usa la constante global `__DEV__`:

```ts
if (__DEV__) {
  console.warn('[mi-tarjeta] explica aquí qué está mal y por qué');
}
```

`__DEV__` la sustituye `@rollup/plugin-replace` en tiempo de build (ver
`rollup.config.mjs`) — en `npm run build:cards` normal vale `false` y
terser borra el bloque entero como código muerto, así que no llega al
bundle publicado; con `npm run build:cards:dev` vale `true` y el aviso
sí se ve. No uses `console.warn`/`console.log` sueltos sin envolverlos
en `if (__DEV__)` — eso sí llegaría a producción. Los scripts que
importan el `.ts` sin pasar por rollup (como `scripts/perf-check.mjs`)
necesitan su propio `globalThis.__DEV__ = false` al principio.

## 7. Antes de mergear a `main` (acuerdo nº18, nº20, nº21)

Checklist final, todo debe cumplirse antes de integrar:

- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`
      sin errores.
- [ ] `npm run perf` — sin regresión notable de rendimiento ni indicios
      de fuga de memoria.
- [ ] Editor visual funcional (no solo YAML).
- [ ] `README.md` de la tarjeta y ambas versiones de `docs/*/api.md`
      actualizadas.
- [ ] `examples/README.md` con captura y GIF **reales** de Home
      Assistant, no placeholders "pendiente".
- [ ] Sin `TODO`/`FIXME`/`HACK` en el código (acuerdo nº19) — cualquier
      pendiente real se registra como Issue en su lugar.
- [ ] Revisión de arquitectura, API, rendimiento y documentación
      (acuerdo nº20) antes de mergear cambios importantes.

## 8. Congelación del framework (acuerdo nº25)

Este proceso (pasos 1-7) es el que se siguió para construir la Button
Card sobre el framework que dejó la Entity Card. El framework ya está
congelado — ver la [declaración completa](./framework-freeze.md) para la
línea base exacta y qué hacer si un bug futuro obliga a romper algo ya
congelado. A partir de aquí estos pasos ya no cambian: la única
evolución posible es dentro de las convenciones ya fijadas, sin
rediseñar `core`/`ha`/`shared`.
