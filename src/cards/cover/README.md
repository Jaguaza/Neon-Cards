# src/cards/cover

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardscover-english)

`custom:neon-cover-card` — tarjeta para entidades `cover` de Home Assistant:
persianas, persianas venecianas, cortinas, toldos… El **icono** sigue al tipo de
cover y a su estado, el **porcentaje de apertura** se ve y se fija con un dial
en arco y un deslizador, las **venecianas** tienen un segundo deslizador para la
inclinación de las lamas y tres botones **abren, paran y cierran**. Lleva el
halo neón de la familia Neón Cards y, como la Thermostat, no tiene pie de
sensores.

Por ahora solo existe el **tamaño grande**.

## Diseño

- **Cabecera:** el icono en una caja redondeada, el nombre, el estado con un
  punto de color y, a la derecha, los tres puntos que abren «más información».
- **Posición:** «Posición actual» con el porcentaje en grande y, a su derecha,
  el dial en arco con su punto. Debajo, el deslizador de 0 a 100 %.
- **Inclinación** (solo si la entidad la soporta): otro deslizador bajo el de
  posición, con su título y su porcentaje.
- **Botones:** una línea de neón y los botones Cerrar, Parar y Abrir.

### El icono

Es el que Home Assistant usa para cada `device_class`, abierto mientras la
persiana está abierta o en movimiento y cerrado cuando llega a cerrada o no está
disponible:

| `device_class` | Abierta | Cerrada |
|---|---|---|
| `shutter` | `mdi:window-shutter-open` | `mdi:window-shutter` |
| `blind` | `mdi:blinds-horizontal` | `mdi:blinds-horizontal-closed` |
| `curtain` | `mdi:curtains` | `mdi:curtains-closed` |
| `shade` | `mdi:roller-shade` | `mdi:roller-shade-closed` |
| `awning` | `mdi:awning-outline` | `mdi:awning-outline` |
| `garage` | `mdi:garage-open` | `mdi:garage` |
| `gate` | `mdi:gate-open` | `mdi:gate` |
| `door` | `mdi:door-open` | `mdi:door-closed` |
| `window` | `mdi:window-open` | `mdi:window-closed` |
| `damper` | `mdi:valve-open` | `mdi:valve-closed` |
| otro o ninguno | `mdi:window-open` | `mdi:window-closed` |

### Colores según el estado

- **Halo, icono, porcentaje, dial, deslizadores y botones** usan el color 1 de
  la paleta (`neon_palette`) mientras la persiana está abierta, abriéndose o
  cerrándose; con la persiana cerrada se ven en blanco y sin halo.
- **El punto de estado** es verde con la persiana abierta, ámbar (y parpadea)
  mientras se mueve, gris cerrada y rojo no disponible.
- Un botón se resalta cuando la persiana está ahí o va hacia ahí: **Abrir**
  abierta o abriéndose, **Cerrar** cerrada o cerrándose.

### Lo que sale según la entidad

La tarjeta lee `supported_features` y `current_position` (con
[`getCoverState`](../../ha/cover.ts)) y solo pinta lo que la entidad soporta:

| Elemento | Sale si… |
|---|---|
| Botón Abrir / Cerrar / Parar | la entidad soporta abrir / cerrar / parar |
| Porcentaje, dial y deslizador de posición | la entidad informa de `current_position` |
| …y se pueden mover | además soporta fijar posición; si no, se ven pero desactivados |
| Deslizador de inclinación | soporta fijar inclinación y informa de `current_tilt_position` |

Con la entidad no disponible, los botones y los deslizadores se desactivan.
Estos elementos dependen de la entidad y no de su estado: **la tarjeta no
cambia de alto** al abrirse, cerrarse o moverse la persiana.

## Mover la persiana

| Gesto | Servicio |
|---|---|
| Botón Abrir / Parar / Cerrar | `cover.open_cover` / `cover.stop_cover` / `cover.close_cover` |
| Arrastrar el dial o el deslizador de posición | `cover.set_cover_position` con `position` (0–100), al soltar |
| Arrastrar el deslizador de inclinación | `cover.set_cover_tilt_position` con `tilt_position` (0–100), al soltar |
| Tres puntos | Abre «más información» de la entidad |

Mientras se arrastra, el porcentaje y el punto siguen al dedo y la orden sale
solo al soltar. Dial y deslizador de posición están enlazados. La tarjeta no
tiene `tap_action` ni gestos de pulsación: los botones y los tres puntos son su
interacción.

## Tamaño en la rejilla

`getGridOptions()` devuelve alto automático y 12 columnas de inicio (mínimo 4).
`getCardSize()` devuelve `5`.

## Estructura de la carpeta

