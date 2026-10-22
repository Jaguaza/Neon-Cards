# Changelog

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#changelog-english)

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Fixed

- Lock Card: en pantallas donde un hueco de la rejilla mide muy poco (p. ej. un portátil de 13,3" escalado al 150 %, donde 6 columnas son ~140 px y 3 columnas ~65 px) la mediana mostraba el nombre cortado («G. C…»), «80…» y la fecha del último acceso con «…», y la compacta de 3 columnas no cabía. Ahora la mediana apila la cabecera (icono arriba; debajo, nombre y estado) y pone los datos del pie en columna cuando ni así caben, y la compacta tiene un modo minúsculo (menos relleno, icono y texto más pequeños, nombre en dos líneas) que cabe en ~65 px; sus botones de confirmación también se reducen. A anchos normales ninguna de las tres cambia.
- Thermostat Card: en la vista compacta los botones de «más información» de cada entidad iban pegados al icono de modo y quedaban muy a la izquierda. Ahora van arriba a la derecha, como en las otras vistas, con el icono de modo a la izquierda.
- Lock Card: el pie de la tarjeta mediana se cortaba en el iPhone y en el HP («8…», «Jorge · 19 oct…»), porque el último acceso con fecha es largo y el reparto proporcional recortaba también la batería. Ahora «80 %» no se recorta, el último acceso pasa a dos líneas (nombre y fecha) en tarjetas estrechas y con ~180 px se quitan los iconos.
- Lock Card: la vista de confirmación («¿Abrir?», «¿Qué quieres hacer?») se cortaba por abajo en tarjetas estrechas: los botones saltaban a una segunda fila fuera de la tarjeta. Ahora la vista ocupa el sitio del contenido (la tarjeta crece si hace falta), el título va en una línea y los botones, compactos, en una sola fila.
- Lock Card: la tarjeta mediana solo muestra dos datos en el pie, batería y último acceso: el sensor de puerta no se pinta (si `footer_items` trae `door`, se ignora y no le quita el sitio a los otros). El editor no ofrece el interruptor de puerta en ese tamaño y avisa de que no se muestra, pero deja elegir el sensor porque sigue sirviendo para el texto «Puerta abierta» del estado, como en la compacta.
- Lock Card: a la tarjeta compacta le faltaban los tres puntos para ir a la entidad. Ahora están en la esquina superior derecha y abren «más información» sin disparar la acción de la tarjeta.
- Sensor Card: en contenedores muy estrechos el valor se partía por dentro del número («21. / 9») y la etiqueta por dentro de la palabra («Correct / o»), y la tarjeta pequeña crecía por encima de sus 2 filas. Ahora el valor y la etiqueta nunca se parten (si no cupieran, se abrevian con «…»), en el tamaño pequeño el valor y la unidad escalan con el ancho real de la tarjeta, y la tarjeta pequeña no pasa de su hueco.
- Sensor Card: en el tamaño pequeño el valor se muestra siempre con un decimal (`xx.x`) y se quita la opción de decimales del editor en ese tamaño (`decimals` se ignora; en mediano y grande funciona como siempre).
- Sensor Card: la tarjeta pequeña ya no se estira hasta rellenar sus 2 filas de la rejilla: mide lo que necesita su contenido (≈ 90 px sin subtítulo, ≈ 103 px con él, antes 120 px) y su relleno interno es menor.
- Sensor Card: más ajustes de diseño. El tamaño pequeño ya muestra el subtítulo (antes lo ocultaba aunque estuviera activado) y agrupa icono, nombre, subtítulo y valor centrados, sin hueco entre el nombre y el número. En el mediano y el grande los dígitos son más pequeños para dar más ancho al gráfico. El grande pasa a 12×2: cabecera arriba y, debajo, el valor y la etiqueta del umbral a la izquierda y el gráfico a la derecha.
- Sensor Card: ajustes de diseño tras el hueco fijo. Interlineados explícitos en nombre, subtítulo y etiqueta (HA heredaba uno de ~1,5 que engordaba la cabecera y aplastaba el gráfico); en tarjetas estrechas el icono y el menú ⋮ de la mediana se reducen para que el nombre quepa en una línea; y en la pequeña el icono va arriba y el nombre debajo a todo el ancho (antes se quedaba en «Te m….»).
- Sensor Card: las gráficas se salían de la tarjeta. El alto del contenido dependía del ancho (en tarjetas estrechas el menú ⋮ y el gráfico saltaban a otra línea) y HA reservaba un alto menor. Ahora cada tamaño ocupa un hueco fijo en la rejilla (pequeño 3×2, mediano 6×2, grande 12×2, columnas × filas, sin redimensionar) y el layout no cambia de alto con el ancho: el menú no salta, el nombre ocupa como mucho dos líneas y el valor y el gráfico van en la misma fila (el gráfico se encoge en vez de saltar de línea). Lo que no quepa se recorta dentro de la tarjeta.
- Button Card: en tarjetas estrechas los valores del pie de sensores se
  cortaban con «…» («21....»). Ahora el relleno va solo entre sensores, un hueco
  no encoge por debajo de su contenido y, si número y unidad no caben juntos,
  se oculta primero la unidad y solo después se recorta el número. El
  separador vertical sigue sin tocar el contenido.
- Thermostat Card: cada tamaño ocupa ahora un hueco fijo en la rejilla de HA y no se puede redimensionar: pequeña 5×4, mediana 8×5 y grande 12×5 (columnas × filas). En el editor, el tamaño «Normal» pasa a llamarse «Mediana» (el valor de YAML sigue siendo `normal`).

- Lock Card: en iOS (app de HA / WebKit) el halo aparecía ya dibujado al
  abrirse la vista de confirmación, sin la animación del aro. Ahora el halo
  se enciende primero y la vista aparece 120 ms después, y se quita el
  `backdrop-filter` de la vista, que da problemas con las transiciones en
  WebKit.
- Lock Card: la vista de confirmación ya no depende de un fondo o de un
  difuminado para tapar el contenido de la tarjeta (con temas de cristal
  translúcidos, y en iOS, el texto de debajo se transparentaba). Mientras la
  vista está abierta se oculta el contenido original, sin cambiar el tamaño
  de la tarjeta.

### Added

- Lock Card: nueva tarjeta `custom:neon-lock-card` para entidades `lock`. Icono animado a elegir (`lock_icon`: candado, puerta, garaje enrollable o garaje corredera) que se abre y se cierra de verdad según el estado, halo neón que sigue al estado, confirmación al abrir, pie con hasta tres datos, tres tamaños (`size`) y editor visual. Ver [`src/cards/lock/README.md`](./src/cards/lock/README.md).
- Lock Card: nuevo tamaño `compact` (Compacta). Solo muestra icono, nombre y estado (con los tres puntos para abrir «más información»), sin pie y sin subtítulo, con el icono arriba y el nombre y el estado debajo (3 columnas por defecto, mínimo 3). Al pulsar no sale texto: la orden (bloquear, desbloquear, abrir) se elige con iconos de candado y una ✕ para cancelar, con el texto como etiqueta accesible. Las tarjetas grande y mediana no cambian.
- Lock Card: nueva opción `size`. La tarjeta **mediana** (`medium`) no lleva subtítulo (no hay opción para ponerlo) y el estado, con su punto de color, ocupa su sitio bajo el nombre, con los tres puntos en la esquina; su pie va siempre en una sola fila (en tarjetas estrechas, con menos relleno e iconos y sin iconos con tres datos). La tarjeta **grande** (`large`, el valor por defecto) es la de siempre y no cambia.
- Lock Card: el color del punto de estado se puede elegir (`status_color_closed`,
  `status_color_open`, `status_color_alert`: cerrada, desbloqueada/abierta y
  atascada/no disponible; por defecto verde, ámbar y rojo). Selectores de
  color en el editor visual con «Restablecer colores». Cualquier color CSS en
  YAML; un valor inválido se ignora.
- Lock Card: el dato de puerta del pie, cuando el sensor está activo (puerta
  abierta), toma el color del estado «desbloqueada o abierta»
  (`status_color_open`, ámbar por defecto) en el icono y el texto; cerrada
  se queda en el color normal.
- Lock Card: nuevo diseño. Arriba el icono con el nombre y el subtítulo a su
  lado y, a la derecha, el estado (punto verde/ámbar/rojo y texto) y los tres
  puntos de «más información». Abajo, una línea de neón y hasta tres datos
  (`footer_items`): sensor de puerta (`door_entity`), batería
  (`battery_entity` o atributo `battery_level`) y último acceso
  (`last_user_entity` o atributo `changed_by`). Editor visual con tres
  huecos y sus selectores de entidad.
- Lock Card: si la cerradura soporta además abrir (`supported_features`), al
  pulsar con el `toggle` por defecto se elige entre **Desbloquear/Abrir**
  (cerrada) o **Bloquear/Abrir** (desbloqueada); la opción llama a
  `lock.unlock`, `lock.open` o `lock.lock`. Sin soporte de abrir no cambia.
- Lock Card: confirmación al abrir (`confirm_open`, activa por defecto). Al
  pulsar para abrir la cerradura aparece una vista «¿Abrir?» en la propia
  tarjeta, con el halo encendido y botones neón (Abrir / Cancelar; Esc
  cancela, el foco empieza en Cancelar). Se cancela sola a los 8 s o si la
  cerradura cambia de estado. Cerrar nunca pregunta. Interruptor en el
  editor visual; `confirm_open: false` la desactiva.

### Changed

- Lock Card: columnas de inicio según el tamaño: grande 12, mediana 6 y compacta 3 (antes 6, 6 y 4). Se pueden cambiar a mano desde la pestaña «Diseño» de HA; el mínimo es 4, 4 y 3. Una tarjeta con `grid_options` guardado en el YAML conserva su ancho.
- Thermostat Card: la tarjeta ya no apaga por su cuenta la segunda entidad
  cuando el modo cambia desde fuera (diálogo de la entidad, otra tarjeta,
  automatizaciones, voz…): solo envía órdenes de servicio cuando el usuario
  interactúa con ella. La exclusión al elegir el modo en la propia tarjeta se
  mantiene. Para tenerla también con cambios hechos fuera de la tarjeta, la
  documentación (README principal y de la tarjeta) incluye una automatización
  de Home Assistant de ejemplo.
- Lock Card: `subtitle_type` pasa a valer `none` por defecto, porque el estado
  ya se muestra arriba a la derecha (antes era `state`; se puede volver con
  `subtitle_type: state`). La tarjeta ocupa por defecto media rejilla
  (`columns: 6`) y es más alta.
- Lock Card: en español, `unlocked` se muestra como «Desbloqueada» (antes
  «Abierta», que se confundía con la puerta abierta) y `unlocking` como
  «Desbloqueando…». «Puerta abierta» queda solo para `open`.
- Lock Card: el estado `jammed` (atascada) muestra la X de error
  (`mdi:close`) con el halo rojo, como la entidad inexistente o no disponible
  y como las demás tarjetas; el subtítulo sigue diciendo «Atascada».
- Lock Card: el halo pasa a seguir el estado de la cerradura en vez de un
  destello temporizado: se enciende cuando se abre, permanece encendido
  mientras esté abierta (también al cerrarse) y se apaga al llegar a
  `locked`. Todas las tarjetas de la misma entidad lo muestran a la vez y
  desaparece el «rebote» con cerraduras lentas. Al pulsar una acción que
  opera la cerradura (`toggle`, `call-service`) el halo se enciende ya y
  espera el cambio de estado (hasta 6 s).
- Lock Card: el icono `door` pasa a ser `mdi:door-closed` y se anima
  hasta `mdi:door-open` (la hoja gira sobre la jamba izquierda).
- Lock Card: los iconos de garaje (`garage_roller` y `garage_sliding`)
  pasan a la silueta de `mdi:garage-variant` (tejado y jambas macizos, tres
  lamas), manteniendo la animación de enrollar y de deslizar.

## [1.2.0] - 2026-10-12

### Added

- **Neón Sensor Card** (`custom:neon-sensor-card`): tarjeta de solo
  lectura para una entidad `sensor` o `binary_sensor` (cualquier otro
  dominio se rechaza). Muestra valor, unidad y estado, con tres tamaños
  (`size`: pequeño sin gráfico; mediano y grande con gráfico, este a 12
  columnas) y un gráfico del histórico con trazo tipo monitor
  de constantes vitales. El efecto de color (`halo` de tres colores,
  `single` o `normal`) afecta solo al gráfico y al icono; el perímetro
  de la tarjeta lo marcan únicamente los umbrales opcionales (Bajo /
  Correcto / Alto, un color y un nombre por nivel) y sin ellos se ve
  normal. La etiqueta de estado bajo el valor solo aparece con los
  umbrales activados y con una valoración: sin datos no hay etiqueta,
  pero el perímetro conserva su color. Sin pie de sensores. Editor visual.
- Subtítulo personalizado (`subtitle`) en la Neón Sensor Card, con campo
  en el editor visual: si falta o está en blanco se muestra «Sensor» o
  «Sensor binario». Con `show_subtitle: false` (casilla «Mostrar
  subtítulo» en el editor) el subtítulo no se muestra.
- `src/ha/history.ts` (`fetchHistory`, `parseHistory`) y `callWS`
  opcional en `HomeAssistant`, documentados en la referencia de API.
- Perfil `sensor` en `npm run perf` y tests nuevos para el estado, los
  colores, el trazo y el histórico.
- README de la tarjeta Sensor, sección en el README principal, capturas
  (`assets/screenshots/sensor`), GIF (`assets/gifs/Sensor.gif`) y entrada
  en `examples/` (YAML mínimo y avanzado, capturas, GIF y explicación),
  en español e inglés.

### Changed

- En la documentación y en las descripciones de las tarjetas (Entity,
  Button y Thermostat), el efecto del borde pasa a llamarse «halo». El
  dial semicircular del termostato sigue llamándose «aro» y los nombres
  técnicos del código (`neon-ring-*`, `RingSizeController`) no cambian.
- La referencia de API en español incluye la tabla «Constantes y tipos»
  de `info.ts`, que solo estaba en inglés. Los README de `src/cards` y
  `src/ha` listan ahora el termostato, el sensor y la lectura del
  histórico.
- La Neón Sensor Card divide su `render()` en métodos por zona
  (acuerdo nº7); el DOM resultante es idéntico.

## [1.1.0] - 2026-10-08

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

- Lock Card: new `custom:neon-lock-card` card for `lock` entities. Animated icon of your choice (`lock_icon`: padlock, door, roller garage or sliding garage) that really opens and closes according to the state, a neon halo that follows the state, confirmation before opening, a footer with up to three data points, three sizes (`size`) and a visual editor. See [`src/cards/lock/README.md`](./src/cards/lock/README.md).
- Lock Card: new `compact` size (Compact). It only shows icon, name and state (with the three dots to open "more info"), no footer and no subtitle, with the icon on top and the name and state below (3 columns by default, minimum 3). No text appears when tapped: the command (lock, unlock, open) is chosen with padlock icons and a ✕ to cancel, with the text as an accessible label. The large and medium cards do not change.
- Lock Card: new `size` option. The **medium** card (`medium`) has no subtitle (there is no option to set one) and the state, with its coloured dot, takes its place under the name, with the three dots in the corner; its footer always stays on a single row (in narrow cards, with less padding and icons, and no icons with three data points). The **large** card (`large`, the default) is the same as ever and does not change.
- Lock Card: the status dot colour can be chosen (`status_color_closed`,
  `status_color_open`, `status_color_alert`: locked, unlocked/open and
  jammed/unavailable; green, amber and red by default). Colour pickers in the
  visual editor with "Reset colours". Any CSS colour in YAML; an invalid value
  is ignored.
- Lock Card: the footer door data point, when the sensor is active (door
  open), takes the colour of the "unlocked or open" state
  (`status_color_open`, amber by default) on the icon and the text; closed
  keeps the normal colour.
- Lock Card: new design. On top, the icon with the name and subtitle beside it
  and, on the right, the state (green/amber/red dot and text) and the three
  "more info" dots. Below, a neon line and up to three data points
  (`footer_items`): door sensor (`door_entity`), battery (`battery_entity` or
  the `battery_level` attribute) and last access (`last_user_entity` or the
  `changed_by` attribute). Visual editor with three slots and their entity
  pickers.
- Lock Card: if the lock also supports opening (`supported_features`), tapping
  with the default `toggle` lets you choose between **Unlock/Open** (locked) or
  **Lock/Open** (unlocked); the option calls `lock.unlock`, `lock.open` or
  `lock.lock`. Without open support nothing changes.
- Lock Card: confirmation before opening (`confirm_open`, on by default). When
  tapping to open the lock, an "Open?" view appears in the card itself, with
  the halo lit and neon buttons (Open / Cancel; Esc cancels, focus starts on
  Cancel). It cancels itself after 8 s or if the lock changes state. Locking
  never asks. Switch in the visual editor; `confirm_open: false` disables it.

### Fixed

- Lock Card: on screens where a grid slot measures very little (e.g. a 13.3" laptop scaled to 150%, where 6 columns are ~140 px and 3 columns ~65 px) the medium card showed the name cut ("G. C…"), "80…" and the last-access date with "…", and the 3-column compact card did not fit. Now the medium stacks the header (icon on top; name and state below) and puts the footer data in a column when even that doesn't fit, and the compact has a tiny mode (less padding, smaller icon and text, name on two lines) that fits in ~65 px; its confirmation buttons also shrink. At normal widths none of the three changes.
- Thermostat Card: in the compact view the "more info" buttons for each entity were glued to the mode icon and sat too far left. Now they go at the top right, as in the other views, with the mode icon on the left.
- Lock Card: the medium card's footer was cut off on the iPhone and the HP ("8…", "Jorge · 19 oct…"), because the last access with a date is long and the proportional split also clipped the battery. Now "80 %" is never clipped, the last access goes onto two lines (name and date) in narrow cards and at ~180 px the icons are dropped.
- Lock Card: the confirmation view ("Open?", "What do you want to do?") was cut off at the bottom in narrow cards: the buttons wrapped onto a second row outside the card. Now the view takes the place of the content (the card grows if needed), the title fits on one line and the buttons are compact, on a single row.
- Lock Card: the medium card only shows two footer data points, battery and last access: the door sensor is not drawn (if `footer_items` has `door` it is ignored and does not take the other items' place). The editor does not offer the door switch at that size and warns that it is not shown, but still lets you choose the sensor because it keeps serving the "Door open" status text, as in the compact card.
- Lock Card: the compact card was missing the three dots to go to the entity. They are now in the top-right corner and open "more info" without triggering the card's action.
- Sensor Card: in very narrow containers the value was split inside the number ("21. / 9") and the label inside the word ("Correct / o"), and the small card grew past its 2 rows. Now the value and the label never split (if they don't fit, they are cut with "…"), in the small size the value and unit scale with the card's real width, and the small card stays within its slot.
- Sensor Card: in the small size the value is always shown with one decimal (`xx.x`) and the decimals option is removed from the editor at that size (`decimals` is ignored; in medium and large it works as before).
- Sensor Card: the small card no longer stretches to fill its 2 grid rows: it measures what its content needs (≈ 90 px without subtitle, ≈ 103 px with it, previously 120 px) and its inner padding is smaller.
- Sensor Card: more design tweaks. The small size now shows the subtitle (it used to hide it even when enabled) and groups icon, name, subtitle and value centered, with no gap between the name and the number. In medium and large the digits are smaller to give the graph more width. Large becomes 12×2: header on top and, below, the value and threshold label on the left and the graph on the right.
- Sensor Card: design tweaks after the fixed slot. Explicit line-heights on name, subtitle and label (HA inherited ~1.5, which fattened the header and squashed the graph); in narrow cards the medium size's icon and ⋮ menu shrink so the name fits on one line; and in small the icon goes on top with the name below at full width (it used to end up as "Te m…").
- Sensor Card: the graphs were drawn outside the card. The content height depended on the width (in narrow cards the ⋮ menu and the graph wrapped onto new lines) and HA reserved a smaller height. Each size now takes a fixed slot in the grid (small 3×2, medium 6×2, large 12×2, columns × rows, not resizable) and the layout height no longer changes with width: the menu doesn't wrap, the name takes at most two lines, and the value and graph share one row (the graph shrinks instead of wrapping). Anything that doesn't fit is clipped inside the card.
- Button Card: in narrow cards the sensor footer values were cut off with "…"
  ("21...."). Now the padding goes only between sensors, a slot no longer
  shrinks below its content and, if number and unit don't fit together, the
  unit is hidden first and only then is the number clipped. The vertical
  separator still doesn't touch the content.
- Thermostat Card: each size now takes a fixed slot in the HA grid and can't be resized: small 5×4, medium 8×5 and large 12×5 (columns × rows). In the editor, the "Normal" size is now called "Medium" (the YAML value is still `normal`).
- Lock Card: on iOS (HA app / WebKit) the halo already appeared drawn when the
  confirmation view opened, without the ring animation. Now the halo lights up
  first and the view appears 120 ms later, and the view's `backdrop-filter` is
  removed, as it causes problems with transitions in WebKit.
- Lock Card: the confirmation view no longer relies on a background or a blur
  to cover the card's content (with translucent glass themes, and on iOS, the
  text underneath showed through). While the view is open, the original
  content is hidden, without changing the card's size.

### Changed

- Lock Card: starting columns by size: large 12, medium 6 and compact 3 (previously 6, 6 and 4). They can be changed by hand from HA's "Layout" tab; the minimum is 4, 4 and 3. A card with `grid_options` saved in the YAML keeps its width.
- Thermostat Card: the card no longer turns off the second entity on its own
  when the mode changes from outside (the entity's dialog, another card,
  automations, voice…): it only sends service calls when the user interacts
  with it. The exclusion when picking the mode in the card itself is kept. To have it
  also for changes made outside the card, the documentation (main README and
  the card's) includes an example Home Assistant automation.
- Lock Card: `subtitle_type` now defaults to `none`, because the state is
  already shown at the top right (it used to be `state`; you can go back with
  `subtitle_type: state`). By default the card takes half a grid
  (`columns: 6`) and is taller.
- Lock Card: in Spanish, `unlocked` is shown as "Desbloqueada" (previously
  "Abierta", which was confused with the door being open) and `unlocking` as
  "Desbloqueando…". "Puerta abierta" is left only for `open`.
- Lock Card: the `jammed` state shows the error X (`mdi:close`) with the red
  halo, like a missing or unavailable entity and like the other cards; the
  subtitle still says "Jammed".
- Lock Card: the halo now follows the lock's state instead of a timed flash:
  it lights up when it opens, stays lit while it is open (also while closing)
  and goes off on reaching `locked`. All cards for the same entity show it at
  once and the "bounce" with slow locks disappears. When tapping an action
  that operates the lock (`toggle`, `call-service`) the halo lights up right
  away and waits for the state change (up to 6 s).
- Lock Card: the `door` icon is now `mdi:door-closed` and animates to
  `mdi:door-open` (the leaf swings on the left jamb).
- Lock Card: the garage icons (`garage_roller` and `garage_sliding`) move to
  the silhouette of `mdi:garage-variant` (solid roof and jambs, three slats),
  keeping the rolling and sliding animation.

## [1.2.0] - 2026-10-12

### Added

- **Neón Sensor Card** (`custom:neon-sensor-card`): read-only card for
  a `sensor` or `binary_sensor` entity (any other domain is rejected).
  Shows value, unit and status, with three sizes (`size`: small without a
  graph; medium and large with one, the latter at 12 columns) and a
  history graph with a vital-signs-monitor trace. The color effect
  (three-color `halo`, `single` or `normal`) applies only to the graph
  and the icon; the card's perimeter is set only by the optional
  thresholds (Low / OK / High, one color and one name per level) and
  looks normal without them. The status label under the value only
  appears with thresholds enabled and a rating: with no data there is
  no label, but the perimeter keeps its color. No sensor footer. Visual editor.
- Custom subtitle (`subtitle`) on the Neón Sensor Card, with a field in
  the visual editor: if missing or blank, "Sensor" or "Binary sensor"
  is shown. With `show_subtitle: false` ("Show subtitle" checkbox in the
  editor) no subtitle is shown.
- `src/ha/history.ts` (`fetchHistory`, `parseHistory`) and an optional
  `callWS` on `HomeAssistant`, documented in the API reference.
- `sensor` profile in `npm run perf` and new tests for status, colors,
  the trace and history.
- Sensor card README, a section in the main README, screenshots
  (`assets/screenshots/sensor`), a GIF (`assets/gifs/Sensor.gif`) and an
  entry in `examples/` (minimal and advanced YAML, screenshots, GIF and
  explanation), in Spanish and English.

### Changed

- In the documentation and in the card descriptions (Entity, Button and
  Thermostat), the border effect is renamed "halo". The thermostat's
  semicircular dial keeps being called "ring" and the code's technical
  names (`neon-ring-*`, `RingSizeController`) do not change.
- The Spanish API reference includes the "Constants and types" table of
  `info.ts`, which was only in English. The `src/cards` and `src/ha`
  READMEs now list the thermostat, the sensor and history reading.
- The Neón Sensor Card splits its `render()` into per-area methods
  (agreement nº7); the resulting DOM is identical.

## [1.1.0] - 2026-10-08

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

- Button Card: in narrow cards the values in the sensor footer were cut off
  with "…" ("21...."). Padding now goes only between sensors, a slot no longer
  shrinks below its content and, when number and unit do not fit together, the
  unit is hidden first and only then is the number clipped. The vertical
  separator still never touches the content.
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
