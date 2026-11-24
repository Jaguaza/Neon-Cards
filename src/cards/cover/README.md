# src/cards/cover

🇪🇸 Español (esta sección) · 🇬🇧 [English below](#srccardscover-english)

`custom:neon-cover-card` — tarjeta para entidades `cover` de Home Assistant:
persianas, persianas venecianas, cortinas, toldos… El **icono** sigue al tipo de
cover es **grande y se mueve con la persiana**: sube y baja según el porcentaje de
apertura y, en una veneciana, gira las lamas con la inclinación. El
**porcentaje** se ve y se fija con un dial en arco y un deslizador, las
**venecianas** tienen un segundo deslizador para la inclinación de las lamas y
el pie tiene tres botones que **abren, paran y cierran**. Hay dos tipos más,
**binarios**, para una pantalla de proyector y una TV en un mueble: solo abiertos
o cerrados, sin porcentaje. Lleva el halo neón de
la familia Neón Cards.

Por ahora solo existe el **tamaño grande**.

## Diseño

- **Zona principal:** a la izquierda, el icono grande. A su derecha, el nombre,
  el estado con un punto de color y los tres puntos que abren «más
  información», y debajo «Posición actual» con el porcentaje y el dial en arco
  con su punto.
- **Posición:** el deslizador de 0 a 100 %, fino, con sus extremos.
- **Inclinación** (solo si la entidad la soporta): otro deslizador bajo el de
  posición, con su título y su porcentaje.
- **Pie:** los botones Cerrar, Parar y Abrir en columnas iguales con un
  divisor vertical entre ellas, como el pie de sensores de la Thermostat.

### El icono

Es un dibujo propio que se mueve con la entidad, con las mismas variables que
el porcentaje y la inclinación (también mientras los arrastras):

| `cover_type` | Icono |
|---|---|
| `shutter` (por defecto) | **Persiana enrollable.** Cajón arriba, guías a los lados y el cortinaje de lamas, que sube hacia el cajón al abrirse: cerrada tapa toda la ventana y abierta del todo solo asoma el último tramo. |
| `blind` | **Veneciana.** Las lamas se recogen contra el cabezal al abrirse y giran hasta quedar de canto con la inclinación (`current_tilt_position`). |
| `curtain` | **Cortina.** La barra con remates arriba y dos paneles de cuatro pliegues colgados de anillas. Al abrirse, los pliegues de cada panel se estrechan y se recogen hacia su lado, amontonados, y aparece la alzapaño que los ata; cerrada, los dos paneles se juntan en el centro y tapan la ventana. |
| `awning` | **Toldo.** El cajón arriba y la lona de rayas, opaca, que se despliega hacia abajo con su volante festoneado al abrirse y tapa la ventana de detrás; recogido solo asoma un palmo de lona. |
| `projector` | **Pantalla de proyector.** El cajón arriba, bajo y de esquinas casi rectas, y el lienzo claro, que baja desde él con su barra de abajo; abierta del todo se proyecta un «play». **Binaria:** solo abierta o cerrada. |
| `tv` | **TV en mueble.** Un mueble bajo con dos puertas y, dentro, una pantalla de TV, sin peana ni soporte, que sube desde el interior y asoma sobre el mueble; cerrada queda escondida. Abierta del todo se proyecta un «play». **Binaria:** solo abierta o cerrada. |
| sin `cover_type` o con otro valor | Persiana enrollable. El dibujo **no se deduce** del `device_class` de la entidad: se elige siempre a mano. |

La ventana que queda a la vista al abrirse se dibuja como tal, con marco,
cristal y crucetas, en los cuatro tipos. Sin `current_position`, el dibujo se ve
abierto del todo o cerrado según el estado. Con `prefers-reduced-motion` el dibujo cambia sin animación.

**Elegir el tipo.** `cover_type` (`shutter`, `blind`, `curtain`, `awning`,
`projector` o `tv`) fija el dibujo, sea cual sea el `device_class` de la
entidad; sin él es una persiana enrollable (`shutter`). En el editor visual es
el selector «Tipo de persiana», con una ficha por dibujo y sin opción
automática; la persiana viene marcada por defecto y no se guarda en la config.

**Tema claro.** Con el tema de Home Assistant claro y la persiana abierta, el
color neón apenas contrasta con el fondo y el resplandor difuminaría el trazo
fino del dibujo: igual que el resto de iconos de la colección, conserva el color
y se define con un contorno fino oscuro del mismo tono. En el tema oscuro no
cambia nada.

### Colores según el estado

- **Halo, icono, porcentaje, dial y deslizadores** usan el color 1 de la
  paleta (`neon_palette`) mientras la persiana está abierta, abriéndose o
  cerrándose; con la persiana cerrada se ven en blanco y sin halo.
- **El punto de estado** es verde con la persiana abierta, ámbar (y parpadea)
  mientras se mueve, gris cerrada y rojo no disponible. Cada grupo se puede
  cambiar con `status_color_open`, `status_color_moving`, `status_color_closed`
  y `status_color_alert` (cualquier color CSS: hex, `rgb()`/`hsl()`, nombre o
  `var(--x)`); uno inválido se ignora.
- **El icono grande** sigue al halo, como hasta ahora, salvo que se fije
  `icon_color`: entonces es siempre de ese color, también con la persiana
  cerrada. Solo cambia el icono; el porcentaje, el dial y los deslizadores
  siguen con el color del halo.
- Los botones del pie **se iluminan solo mientras se pulsan** (fondo y brillo en
  el icono) y se apagan al soltar; no guardan ningún resaltado según el estado.

En el editor visual, la sección «Colores» tiene un selector para el icono y uno
por estado, y «Restablecer colores» los quita todos de una vez.

### Lo que sale según la entidad

La tarjeta lee `supported_features` y `current_position` (con
[`getCoverState`](../../ha/cover.ts)) y solo pinta lo que la entidad soporta:

| Elemento | Sale si… |
|---|---|
| Botón Abrir / Cerrar / Parar | la entidad soporta abrir / cerrar / parar |
| Porcentaje, dial y deslizador de posición | la entidad informa de `current_position` |
| …y se pueden mover | además soporta fijar posición; si no, se ven pero desactivados |
| Deslizador de inclinación | soporta fijar inclinación y informa de `current_tilt_position` |

**Tipos binarios.** Con `cover_type: projector` o `tv` la tarjeta no pinta el
porcentaje, el dial ni los deslizadores (aunque la entidad informe de
`current_position` o de inclinación): solo el icono, el nombre con el estado y
el pie de botones. El icono se anima entre cerrado y abierto: sigue a
`current_position` si la entidad lo informa y, si no, va al estado de destino
(abierta o abriéndose, abierto; cerrada o cerrándose, cerrado).

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
| `header-view.ts`, `position-view.ts`, `controls-view.ts` | Cabecera, posición con sus deslizadores y pie de botones |
| `cover-glyph.ts` | Los dibujos de la persiana enrollable, la veneciana, la cortina, el toldo, la pantalla de proyector y la TV en mueble |
| `cover-visual.ts` | Qué dibujo lleva el cover, apertura, grupo de estado, halo y colores elegidos |
| `constants.ts`, `types.ts` | Iconos, colores del punto de estado y configuración |
| `*.styles.ts` | Estilos divididos (carcasa y cabecera, dibujo, cuerpo, pie de botones) |
| `translations/` | Textos en español e inglés |
| `neon-cover-card-editor.ts` | Editor visual: entidad, nombre, tipo de cover, colores y halo |

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

- **Main area:** on the left, the large icon. On its right, the name, the state
  with a colored dot and the three dots that open "more info", and below them
  "Current position" with the percentage and the arc dial with its dot.
- **Position:** the thin 0 to 100 % slider, with its ends.
- **Tilt** (only if the entity supports it): another slider under the position
  one, with its title and its percentage.
- **Footer:** the Close, Stop and Open buttons in equal columns with a vertical
  divider between them, like the Thermostat's sensor footer.

### The icon

It is a custom drawing that moves with the entity, driven by the same values as
the percentage and the tilt (also while you drag them):

| `cover_type` | Icon |
|---|---|
| `shutter` (default) | **Rolling shutter.** Box on top, guides at the sides and the slatted curtain, which rises into the box as it opens: closed it covers the whole window and fully open only its last stretch shows. |
| `blind` | **Venetian blind.** The slats gather against the head rail as it opens and turn edge-on with the tilt (`current_tilt_position`). |
| `curtain` | **Curtain.** The rod with finials on top and two panels of four pleats hung from rings. As it opens, the pleats of each panel narrow and gather toward their own side, bunched up, and the tieback that holds them appears; closed, the two panels meet in the middle and cover the window. |
| `awning` | **Awning.** The box on top and the striped canvas, opaque, which unrolls downward with its scalloped valance as it opens and covers the window behind it; retracted, only a hand's width of canvas shows. |
| `projector` | **Projector screen.** The case on top, low and with almost square corners, and the light canvas, which lowers from it with its bottom bar; fully open, a \"play\" is projected. **Binary:** only open or closed. |
| `tv` | **TV cabinet.** A low cabinet with two doors and, inside it, a TV screen, with no base or stand, that rises from the inside and shows above the cabinet; closed, it is hidden. Fully open, a \"play\" is projected. **Binary:** only open or closed. |
| no `cover_type`, or another value | Rolling shutter. The drawing is **not deduced** from the entity's `device_class`: it is always chosen by hand. |

The window that shows when it opens is drawn as a real one, with frame, glass
and mullions, in the four types. Without `current_position` the drawing shows
fully open or closed depending on the state. With `prefers-reduced-motion` the drawing changes without animation.

**Choosing the type.** `cover_type` (`shutter`, `blind`, `curtain`, `awning`,
`projector` or `tv`) sets the drawing, whatever the entity's `device_class` is;
without it the card draws a rolling shutter (`shutter`). In the visual editor
it is the "Cover type" selector, with one tile per drawing and no automatic
option; the shutter comes selected by default and is not saved in the config.

**Light theme.** With a light Home Assistant theme and the cover open, the neon
color barely contrasts with the background and the glow would blur the thin
lines of the drawing: like the rest of the icons in the collection, it keeps the
color and is defined by a thin dark outline of the same tone. In the dark theme
nothing changes.

### Colors by state

- **Halo, icon, percentage, dial and sliders** use color 1 of the palette
  (`neon_palette`) while the cover is open, opening or closing; closed, they
  are white and there is no halo.
- **The state dot** is green when open, amber (and blinking) while moving, grey
  when closed and red when unavailable. Each group can be changed with
  `status_color_open`, `status_color_moving`, `status_color_closed` and
  `status_color_alert` (any CSS color: hex, `rgb()`/`hsl()`, a name or
  `var(--x)`); an invalid one is ignored.
- **The large icon** follows the halo, as before, unless `icon_color` is set:
  then it is always that color, also when the cover is closed. Only the icon
  changes; the percentage, the dial and the sliders keep the halo color.
- The footer buttons **light up only while they are pressed** (background and a
  glow on the icon) and go off on release; they keep no highlight depending on
  the state.

In the visual editor, the "Colors" section has one picker for the icon and one
per state, and "Reset colors" removes them all at once.

### What shows up depending on the entity

The card reads `supported_features` and `current_position` (with
[`getCoverState`](../../ha/cover.ts)) and only draws what the entity supports:

| Element | Shown if… |
|---|---|
| Open / Close / Stop button | the entity supports open / close / stop |
| Percentage, dial and position slider | the entity reports `current_position` |
| …and they can be moved | it also supports setting the position; otherwise they are shown but disabled |
| Tilt slider | it supports setting the tilt and reports `current_tilt_position` |

**Binary types.** With `cover_type: projector` or `tv` the card draws no
percentage, dial or sliders (even if the entity reports `current_position` or
tilt): just the icon, the name with the state and the button footer. The icon
animates between closed and open: it follows `current_position` if the entity
reports it and otherwise heads to the target state (open or opening, open;
closed or closing, closed).

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
| `header-view.ts`, `position-view.ts`, `controls-view.ts` | Header, position with its sliders, and button footer |
| `cover-glyph.ts` | The rolling shutter, venetian blind, curtain, awning, projector screen and TV cabinet drawings |
| `cover-visual.ts` | Which drawing the cover gets, opening, state group, halo and chosen colors |
| `constants.ts`, `types.ts` | Icons, state dot colors and configuration |
| `*.styles.ts` | Split styles (shell and header, drawing, body, button footer) |
| `translations/` | Spanish and English texts |
| `neon-cover-card-editor.ts` | Visual editor: entity, name, cover type, colors and halo |
