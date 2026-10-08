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

### 🔌 Características comunes

- **Se adaptan a tu tema:** toman el radio de las esquinas y los colores del tema activo.
- **Editor visual** en las tres tarjetas, sin necesidad de escribir YAML.
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

<!--
  📸 FOTO OPCIONAL A — Entity en modo multi-entidad (varias entidades con su nombre en columnas)
  Archivo sugerido: assets/screenshots/entity/entity-multi.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/entity-multi.jpg" width="450"></p>
-->

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

<!--
  📸 FOTO OPCIONAL B — Button con la entidad no disponible (icono ✕) o con sensores agrupados
  Archivo sugerido: assets/screenshots/button/button-unavailable.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/button/button-unavailable.jpg" width="450"></p>
-->

---

<a name="termostato-card"></a>
### **🌡 Neón Termostato Card**

Termostato con dial neón arrastrable, color por modo y soporte para **una o dos entidades `climate`**: un único equipo, o dos separados (por ejemplo calefacción y aire acondicionado) funcionando como una sola tarjeta.

<!--
  📸 FOTO 1 — HÉROE: las tres vistas (grande, normal y compacta) juntas, en un panel real
  Archivo sugerido: assets/screenshots/thermostat/thermostat-views.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-views.jpg" width="450"></p>
-->

### **Tres vistas**

| Vista (`size`) | Qué muestra | Ancho en el grid |
|---|---|---|
| `large` | Temperatura actual a la izquierda y dial semicircular arrastrable a la derecha, con selectores de modo, preset y ventilador | 12 columnas |
| `normal` *(predeterminada)* | Aro semicircular arrastrable alrededor de la temperatura actual | 6 columnas |
| `compact` | Temperatura actual y píldora −/+, sin indicador gráfico ni sensores de pie | 4 columnas |

La consigna se ajusta arrastrando el dial o el aro (en `large` y `normal`) o con la píldora **−/+** (en las tres vistas). El salto lo marca `step`; si no lo indicas, se usa el de la entidad y, si no tiene, 0,5 °.

<!--
  📸 FOTO 2 — Vista GRANDE con las tres píldoras (modo + preset + ventilador) en una entidad que las soporte
  Archivo sugerido: assets/screenshots/thermostat/thermostat-large.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-large.jpg" width="450"></p>
-->

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

<!--
  📸 FOTO 3 — Collage con el dial en varios modos (calor, frío, auto, seco, ventilador) para mostrar los colores
  Archivo sugerido: assets/screenshots/thermostat/thermostat-colors.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-colors.jpg" width="450"></p>
-->

### **Una o dos entidades**

Con `entity_2` la tarjeta junta dos equipos separados:

- El selector de modo muestra la **unión** de los modos de las dos entidades.
- Cada modo lo gestiona la primera entidad que lo soporta. Si los soportan las dos, `mode_owner` decide cuál.
- **Nunca trabajan a la vez en modos distintos:** al activar un modo en una, la otra se apaga sola.
- Arriba a la derecha hay un botón por entidad que abre su diálogo de más información.

<!--
  📸 FOTO 4 — Tarjeta con dos entidades (calefacción + aire acondicionado): selector con la unión de modos y los dos botones de la cabecera
  Archivo sugerido: assets/screenshots/thermostat/thermostat-two-entities.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-two-entities.jpg" width="450"></p>
-->

### **Preset y ventilador (vista grande)**

En la vista `large`, junto al selector de modo aparecen otros dos **si la entidad los soporta**: uno de **preset** y otro de **ventilador**. Se reparten el ancho a partes iguales (1, 2 o 3 píldoras) y los nombres salen traducidos por Home Assistant. Si la entidad no tiene presets o modos de ventilador, esa píldora simplemente no aparece. No hay nada que configurar.

### **Aro del borde y paleta**

El aro neón del borde de la tarjeta **solo se enciende cuando el equipo está funcionando de verdad** (calentando o enfriando, según informe la entidad), no por el simple hecho de estar en un modo. Su paleta se elige con `neon_palette`, igual que en las otras tarjetas.

### **Sensores de pie**

Hasta 3 sensores bajo la tarjeta (temperatura, humedad, consumo…), cada uno con su icono y su estado. No se muestran en la vista compacta.

<!--
  📸 FOTO 5 — Vista grande o normal con 2 o 3 sensores de pie (humedad, consumo…)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-footer.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-footer.jpg" width="450"></p>
-->

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

