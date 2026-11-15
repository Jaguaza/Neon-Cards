# src/cards/light

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardslight-english)

`custom:neon-light-card` — tarjeta para entidades `light` de Home Assistant,
también grupos de luces. El **icono**, el que sea, se enciende **de abajo
arriba** hasta el brillo de la luz y con su color real, y el halo neón de la
familia Neón Cards se enciende con la luz. En el tamaño grande, un **pie con un
icono por función** (brillo, temperatura de color, color, colores favoritos y
efectos) despliega su control en el propio pie, sin que la tarjeta cambie de
alto.

## Diseño

- **Arriba:** el icono y, debajo, el nombre con el subtítulo.
- **Abajo (tamaño grande):** una línea de neón y el pie con los iconos de las
  funciones que soporta la luz.

### El icono

- Es un contorno **blanco con el interior transparente**, y encima el relleno
  de color, recortado desde abajo. Apagada solo se ve el contorno; encendida,
  el relleno sube hasta el **porcentaje de brillo** (animado, 600 ms). Una luz
  que solo enciende y apaga se llena entera. Con brillo muy bajo se ve al menos
  un 6 %.
- Funciona con **cualquier icono** (`icon:`, el de la entidad o, si no hay,
  `mdi:lightbulb`).
- El relleno toma el **color real de la luz** (`rgb_color`, o `hs_color` si no
  lo informa): verde si la luz está en verde, azul si está en azul. Mientras
  arrastras la barra de color o la de temperatura, el icono se tiñe en directo.
  Una luz sin color (solo brillo) o apagada usa la paleta neón.
- Con `prefers-reduced-motion` no hay animación.

### Halo

El halo usa **siempre la paleta del editor** (no sigue el color de la luz). Se
enciende mientras la luz está encendida; no disponible o sin entidad se ve el
halo rojo de alerta. Si usas un control con la luz apagada, el halo se enciende
ya y espera el cambio de estado (hasta 6 s).

### Estado y subtítulo (`subtitle_type`)

`custom` (por defecto, texto libre en `subtitle`), `state`, `name`,
`last-changed` o `last-updated`. `state` muestra «Encendida · 70%», «Apagada» o
«No disponible»; en un **grupo de luces** añade cuántas están encendidas
(«Encendida · 100% · 2 de 3 encendidas»).

### Tamaños (`size`)

