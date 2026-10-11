![Cabecera](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/branding/social-preview.png)

Colección de tarjetas personalizadas para Home Assistant con una estética moderna inspirada en el neón. Estas tarjetas toman automáticamente el radio de las esquinas, los colores internos y otros estilos del tema que tengas seleccionado, adaptándose a cualquier tema instalado en tu Home Assistant.

Collection of custom cards for Home Assistant with a modern neon‑inspired aesthetic. These cards automatically inherit the corner radius, internal colors, and other visual styles from the theme you have selected, adapting seamlessly to any theme installed in your Home Assistant.

## 🎬 Demo Neón Cards

### 🎬 Video explicativo / Explainer video

<p align="center">
  <a href="https://youtu.be/0MzlXAx52JY">
    <img src="https://img.youtube.com/vi/0MzlXAx52JY/hqdefault.jpg" width="350">
  </a>
</p>

<p align="center">
  <strong>Imagen de las tarjetas / Cards preview</strong>
</p>


<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/Neon%20Completa.jpg" width="450" style="margin-right:20px;">
</p>

---

## 📘 Selección de idioma / Language selection

👉 [Ir leeme en Español](#readme-es)  👉 [Go to readme in English](#readme-en)

---

# 🇪🇸 Español
<a name="readme-es"></a>

## ✨ Tarjetas incluidas

- 🪪**ENTITY.**  [Ir a Entity](#entity-card)
- 🚾**BUTTON.**  [Ir a Button](#button-card)
- 🌡 **TERMOSTATO.**  [Ir a Termostato](#termostato-card)
- 📈 **SENSOR.**  [Ir a Sensor](#sensor-card)

### 🔌 Características comunes

- **Se adaptan a tu tema:** toman el radio de las esquinas y los colores del tema activo.
- **Editor visual** en las cuatro tarjetas, sin necesidad de escribir YAML.
- **Interfaz de configuración en español e inglés**, según el idioma de tu Home Assistant.
- **Paletas neón** (Cyber Emerald, Cyberpunk Pink, Electric Blue, Sunset Amber, Toxic Purple o colores propios).
- **Tamaño automático** en el grid de Home Assistant: no hace falta indicar `grid_options`.


<a name="entity-card"></a>
### **🪪 Neón Entity Card**

Interruptor minimalista con animaciones SVG, paletas dinámicas y arquitectura modular.
<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/Entity%20completa.jpg" width="450" style="margin-right:20px;">
</p>

### **Paletas disponibles**

- **Cyber Emerald** *(Predeterminada)*  
  ![Neon Card - Cyber Emerald](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/1%20Ne%C3%B3n.jpg)

- **Cyberpunk Pink:** Rosa, Carmesí, Púrpura  
  ![Neon Card - Cyberpunk Pink](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/2%20Ne%C3%B3n.jpg)

- **Electric Blue:** Cian, Azul, Azul Oscuro  
  ![Neon Card - Electric Blue](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/3%20Ne%C3%B3n.jpg)

- **Sunset Amber:** Naranja, Amarillo, Rosa  
  ![Neon Card - Sunset Amber](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/4%20Ne%C3%B3n.jpg)

- **Toxic Purple:** Violeta, Púrpura, Azul  
  ![Neon Card - Toxic Purple](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/5%20Ne%C3%B3n.jpg)

- **Personalizado:** Elige tus propios colores.

### **Titulo y Subtitulo**
- **Titulo:** Incluye selector de: título personalizado, nombre de la entidad, etc.
- **Subtítulo:** Incluye selector de: Nombre, Último cambio, etc.

### **Una o varias entidades**
- **Una entidad:** con nombre personalizado opcional.
- **Varias entidades:** una lista `entities`, cada una con su propio nombre, repartidas en las columnas que indiques con `columns`.

### **Información, estado y orientación**
- **Texto principal y secundario:** nombre, estado, último cambio, última actualización o nada.
- **Punto de estado:** se puede mostrar u ocultar.
- **Orientación:** el interruptor a la izquierda o a la derecha.

### **Acciones**
Toque, mantener y doble toque configurables con las acciones estándar de Home Assistant (más información, alternar, navegar, abrir URL, llamar a un servicio, Assist o ninguna).

### **Configuración mínima**

```yaml
type: custom:neon-card-entity
entity: light.salon
```

  ---
<a name="button-card"></a>
### **🚾 Neón Button Card**

Botón minimalista con animaciones SVG, paletas dinámicas y arquitectura modular.
<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/button/Button%201.jpg" width="450" style="margin-right:20px;"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/button/Button%202.jpg" width="450" style="margin-right:20px;">
</p>

### **Paletas disponibles**

- **Cyber Emerald** *(Predeterminada)*  
- **Cyberpunk Pink:** Rosa, Carmesí, Púrpura  
- **Electric Blue:** Cian, Azul, Azul Oscuro  
- **Sunset Amber:** Naranja, Amarillo, Rosa  
- **Toxic Purple:** Violeta, Púrpura, Azul  
- **Personalizado:** Elige tus propios colores.

### **Titulo y Subtitulo**
- **Titulo:** Incluye selector de: título personalizado, nombre de la entidad, etc.
- **Subtítulo:** Incluye selector de: Nombre, Último cambio, etc.

### **Selector de sensores**
- **Sensor Libre:** Sensor que se encuentra justo debajo del subtítulo de la tarjeta.
- **Grupo Sensores:** Situados debajo del sensor libre y se puede añadir desde 1 hasta 3 sensores.
- **Iconos y decimales:** cada sensor puede tener su propio icono y el número de decimales con el que se muestra.

### **Entidad opcional**
La entidad principal es opcional: el botón sirve igual para navegar a otra vista, abrir un popup, ejecutar un script o representar una habitación sin estar ligado a un dominio concreto. Con entidad, el aro neón se anima cuando está activa.

### **Si la entidad falla**
Cuando la entidad configurada no existe o está *no disponible* o *desconocida*, el icono pasa a una ✕ neón para que lo notes al instante en el panel.

### **Acciones**
Toque, mantener y doble toque configurables con las acciones estándar de Home Assistant.

### **Configuración mínima**

```yaml
type: custom:neon-button-card
name: Salón
icon: mdi:sofa
```

---

<a name="termostato-card"></a>
### **🌡 Neón Termostato Card**

Termostato con dial neón arrastrable, color por modo y soporte para **una o dos entidades `climate`**: un único equipo, o dos separados (por ejemplo calefacción y aire acondicionado) funcionando como una sola tarjeta.


  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/termostato/thermostat-views.jpg" width="450"></p>
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/termostato/thermostat-views1.jpg" width="450"></p>

### **Tres vistas**

| Vista (`size`) | Qué muestra | Ancho en el grid |
|---|---|---|
| `large` | Temperatura actual a la izquierda y dial semicircular arrastrable a la derecha, con selectores de modo, preset y ventilador | 12 columnas |
| `normal` *(predeterminada)* | Aro semicircular arrastrable alrededor de la temperatura actual | 6 columnas |
| `compact` | Temperatura actual y píldora −/+, sin indicador gráfico ni sensores de pie | 4 columnas |

La consigna se ajusta arrastrando el dial o el aro (en `large` y `normal`) o con la píldora **−/+** (en las tres vistas). El salto lo marca `step`; si no lo indicas, se usa el de la entidad y, si no tiene, 0,5 °.


### **Modos y colores**

Cada modo HVAC tiene su color. Solo aparecen los modos que tu entidad expone en `hvac_modes`:

- **Calor:** naranja rojizo
- **Frío:** azul
- **Calor/Frío:** índigo
- **Auto:** verde
- **Seco:** magenta
- **Ventilador:** amarillo
- **Apagado:** el color neutro de tu tema

Puedes usar un único color para todos los modos o elegir el de cada uno (`color`, también desde el editor). El icono de la cabecera cambia solo según el modo.


### **Una o dos entidades**

Con `entity_2` la tarjeta junta dos equipos separados:

- El selector de modo muestra la **unión** de los modos de las dos entidades.
- Cada modo lo gestiona la primera entidad que lo soporta. Si los soportan las dos, `mode_owner` decide cuál.
- **Nunca trabajan a la vez en modos distintos:** al activar un modo en una, la otra se apaga sola.
- Arriba a la derecha hay un botón por entidad que abre su diálogo de más información.


### **Preset y ventilador (vista grande)**

En la vista `large`, junto al selector de modo aparecen otros dos **si la entidad los soporta**: uno de **preset** y otro de **ventilador**. Se reparten el ancho a partes iguales (1, 2 o 3 píldoras) y los nombres salen traducidos por Home Assistant. Si la entidad no tiene presets o modos de ventilador, esa píldora simplemente no aparece. No hay nada que configurar.

### **Aro del borde y paleta**

El aro neón del borde de la tarjeta **solo se enciende cuando el equipo está funcionando de verdad** (calentando o enfriando, según informe la entidad), no por el simple hecho de estar en un modo. Su paleta se elige con `neon_palette`, igual que en las otras tarjetas.

### **Sensores de pie**

Hasta 3 sensores bajo la tarjeta (temperatura, humedad, consumo…), cada uno con su icono y su estado. No se muestran en la vista compacta.


### **Configuración mínima**

```yaml
type: custom:neon-thermostat-card
entity: climate.salon
```

### **Dos equipos en una tarjeta**

```yaml
type: custom:neon-thermostat-card
entity: climate.calefaccion
entity_2: climate.aire_acondicionado
name: Salón
size: large
footer:
  - entity: sensor.salon_humidity
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Termostato%20Gif.gif" width="450"></p>

---

<a name="sensor-card"></a>
### **📈 Neón Sensor Card**

Tarjeta de solo lectura para **una** entidad `sensor` o `binary_sensor`: nombre, icono, valor con su unidad y un **gráfico del histórico** dibujado como el trazo de un monitor de constantes vitales. El gráfico se muestra en los tamaños mediano y grande (el pequeño no lo lleva); lo que eliges es su efecto de color. Los umbrales de estado son opcionales y son los que marcan el perímetro de la tarjeta. Cualquier otra entidad (`light`, `switch`, `climate`…) se rechaza.

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/sensor/Neon_Sensor_Cards.png" width="450"></p>

### **Título y subtítulo**

`name` es el título (por defecto, el nombre de la entidad) y `subtitle` el texto de debajo. Sin `subtitle` se muestra «Sensor» o «Sensor binario». Con `show_subtitle: false` (o desmarcando «Mostrar subtítulo» en el editor) no se muestra ningún subtítulo.

### **Tres tamaños**

| Tamaño (`size`) | Qué muestra | Ancho en el grid |
|---|---|---|
| `large` | Valor y gráfico, a todo el ancho | 12 columnas |
| `normal` *(predeterminado)* | Valor y gráfico, en lo más reducido en que caben juntos (si no caben, el gráfico pasa a su propia línea) | 6 columnas |
| `compact` | Nombre, valor, unidad y etiqueta, sin gráfico ni menú ⋮ | 3 columnas |

En ningún tamaño se corta nada fuera de la tarjeta: los textos se ajustan en varias líneas.

### **Efecto de color del gráfico**

Se elige con `neon_effect` y afecta al **gráfico y al icono**:

- **`halo`** *(predeterminado)*: el gráfico en los tres colores de la paleta (`neon_palette`, igual que en las otras tarjetas), cada uno en su tramo de la línea, con un resplandor de esos mismos colores y efecto de desplazamiento.
- **`single`**: un único color (`neon_color`) con el mismo efecto de desplazamiento.
- **`normal`**: el color de tu tema, sin desplazamiento ni resplandor.

### **Umbrales de estado (opcionales)**

Con `thresholds_enabled: true` la lectura se valora como **Bajo**, **Correcto** o **Alto** con dos números: por debajo de `threshold_low` es Bajo, por encima de `threshold_high` es Alto y entre ambos (límites incluidos) es Correcto. Por ejemplo, con 22 y 26: 21,9 es Bajo, 24 es Correcto y 26,1 es Alto.

- Cada nivel tiene su **color** (`threshold_colors`) y su **nombre** (`threshold_names`).
- El color del nivel marca el **perímetro de la tarjeta** (borde y resplandor) y la etiqueta de estado bajo el valor. El gráfico y el icono no cambian con el nivel.
- Sin umbrales no hay etiqueta y el perímetro se ve normal, sea cual sea el efecto de color.
- En un `binary_sensor`, `alert_state` indica qué estado es la alerta.

### **Gráfico del histórico**

Lee el histórico de Home Assistant (24 horas por defecto, con `graph_hours`) y se actualiza cada 2 minutos. Un `sensor` dibuja la curva; un `binary_sensor`, una onda cuadrada on/off. Con `prefers-reduced-motion` el trazo se muestra quieto.

### **Configuración mínima**

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
```

### **Con umbrales**

```yaml
type: custom:neon-sensor-card
entity: sensor.temperatura_exterior
name: Temperatura Exterior
size: large
neon_effect: halo
neon_palette: electric
thresholds_enabled: true
threshold_low: 22
threshold_high: 26
threshold_names:
  low: Frío
  ok: Confort
  high: Calor
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Sensor.gif" width="450"></p>

## 🚀 Próximamente

Neon Cards se está diseñando como una colección completa de tarjetas para Home Assistant, se irán añadiendo más tarjetas.

- **Próxima Tarjeta: 🔐 CERRADURA.**

---

## 📚 Documentación

- [Ejemplos de configuración](./examples/README.md): YAML mínimo y avanzado de cada tarjeta, con capturas.
- [Referencia de API](./docs/es/api.md): todas las claves de configuración.
- [Registro de cambios](./CHANGELOG.md).

---

## ✅ Requisitos

Home Assistant **2025.10.0** o superior (ver [`hacs.json`](./hacs.json)).  
No se garantiza compatibilidad con versiones anteriores.

---

## 🛠 Instalación mediante HACS

1. Abre **HACS**.
2. Pulsa el menú **⋮** (arriba a la derecha) → **Repositorios personalizados**.
3. Añade el repositorio:

   **https://github.com/Jaguaza/Neon-Cards**

   Categoría: **Dashboard**

4. Busca **Neon Cards**.
5. Instálalo desde HACS.

> HACS añadirá automáticamente el recurso de Lovelace.  
> No es necesario configurar manualmente **Configuración → Recursos**.

---

## 📄 Licencia

Este proyecto está licenciado bajo **Apache License 2.0**.

### ✔ Puedes

- Usarlo gratuitamente en Home Assistant.
- Modificar el código.
- Aprender del proyecto.
- Compartir mejoras.
- Crear forks, incluso con fines comerciales.
- Usarlo en productos o servicios comerciales.

### Debes

- Conservar el aviso de copyright y de licencia.
- Indicar claramente si has modificado los archivos.

Ver el texto legal completo en [`LICENSE`](./LICENSE) (inglés, vinculante) o su [traducción informativa](./LICENSE%20ES.md).

---

## Autor
**@Jaguaza**

**GitHub:** https://github.com/Jaguaza  
**Telegram:** https://t.me/Jaguaza  
**Grupo de Domótica:** https://t.me/DomoticaParaTodos

---

## ❤️ Apoya el proyecto

<p align="center">
  Si este proyecto te resulta útil y deseas apoyar su desarrollo:
  <br><br>
  <a href="https://paypal.me/NeonCardsHA" target="_blank">
    <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" alt="Donar con PayPal">
  </a>
</p>

---

# 🇬🇧 English
<a name="readme-en"></a>

## ✨ Included Cards

- 🪪**ENTITY.**  [Go to Entity](#entity-card-gb)
- 🚾**BUTTON.**  [Go to Button](#button-card-gb)
- 🌡 **THERMOSTAT.**  [Go to Thermostat](#thermostat-card-gb)
- 📈 **SENSOR.**  [Go to Sensor](#sensor-card-gb)

### 🔌 Common features

- **They adapt to your theme:** they take the corner radius and colors of the active theme.
- **Visual editor** in all four cards, no YAML needed.
- **Configuration UI in Spanish and English**, following your Home Assistant language.
- **Neon palettes** (Cyber Emerald, Cyberpunk Pink, Electric Blue, Sunset Amber, Toxic Purple or your own colors).
- **Automatic size** in Home Assistant's grid: no need to set `grid_options`.

<a name="entity-card-gb"></a>
### **🪪 Neon Entity Card**

Minimalist switch with SVG animations, dynamic palettes, and modular architecture.
<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/Entity%20completa.jpg" width="450" style="margin-right:20px;">
</p>

### **Available Palettes**

- **Cyber Emerald** *(Default)*  
  ![Neon Card - Cyber Emerald](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/1%20Ne%C3%B3n.jpg)

- **Cyberpunk Pink:** Pink, Crimson, Purple  
  ![Neon Card - Cyberpunk Pink](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/2%20Ne%C3%B3n.jpg)

- **Electric Blue:** Cyan, Blue, Dark Blue  
  ![Neon Card - Electric Blue](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/3%20Ne%C3%B3n.jpg)

- **Sunset Amber:** Orange, Yellow, Pink  
  ![Neon Card - Sunset Amber](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/4%20Ne%C3%B3n.jpg)

- **Toxic Purple:** Violet, Purple, Blue  
  ![Neon Card - Toxic Purple](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/5%20Ne%C3%B3n.jpg)

- **Custom:** Choose your own colors.

### **Title and Subtitle**
- **Title:** Includes selector for: custom title, entity name, etc.
- **Subtitle:** Includes selector for: Name, Last changed, etc.

### **One or several entities**
- **One entity:** with an optional custom name.
- **Several entities:** an `entities` list, each with its own name, laid out in the number of columns you set with `columns`.

### **Information, state and orientation**
- **Primary and secondary text:** name, state, last changed, last updated or nothing.
- **Status dot:** can be shown or hidden.
- **Orientation:** the switch on the left or on the right.

### **Actions**
Tap, hold and double tap are configurable with Home Assistant's standard actions (more info, toggle, navigate, open URL, call a service, Assist or none).

### **Minimal configuration**

```yaml
type: custom:neon-card-entity
entity: light.living_room
```

---
<a name="button-card-gb"></a>
### **🚾 Neon Button Card**

Minimalist button with SVG animations, dynamic palettes, and modular architecture.
<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/button/Button%201.jpg" width="450" style="margin-right:20px;"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/button/Button%202.jpg" width="450" style="margin-right:20px;">
</p>

### **Available Palettes**

- **Cyber Emerald** *(Default)*  
- **Cyberpunk Pink:** Pink, Crimson, Purple  
- **Electric Blue:** Cyan, Blue, Dark Blue  
- **Sunset Amber:** Orange, Yellow, Pink  
- **Toxic Purple:** Violet, Purple, Blue  
- **Custom:** Choose your own colors.

### **Title and Subtitle**
- **Title:** Includes selector for: custom title, entity name, etc.
- **Subtitle:** Includes selector for: Name, Last changed, etc.

### **Sensor Selector**
- **Free Sensor:** Sensor displayed right below the card subtitle.
- **Sensor Group:** Located below the free sensor; you can add from 1 to 3 sensors.
- **Icons and decimals:** each sensor can have its own icon and the number of decimals it is shown with.

### **Optional entity**
The main entity is optional: the button works just as well to navigate to another view, open a popup, run a script or represent a room without being tied to a specific domain. With an entity, the neon ring animates when it is active.

### **When the entity fails**
When the configured entity does not exist or is *unavailable* or *unknown*, the icon switches to a neon ✕ so you notice it at a glance on the dashboard.

### **Actions**
Tap, hold and double tap are configurable with Home Assistant's standard actions.

### **Minimal configuration**

```yaml
type: custom:neon-button-card
name: Living room
icon: mdi:sofa
```

---
<a name="thermostat-card-gb"></a>
### **🌡 Neon Thermostat Card**

Thermostat with a draggable neon dial, a color per mode and support for **one or two `climate` entities**: a single device, or two separate ones (for example heating and air conditioning) working as a single card.

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/termostato/thermostat-views.jpg" width="450"></p>
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/termostato/thermostat-views1.jpg" width="450"></p>

### **Three views**

| View (`size`) | What it shows | Width in the grid |
|---|---|---|
| `large` | Current temperature on the left and a draggable semicircular dial on the right, with mode, preset and fan selectors | 12 columns |
| `normal` *(default)* | Draggable semicircular ring around the current temperature | 6 columns |
| `compact` | Current temperature and a −/+ pill, with no graphic indicator or sensor footer | 4 columns |

The target is adjusted by dragging the dial or ring (in `large` and `normal`) or with the **−/+** pill (in all three views). The jump is set by `step`; if you omit it, the entity's own step is used and, if it has none, 0.5°.

### **Modes and colors**

Each HVAC mode has its own color. Only the modes your entity exposes in `hvac_modes` appear:

- **Heat:** reddish orange
- **Cool:** blue
- **Heat/Cool:** indigo
- **Auto:** green
- **Dry:** magenta
- **Fan:** yellow
- **Off:** your theme's neutral color

You can use a single color for every mode or pick one per mode (`color`, also from the editor). The header icon follows the mode on its own.


### **One or two entities**

With `entity_2` the card brings two separate devices together:

- The mode selector shows the **union** of both entities' modes.
- Each mode is handled by the first entity that supports it. If both do, `mode_owner` decides which one.
- **They never run at the same time in different modes:** turning on a mode in one switches the other off on its own.
- At the top right there is a button per entity that opens its more-info dialog.


### **Preset and fan (large view)**

In the `large` view, two more selectors appear next to the mode selector **if the entity supports them**: one for **preset** and one for **fan**. They share the width equally (1, 2 or 3 pills) and the names come translated by Home Assistant. If the entity has no presets or fan modes, that pill simply does not appear. There is nothing to configure.

### **Border ring and palette**

The neon ring around the card's border **only lights up when the device is actually running** (heating or cooling, as the entity reports it), not merely because it is in a mode. Its palette is chosen with `neon_palette`, like in the other cards.

### **Footer sensors**

Up to 3 sensors below the card (temperature, humidity, power…), each with its icon and state. They are not shown in the compact view.


### **Minimal configuration**

```yaml
type: custom:neon-thermostat-card
entity: climate.living_room
```

### **Two devices in one card**

```yaml
type: custom:neon-thermostat-card
entity: climate.heating
entity_2: climate.air_conditioning
name: Living room
size: large
footer:
  - entity: sensor.living_room_humidity
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Termostato%20Gif.gif" width="450"></p>

---

<a name="sensor-card-gb"></a>
### **📈 Neon Sensor Card**

Read-only card for **one** `sensor` or `binary_sensor` entity: name, icon, value with its unit and a **history graph** drawn like the trace of a vital-signs monitor. The graph is shown in the medium and large sizes (the small one has none); what you choose is its color effect. State thresholds are optional and are what marks the card's perimeter. Any other entity (`light`, `switch`, `climate`…) is rejected.

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/sensor/Neon_Sensor_Cards.png" width="450"></p>

### **Title and subtitle**

`name` is the title (by default, the entity's name) and `subtitle` is the text under it. Without `subtitle`, "Sensor" or "Binary sensor" is shown. With `show_subtitle: false` (or by unticking "Show subtitle" in the editor) no subtitle is shown.

### **Three sizes**

| Size (`size`) | What it shows | Width in the grid |
|---|---|---|
| `large` | Value and graph, at full width | 12 columns |
| `normal` *(default)* | Value and graph, as narrow as they fit together (if they don't, the graph moves to its own line) | 6 columns |
| `compact` | Name, value, unit and label, with no graph or ⋮ menu | 3 columns |

At no size is anything cut off outside the card: texts wrap onto several lines.

### **Graph color effect**

Chosen with `neon_effect`; it affects the **graph and the icon**:

- **`halo`** *(default)*: the graph in the three palette colors (`neon_palette`, same as the other cards), each one on its own stretch of the line, with a glow in those same colors and a sweep effect.
- **`single`**: one color (`neon_color`) with the same sweep effect.
- **`normal`**: your theme color, with no sweep or glow.

### **State thresholds (optional)**

With `thresholds_enabled: true` the reading is rated **Low**, **OK** or **High** using two numbers: below `threshold_low` is Low, above `threshold_high` is High and in between (limits included) is OK. For example, with 22 and 26: 21.9 is Low, 24 is OK and 26.1 is High.

- Each level has its own **color** (`threshold_colors`) and **name** (`threshold_names`).
- The level's color marks the **card's perimeter** (border and glow) and the status label under the value. The graph and the icon do not change with the level.
- Without thresholds there is no label and the perimeter looks normal, whatever the color effect.
- On a `binary_sensor`, `alert_state` says which state is the alert.

### **History graph**

It reads Home Assistant's history (24 hours by default, with `graph_hours`) and refreshes every 2 minutes. A `sensor` draws the curve; a `binary_sensor` draws an on/off square wave. With `prefers-reduced-motion` the trace is shown still.

### **Minimal configuration**

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
```

### **With thresholds**

```yaml
type: custom:neon-sensor-card
entity: sensor.outdoor_temperature
name: Outdoor Temperature
size: large
neon_effect: halo
neon_palette: electric
thresholds_enabled: true
threshold_low: 22
threshold_high: 26
threshold_names:
  low: Cold
  ok: Comfort
  high: Hot
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Sensor.gif" width="450"></p>

## 🚀 Coming Soon

Neon Cards is being designed as a complete collection of cards for Home Assistant. More cards will be added over time.

- **NEXT CARD: 🔐 LOCK.**

---

## 📚 Documentation

- [Configuration examples](./examples/README.md): minimal and advanced YAML for each card, with screenshots.
- [API reference](./docs/en/api.md): every configuration key.
- [Changelog](./CHANGELOG.md).

---

## ✅ Requirements

Home Assistant **2025.10.0** or higher (see [`hacs.json`](./hacs.json)).  
Compatibility with earlier versions is not guaranteed.

---

## 🛠 Installation via HACS

1. Open **HACS**.
2. Click the **⋮** menu (top right) → **Custom repositories**.
3. Add the repository:

   **https://github.com/Jaguaza/Neon-Cards**

   Category: **Dashboard**

4. Search for **Neon Cards**.
5. Install it from HACS.

> HACS will automatically add the Lovelace resource.  
> No manual configuration under **Settings → Resources** is required.

---

## 📄 License

This project is licensed under **Apache License 2.0**.

### ✔ Allowed

- Free use in Home Assistant.
- Modify the code.
- Learn from the project.
- Share improvements.
- Create forks, including for commercial purposes.
- Use it in commercial products or services.

### You must

- Keep the copyright and license notice.
- Clearly indicate if you have modified the files.

See the full legal text in [`LICENSE`](./LICENSE) (English, binding) or its [informative translation](./LICENSE%20ES.md).

---

## Author
**@Jaguaza**

**GitHub:** https://github.com/Jaguaza  
**Telegram:** https://t.me/Jaguaza  
**Home Automation Group:** https://t.me/DomoticaParaTodos

---

## ❤️ Support the project

<p align="center">
  If you find this project useful and would like to support its development:
  <br><br>
  <a href="https://paypal.me/NeonCardsHA" target="_blank">
    <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" alt="Donate with PayPal">
  </a>
</p>