<!--
  📸 FOTO 6 — Editor visual del termostato (la sección de la entidad y el selector de tamaño)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-editor.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-editor.jpg" width="450"></p>
-->
<!--
  📸 FOTO 7 (OPCIONAL) — GIF corto arrastrando el dial y cambiando de modo
  Archivo sugerido: assets/gifs/thermostat.gif
  Para activarlo, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/thermostat.gif" width="450"></p>
-->

## 🚀 Próximamente

Neon Cards se está diseñando como una colección completa de tarjetas para Home Assistant, se irán añadiendo más tarjetas.

- **Próxima Tarjeta: 📈 SENSOR.**

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

### 🔌 Common features

- **They adapt to your theme:** they take the corner radius and colors of the active theme.
- **Visual editor** in all three cards, no YAML needed.
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

<!--
  📸 FOTO OPCIONAL A — Entity en modo multi-entidad (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/entity/entity-multi.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/entity-multi.jpg" width="450"></p>
-->

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

<!--
  📸 FOTO OPCIONAL B — Button con la entidad no disponible (icono ✕) o con sensores agrupados (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/button/button-unavailable.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/button/button-unavailable.jpg" width="450"></p>
-->

---
<a name="thermostat-card-gb"></a>
### **🌡 Neon Thermostat Card**

Thermostat with a draggable neon dial, a color per mode and support for **one or two `climate` entities**: a single device, or two separate ones (for example heating and air conditioning) working as a single card.

<!--
  📸 FOTO 1 — HÉROE: las tres vistas (grande, normal y compacta) juntas (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-views.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-views.jpg" width="450"></p>
-->

### **Three views**

| View (`size`) | What it shows | Width in the grid |
|---|---|---|
| `large` | Current temperature on the left and a draggable semicircular dial on the right, with mode, preset and fan selectors | 12 columns |
| `normal` *(default)* | Draggable semicircular ring around the current temperature | 6 columns |
| `compact` | Current temperature and a −/+ pill, with no graphic indicator or sensor footer | 4 columns |

The target is adjusted by dragging the dial or ring (in `large` and `normal`) or with the **−/+** pill (in all three views). The jump is set by `step`; if you omit it, the entity's own step is used and, if it has none, 0.5°.

<!--
  📸 FOTO 2 — Vista GRANDE con las tres píldoras (modo + preset + ventilador) (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-large.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-large.jpg" width="450"></p>
-->

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

<!--
  📸 FOTO 3 — Collage con el dial en varios modos (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-colors.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-colors.jpg" width="450"></p>
-->

### **One or two entities**

With `entity_2` the card brings two separate devices together:

- The mode selector shows the **union** of both entities' modes.
- Each mode is handled by the first entity that supports it. If both do, `mode_owner` decides which one.
- **They never run at the same time in different modes:** turning on a mode in one switches the other off on its own.
- At the top right there is a button per entity that opens its more-info dialog.

<!--
  📸 FOTO 4 — Tarjeta con dos entidades (calefacción + aire acondicionado) (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-two-entities.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-two-entities.jpg" width="450"></p>
-->

### **Preset and fan (large view)**

In the `large` view, two more selectors appear next to the mode selector **if the entity supports them**: one for **preset** and one for **fan**. They share the width equally (1, 2 or 3 pills) and the names come translated by Home Assistant. If the entity has no presets or fan modes, that pill simply does not appear. There is nothing to configure.

### **Border ring and palette**

The neon ring around the card's border **only lights up when the device is actually running** (heating or cooling, as the entity reports it), not merely because it is in a mode. Its palette is chosen with `neon_palette`, like in the other cards.

### **Footer sensors**

Up to 3 sensors below the card (temperature, humidity, power…), each with its icon and state. They are not shown in the compact view.

<!--
  📸 FOTO 5 — Vista grande o normal con 2 o 3 sensores de pie (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-footer.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-footer.jpg" width="450"></p>
-->

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

<!--
  📸 FOTO 6 — Editor visual del termostato (misma imagen que en la sección en español)
  Archivo sugerido: assets/screenshots/thermostat/thermostat-editor.jpg
  Para activarla, borra estas líneas de comentario y deja solo esta:
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/thermostat/thermostat-editor.jpg" width="450"></p>
-->

---

## 🚀 Coming Soon

Neon Cards is being designed as a complete collection of cards for Home Assistant. More cards will be added over time.

- **NEXT CARD: 📈 SENSOR.**

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