| `size` | Contenido | Columnas |
|---|---|---|
| `large` (por defecto), «Grande - Mediana» | Icono, nombre, subtítulo y pie. El pie se adapta al ancho (ver [Carrusel](#carrusel-según-el-ancho)), así que cubre también el ancho mediano | empieza a 12, se reduce hasta 4 |
| `compact`, «Compacta - Mediana» | Una fila: el icono a la izquierda y, a su lado, el nombre y el subtítulo. Sin pie | empieza a 6, solo se ajusta entre 6 y 3 |

El alto es automático. La compacta, con muy poco ancho (menos de ~110 px
útiles, p. ej. 3 columnas en una sección estrecha), pone el nombre y el
subtítulo debajo del icono para que quepan.

## El pie (tamaño grande)

Cada icono sale solo si la luz soporta esa función:

| Icono | Sale si… | Control | Servicio |
|---|---|---|---|
| Brillo | algún modo de color distinto de `onoff` | Barra de 1 a 100 % | `light.turn_on` con `brightness_pct` |
| Temperatura de color | `color_temp` | Barra en kelvin, de cálido a frío, con el rango de la luz (`min_color_temp_kelvin` y `max_color_temp_kelvin`; sin ellos, 2000–6500 K) | `color_temp_kelvin` |
| Color | `hs`, `xy`, `rgb`, `rgbw` o `rgbww` | Franja de tonos de 0 a 360° | `hs_color` |
| Favoritos (estrella) | la luz admite color y hay `favorite_colors` | Hasta cinco muestras de color | `rgb_color` |
| Efectos | la luz declara `effect_list` | Lista flotante con los efectos | `effect` |

- Al pulsar un icono su control ocupa el pie; el botón de cerrar lo devuelve.
  El alto de la tarjeta no cambia nunca: la lista de efectos flota sobre la
  tarjeta.
- Las barras mandan la orden **al soltar**, no mientras arrastras. Mientras
  arrastras el brillo, el icono se rellena según la barra.
- Con la luz **apagada**, usar un control la enciende con ese valor.
- **Color:** si la luz ya está en un modo de color con un color de verdad
  (saturación del 50 % o más), la barra conserva su saturación; en blanco o en
  temperatura de color usa la saturación completa, para que elegir un tono se
  note.
- **Favoritos:** un toque en una muestra pone la luz de ese color. La muestra
  del color que tiene ahora la luz se marca con un aro, y el pie sigue abierto
  para probar otro.
- El pie y sus controles no disparan la acción de la tarjeta.
- Una luz que solo enciende y apaga, o no disponible, no tiene pie.

### Carrusel según el ancho

Cuántos iconos se ven a la vez depende de las **columnas** que ocupa la tarjeta
en la rejilla de secciones de Home Assistant:

| Columnas | Iconos a la vez |
|---|---|
| 12 o más | todos, sin flecha |
| 9 a 11 | 3 |
| 6 a 8 | 2 |
| 4 a 5 | 1 |

Cuando no caben todos aparece una **flecha** al final del pie: cada pulsación
desliza las opciones de una en una, y tras la última vuelve a la primera. En
una sección ensanchada (24, 36… columnas) se cuentan las columnas reales de
Home Assistant: 8 columnas son 8. Fuera de una vista de secciones (masonry,
panel, vista previa del editor) la tarjeta no puede saber las columnas y usa el
ancho en píxeles (unos 96 px por icono).

### Opciones del pie y favoritos

- **`footer_options`** — qué opciones quieres en el pie
  (`brightness`, `color_temp`, `color`, `favorites`, `effects`). Sin esta
  clave, todas las que la luz soporte; con ella, solo las indicadas. En el
  editor, una casilla por opción.
- **`favorite_colors`** — hasta cinco colores en hexadecimal (`#rrggbb`). El
  editor ofrece un selector de color por favorito y «Añadir color».

El editor tiene un selector de **Tamaño**. Con la compacta no hay pie, así que
la sección «Pie de la tarjeta» no sale; los valores que ya tuvieras guardados
se conservan por si vuelves a la grande.

## Pulsar

`tap_action` es `toggle` por defecto, `hold_action` abre «más información» y
`double_tap_action` no hace nada.

## Estructura de la carpeta

| Archivo | Qué hace |
|---|---|
| `neon-light-card.ts` | La tarjeta (render, gestos y órdenes a la luz) |
| `light-state.ts` | Funciones que soporta la luz, brillo, temperatura, color, grupos y opciones del pie |
| `light-commands.ts` | Las órdenes de `light.turn_on` |
| `light-text.ts` | El texto de estado («Encendida · 70%») |
| `light-color.ts` | El color del icono (real, de la temperatura o de la barra que se arrastra) |
| `favorites.ts` | Lectura y comparación de los colores favoritos |
| `footer-carousel.ts` | Cuántos iconos caben y la ventana del carrusel |
| `grid-columns.ts` | Columnas que ocupa la tarjeta en la rejilla de Home Assistant |
| `light-icon.ts`, `footer-view.ts`, `effects-view.ts` | El icono que se enciende de abajo arriba, el pie y la lista de efectos |
| `footer-editor.ts` | Opciones del pie y favoritos del editor |
| `numbers.ts` | `isNumber` y `clamp` |
| `*.styles.ts` | Estilos divididos (tarjeta, tamaños, pie, vistas, icono, editor) |
| `translations/` | Textos en español e inglés |
| `neon-light-card-editor.ts` | Editor visual |

---

<a id="srccardslight-english"></a>

# src/cards/light (English)

🇬🇧 English (this section) · 🇪🇸 [Español arriba](#srccardslight)

`custom:neon-light-card` — card for Home Assistant `light` entities, light
groups included. The **icon**, whichever it is, lights up **from the bottom to
the top** to the light's brightness and in the light's real color, and the neon
halo of the Neón Cards family turns on with the light. In the large size, a
**footer with one icon per function** (brightness, color temperature, color,
favorite colors and effects) opens its control in the footer itself, without the
card changing height.

## Design

- **Top:** the icon and, below it, the name with the subtitle.
- **Bottom (large size):** a neon line and the footer with the icons of the
  functions the light supports.

### The icon

- It is a **white outline with a transparent inside**, and over it the colored
  fill, clipped from the bottom. Off, only the outline shows; on, the fill rises
  to the **brightness percentage** (animated, 600 ms). A light that only turns
  on and off fills completely. With very low brightness at least 6 % shows.
- It works with **any icon** (`icon:`, the entity's, or `mdi:lightbulb` if there
  is none).
- The fill takes the light's **real color** (`rgb_color`, or `hs_color` if that
  is not reported): green if the light is green, blue if it is blue. While you
  drag the color or temperature bar, the icon is tinted live. A light with no
  color (brightness only) or an off light uses the neon palette.
- With `prefers-reduced-motion` there is no animation.

### Halo

The halo **always uses the editor's palette** (it does not follow the light's
color). It turns on while the light is on; unavailable or without an entity you
get the red alert halo. If you use a control while the light is off, the halo
turns on right away and waits for the state to change (up to 6 s).

### State and subtitle (`subtitle_type`)

`custom` (default, free text in `subtitle`), `state`, `name`, `last-changed` or
`last-updated`. `state` shows "On · 70%", "Off" or "Unavailable"; in a **light
group** it adds how many are on ("On · 100% · 2 of 3 on").

### Sizes (`size`)

| `size` | Content | Columns |
|---|---|---|
| `large` (default), "Large - Medium" | Icon, name, subtitle and footer. The footer adapts to the width (see [Carousel](#carousel-by-width)), so it also covers the medium width | starts at 12, shrinks down to 4 |
| `compact`, "Compact - Medium" | One row: the icon on the left and, next to it, the name and the subtitle. No footer | starts at 6, only adjustable between 6 and 3 |

Height is automatic. The compact card, with very little width (under ~110 px of
usable width, e.g. 3 columns in a narrow section), puts the name and the
subtitle below the icon so they fit.

## The footer (large size)

Each icon only shows if the light supports that function:

| Icon | Shows if… | Control | Service |
|---|---|---|---|
| Brightness | any color mode other than `onoff` | 1 to 100 % bar | `light.turn_on` with `brightness_pct` |
| Color temperature | `color_temp` | Bar in kelvin, warm to cool, with the light's range (`min_color_temp_kelvin` and `max_color_temp_kelvin`; without them, 2000–6500 K) | `color_temp_kelvin` |
| Color | `hs`, `xy`, `rgb`, `rgbw` or `rgbww` | Hue strip from 0 to 360° | `hs_color` |
| Favorites (star) | the light supports color and there is `favorite_colors` | Up to five color swatches | `rgb_color` |
| Effects | the light declares `effect_list` | Floating list of effects | `effect` |

- Tapping an icon puts its control in the footer; the close button brings the
  icons back. The card height never changes: the effects list floats over the
  card.
- The bars send the command **on release**, not while you drag. While you drag
  brightness, the icon fills according to the bar.
- With the light **off**, using a control turns it on with that value.
- **Color:** if the light is already in a color mode with a real color
  (saturation of 50 % or more), the bar keeps its saturation; in white or color
  temperature it uses full saturation, so that picking a hue is noticeable.
- **Favorites:** a tap on a swatch sets the light to that color. The swatch of
  the light's current color is marked with a ring, and the footer stays open to
  try another.
- The footer and its controls do not trigger the card's action.
- A light that only turns on and off, or an unavailable one, has no footer.

### Carousel by width

How many icons show at once depends on the **columns** the card takes in Home
Assistant's sections grid:

| Columns | Icons at once |
|---|---|
| 12 or more | all, no arrow |
| 9 to 11 | 3 |
| 6 to 8 | 2 |
| 4 to 5 | 1 |

When they do not all fit, an **arrow** appears at the end of the footer: each
press slides the options one at a time, and after the last it goes back to the
first. In a widened section (24, 36… columns) the real Home Assistant columns
are counted: 8 columns are 8. Outside a sections view (masonry, panel, the
editor preview) the card cannot know the columns and uses the width in pixels
(about 96 px per icon).

### Footer options and favorites

- **`footer_options`** — which options you want in the footer (`brightness`,
  `color_temp`, `color`, `favorites`, `effects`). Without this key, all the ones
  the light supports; with it, only the ones listed. In the editor, one checkbox
  per option.
- **`favorite_colors`** — up to five colors in hexadecimal (`#rrggbb`). The
  editor offers a color picker per favorite and "Add color".

The editor has a **Size** selector. With the compact card there is no footer, so
the "Card footer" section does not show; any values you already had saved are
kept in case you go back to the large one.

## Tapping

`tap_action` is `toggle` by default, `hold_action` opens "more info" and
`double_tap_action` does nothing.

## Folder layout

| File | What it does |
|---|---|
| `neon-light-card.ts` | The card (render, gestures and commands to the light) |
| `light-state.ts` | Supported functions, brightness, temperature, color, groups and footer options |
| `light-commands.ts` | The `light.turn_on` commands |
| `light-text.ts` | The state text ("On · 70%") |
| `light-color.ts` | The icon color (real, from the temperature or from the bar being dragged) |
| `favorites.ts` | Reading and comparing the favorite colors |
| `footer-carousel.ts` | How many icons fit and the carousel window |
| `grid-columns.ts` | Columns the card takes in Home Assistant's grid |
| `light-icon.ts`, `footer-view.ts`, `effects-view.ts` | The bottom-to-top icon, the footer and the effects list |
| `footer-editor.ts` | Footer options and favorites of the editor |
| `numbers.ts` | `isNumber` and `clamp` |
| `*.styles.ts` | Split styles (card, sizes, footer, views, icon, editor) |
| `translations/` | Spanish and English texts |
| `neon-light-card-editor.ts` | Visual editor |