| Archivo | Qué hace |
|---|---|
| `neon-cover-card.ts` | La tarjeta: lee el cover, arrastre del dial y órdenes |
| `header-view.ts`, `position-view.ts`, `controls-view.ts` | Cabecera, posición con sus deslizadores y botones |
| `cover-visual.ts` | Icono, grupo de estado y halo según el cover |
| `constants.ts`, `types.ts` | Iconos, colores del punto de estado y configuración |
| `*.styles.ts` | Estilos divididos (carcasa y cabecera, cuerpo, botones, editor) |
| `translations/` | Textos en español e inglés |
| `neon-cover-card-editor.ts` | Editor visual: entidad, nombre y halo |

---

<a id="srccardscover-english"></a>

# src/cards/cover (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardscover)

`custom:neon-cover-card` — a card for Home Assistant `cover` entities:
shutters, venetian blinds, curtains, awnings… The **icon** follows the cover
type and its state, the **opening percentage** is shown and set with an arc dial
and a slider, **venetian blinds** get a second slider for the slat tilt, and
three buttons **open, stop and close**. It has the neon halo of the Neón Cards
family and, like the Thermostat, no sensor footer.

For now only the **large size** exists.

## Design

- **Header:** the icon in a rounded box, the name, the state with a colored dot
  and, on the right, the three dots that open "more info".
- **Position:** "Current position" with the big percentage and, on its right,
  the arc dial with its dot. Below it, the 0 to 100 % slider.
- **Tilt** (only if the entity supports it): another slider under the position
  one, with its title and its percentage.
- **Buttons:** a neon line and the Close, Stop and Open buttons.

### The icon

It is the one Home Assistant uses for each `device_class`, open while the cover
is open or moving and closed once it is closed or unavailable:

| `device_class` | Open | Closed |
|---|---|---|
| `shutter` | `mdi:window-shutter-open` | `mdi:window-shutter` |
| `blind` | `mdi:blinds-horizontal` | `mdi:blinds-horizontal-closed` |
| `curtain` | `mdi:curtains` | `mdi:curtains-closed` |
| `shade` | `mdi:roller-shade` | `mdi:roller-shade-closed` |
| `awning` | `mdi:awning-outline` | `mdi:awning-outline` |
| `garage` | `mdi:garage-open` | `mdi:garage` |
| `gate` | `mdi:gate-open` | `mdi:gate` |
| `door` | `mdi:door-open` | `mdi:door-closed` |
| `window` | `mdi:window-open` | `mdi:window-closed` |
| `damper` | `mdi:valve-open` | `mdi:valve-closed` |
| other or none | `mdi:window-open` | `mdi:window-closed` |

### Colors by state

- **Halo, icon, percentage, dial, sliders and buttons** use color 1 of the
  palette (`neon_palette`) while the cover is open, opening or closing; closed,
  they are white and there is no halo.
- **The state dot** is green when open, amber (and blinking) while moving, grey
  when closed and red when unavailable.
- A button is highlighted when the cover is there or heading there: **Open**
  when open or opening, **Close** when closed or closing.

### What shows up depending on the entity

The card reads `supported_features` and `current_position` (with
[`getCoverState`](../../ha/cover.ts)) and only draws what the entity supports:

| Element | Shown if… |
|---|---|
| Open / Close / Stop button | the entity supports open / close / stop |
| Percentage, dial and position slider | the entity reports `current_position` |
| …and they can be moved | it also supports setting the position; otherwise they are shown but disabled |
| Tilt slider | it supports setting the tilt and reports `current_tilt_position` |

With the entity unavailable, the buttons and sliders are disabled. These
elements depend on the entity and not on its state: **the card does not change
height** when the cover opens, closes or moves.

## Moving the cover

| Gesture | Service |
|---|---|
| Open / Stop / Close button | `cover.open_cover` / `cover.stop_cover` / `cover.close_cover` |
| Dragging the dial or the position slider | `cover.set_cover_position` with `position` (0–100), on release |
| Dragging the tilt slider | `cover.set_cover_tilt_position` with `tilt_position` (0–100), on release |
| Three dots | Opens the entity's "more info" |

While dragging, the percentage and the dot follow the finger and the command is
sent only on release. The dial and the position slider are linked. The card has
no `tap_action` or press gestures: the buttons and the three dots are its
interaction.

## Size in the grid

`getGridOptions()` returns automatic height and 12 starting columns (minimum
4). `getCardSize()` returns `5`.

## Folder layout

| File | What it does |
|---|---|
| `neon-cover-card.ts` | The card: reads the cover, dial dragging and commands |
| `header-view.ts`, `position-view.ts`, `controls-view.ts` | Header, position with its sliders, and buttons |
| `cover-visual.ts` | Icon, state group and halo from the cover |
| `constants.ts`, `types.ts` | Icons, state dot colors and configuration |
| `*.styles.ts` | Split styles (shell and header, body, buttons, editor) |
| `translations/` | Spanish and English texts |
| `neon-cover-card-editor.ts` | Visual editor: entity, name and halo |
