![Cabecera](https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/branding/social-preview.png)

Colección de tarjetas personalizadas para Home Assistant con una estética moderna inspirada en el neón. Estas tarjetas toman automáticamente el radio de las esquinas, los colores internos y otros estilos del tema que tengas seleccionado, adaptándose a cualquier tema instalado en tu Home Assistant.

Collection of custom cards for Home Assistant with a modern neon‑inspired aesthetic. These cards automatically inherit the corner radius, internal colors, and other visual styles from the theme you have selected, adapting seamlessly to any theme installed in your Home Assistant.

## 🎬 Demo Neón Cards

### 🎬 Video explicativo / Explainer video

https://github.com/user-attachments/assets/adf351f8-18a3-4f6e-bc8f-4353c1061a87

<p align="center">
  <strong>Imagen de las tarjetas / Cards preview</strong>
</p>


<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/Neon%20Completa.jpg" width="1024" style="margin-right:20px;">
</p>

---

## Apoya el proyecto ❤️ Support the project
Si te está gustando este Repositorio pásate [por Aquí](#apoyo_es)  - If you’re enjoying this repository, do pop [over here](#apoyo_en) 

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
- 🔐 **CERRADURA.**  [Ir a Cerradura](#cerradura-card)

### 🔌 Características comunes

- **Se adaptan a tu tema:** toman el radio de las esquinas y los colores del tema activo.
- **Editor visual** en las cinco tarjetas, sin necesidad de escribir YAML.
- **Interfaz de configuración en español e inglés**, según el idioma de tu Home Assistant.
- **Paletas neón** (Cyber Emerald, Cyberpunk Pink, Electric Blue, Sunset Amber, Toxic Purple o colores propios).
- **Tamaño automático** en el grid de Home Assistant: no hace falta indicar `grid_options`.


<a name="entity-card"></a>
### **🪪 Neón Entity Card**

Interruptor minimalista con animaciones SVG, paletas dinámicas y arquitectura modular.
<p align="center">
  <img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/entity/Entity%20completa.jpg" width="450" style="margin-right:20px;">
</p>

https://github.com/user-attachments/assets/8ae87d5e-a995-4531-8aae-b137a4cc1fca

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

https://github.com/user-attachments/assets/52b46ae6-df7a-4e43-ba21-e260f69b32ac

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
La entidad principal es opcional: el botón sirve igual para navegar a otra vista, abrir un popup, ejecutar un script o representar una habitación sin estar ligado a un dominio concreto. Con entidad, el halo neón se anima cuando está activa.

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

| Vista (`size`) | Qué muestra | Tamaño fijo en el grid (columnas × filas) |
|---|---|---|
| `large` | Temperatura actual a la izquierda y dial semicircular arrastrable a la derecha, con selectores de modo, preset y ventilador | 12 × 5 |
| `normal` *(predeterminada; «Mediana» en el editor)* | Aro semicircular arrastrable alrededor de la temperatura actual | 8 × 5 |
| `compact` | Temperatura actual y píldora −/+, sin indicador gráfico ni sensores de pie | 5 × 4 |

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
- **Exclusión al elegir el modo:** al elegir un modo **en la tarjeta**, la otra entidad se apaga si estaba activa en un modo distinto. Los cambios hechos fuera de la tarjeta (diálogo, voz, otras automatizaciones) no se tocan: para esos casos hay una automatización de ejemplo al final de esta sección.
- Arriba a la derecha hay un botón por entidad que abre su diálogo de más información.


### **Preset y ventilador (vista grande)**

En la vista `large`, junto al selector de modo aparecen otros dos **si la entidad los soporta**: uno de **preset** y otro de **ventilador**. Se reparten el ancho a partes iguales (1, 2 o 3 píldoras) y los nombres salen traducidos por Home Assistant. Si la entidad no tiene presets o modos de ventilador, esa píldora simplemente no aparece. No hay nada que configurar.

### **Halo del borde y paleta**

El halo neón del borde de la tarjeta **solo se enciende cuando el equipo está funcionando de verdad** (calentando o enfriando, según informe la entidad), no por el simple hecho de estar en un modo. Su paleta se elige con `neon_palette`, igual que en las otras tarjetas.

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
entity: climate.entity_1
entity_2: climate.entity_2
name: Salón
size: large
footer:
  - entity: sensor.salon_humidity
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Termostato%20Gif.gif" width="450"></p>

### **Exclusión también para cambios hechos fuera de la tarjeta (opcional)**

La tarjeta solo apaga la otra entidad cuando eliges el modo **en ella**; no actúa por su cuenta cuando el cambio viene de fuera (otra tarjeta, el diálogo de la entidad, un asistente de voz u otras automatizaciones). Si quieres esa garantía también en esos casos, **necesitas una automatización de Home Assistant** (funciona con el panel cerrado). Es opcional y solo tiene sentido con `entity_2`. Sustituye `climate.entity_1` y `climate.entity_2` por las entidades de la tarjeta (`entity_1` es `entity`; `entity_2` es `entity_2`):

```yaml
alias: Salón — calefacción y aire no a la vez
description: Si un equipo pasa a un modo activo distinto del que tiene el otro, apaga el otro.
mode: queued
triggers:
  - trigger: state
    entity_id:
      - climate.entity_1
      - climate.entity_2
variables:
  otro: >-
    {{ 'climate.entity_2' if trigger.entity_id == 'climate.entity_1'
       else 'climate.entity_1' }}
  # Modos que NUNCA activan la exclusión (ni en el equipo que cambia ni en el otro)
  libres:
    - "off"
    - fan_only
    - unavailable
    - unknown
conditions:
  - condition: template
    value_template: >-
      {% set nuevo = trigger.to_state.state %}
      {% set del_otro = states(otro) %}
      {{ trigger.from_state is not none
         and trigger.from_state.state != nuevo
         and nuevo not in libres
         and del_otro not in libres
         and del_otro != nuevo }}
actions:
  - action: climate.set_hvac_mode
    target:
      entity_id: "{{ otro }}"
    data:
      hvac_mode: "off"
```

El ventilador (`fan_only`) queda libre por defecto: un aire en solo ventilador no apaga la calefacción, ni al revés. Más detalles en la [documentación de la tarjeta](./src/cards/thermostat/README.md).

---

<a name="sensor-card"></a>
### **📈 Neón Sensor Card**

Tarjeta de solo lectura para **una** entidad `sensor` o `binary_sensor`: nombre, icono, valor con su unidad y un **gráfico del histórico** dibujado como el trazo de un monitor de constantes vitales. El gráfico se muestra en los tamaños mediano y grande (el pequeño no lo lleva); lo que eliges es su efecto de color. Los umbrales de estado son opcionales y son los que marcan el perímetro de la tarjeta. Cualquier otra entidad (`light`, `switch`, `climate`…) se rechaza.

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/sensor/Neon_Sensor_Cards.png" width="450"></p>

### **Título y subtítulo**

`name` es el título (por defecto, el nombre de la entidad) y `subtitle` el texto de debajo. Sin `subtitle` se muestra «Sensor» o «Sensor binario». Con `show_subtitle: false` (o desmarcando «Mostrar subtítulo» en el editor) no se muestra ningún subtítulo.

### **Tres tamaños**

| Tamaño (`size`) | Qué muestra | Tamaño fijo en el grid (columnas × filas) |
|---|---|---|
| `large` | Cabecera arriba; debajo, el valor y la etiqueta del umbral a la izquierda y el gráfico a la derecha | 12 × 2 |
| `normal` *(predeterminado)* | Cabecera y, debajo, el valor y el gráfico en la misma fila (el gráfico se encoge en vez de saltar de línea) | 6 × 2 |
| `compact` | Nombre, subtítulo, valor (siempre con un decimal, `xx.x`) y etiqueta, sin gráfico ni menú ⋮ | 3 × 2 |

Cada tamaño ocupa un hueco fijo y no se redimensiona desde el dashboard. Nada se pinta fuera de la tarjeta: lo que no cupiera se recorta dentro. La tarjeta pequeña mide lo que necesita su contenido (≈ 90 px sin subtítulo) en vez de rellenar sus 2 filas.

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

---

<a name="cerradura-card"></a>
### **🔐 Neón Lock Card**

Tarjeta para entidades `lock` de Home Assistant (cerraduras, pestillos, cerraduras de garaje) con un **icono animado** que se abre y se cierra de verdad, un halo neón que sigue al estado de la cerradura y **confirmación antes de abrir**. Cualquier entidad que no sea del dominio `lock` se muestra como «No disponible».

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/cerradura/cerradura.png" width="450"></p>

### **Cuatro iconos animados**

Se elige con `lock_icon` (o desde el editor visual, que enseña el dibujo de cada uno): `padlock` *(predeterminado)*, `door`, `garage_roller` (garaje con puerta enrollable) y `garage_sliding` (garaje con puerta corredera). Son dibujos propios que se animan al abrir y al cerrar; con `prefers-reduced-motion` cambian de pose sin animación.

### **Tres tamaños**

| Tamaño (`size`) | Qué muestra | Columnas de inicio (alto automático) |
|---|---|---|
| `large` *(predeterminado)* | Icono, nombre con subtítulo opcional, estado y tres puntos arriba; debajo, hasta tres datos de pie | 12 |
| `medium` | Sin subtítulo: el estado va bajo el nombre; pie de hasta dos datos (batería y último acceso) | 6 |
| `compact` | Solo icono, nombre y estado (con los tres puntos); sin pie y sin subtítulo. Al pulsar, la orden se elige con iconos de candado, sin texto | 3 |

Las columnas se pueden cambiar a mano desde la pestaña «Diseño» del editor; la tarjeta se adapta al ancho que le dan.

### **Estado y halo**

El estado se muestra con un punto de color: verde cerrada, ámbar desbloqueada o abierta y rojo atascada o no disponible (`status_color_closed`, `status_color_open` y `status_color_alert` los cambian). El halo se enciende cuando se abre, sigue encendido mientras esté abierta y se apaga al llegar a cerrada; al pulsar una acción que opera la cerradura se enciende ya, sin esperar a que cambie el estado.

Con un **sensor de puerta** (`door_entity`) el texto distingue «Abriendo puerta…» (el pestillo ya está liberado) de «Puerta abierta» (el sensor está activo). Sin sensor, «Puerta abierta» no sale nunca.

### **Confirmación al abrir**

Por seguridad, al pulsar para **abrir** la tarjeta pregunta «¿Abrir?» dentro de sí misma, con el halo encendido, y no actúa hasta que confirmas: se cancela sola a los 8 s y **cerrar nunca pide confirmación**. Si la cerradura soporta además abrir (`lock.open`), te deja elegir entre **Desbloquear** y **Abrir** (o **Bloquear** y **Abrir**). Se desactiva con `confirm_open: false`.

### **Pie informativo**

`footer_items` pone hasta tres datos bajo una línea de neón, en el orden que escribas: `door` (sensor de puerta, con `door_entity`), `battery` (con `battery_entity`; si falta usa el atributo `battery_level` de la cerradura) y `last_user` (con `last_user_entity`; si falta usa el atributo `changed_by`). En el tamaño `medium` solo caben `battery` y `last_user` (el sensor de puerta no se pinta en el pie, pero sigue sirviendo para «Puerta abierta»); en `compact` no hay pie. Un dato que no se puede obtener se muestra como «—».

### **Acciones**

`tap_action` es `toggle` por defecto, `hold_action` abre «más información» y `double_tap_action` no hace nada. Si tu cerradura pide código, usa `more-info` o una acción `call-service` con el código. Más detalles en la [documentación de la tarjeta](./src/cards/lock/README.md).

### **Configuración mínima**

```yaml
type: custom:neon-lock-card
entity: lock.puerta_principal
```

### **Con pie de datos**

```yaml
type: custom:neon-lock-card
entity: lock.puerta_principal
name: Puerta Principal
lock_icon: padlock
neon_palette: electric
footer_items: [battery, last_user, door]
door_entity: binary_sensor.puerta_principal
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Cerradura.gif" width="450"></p>

## 🚀 Próximamente

Neon Cards se está diseñando como una colección completa de tarjetas para Home Assistant, se irán añadiendo más tarjetas.

- **Próxima Tarjeta: 🚨 ALARMA.**

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

Neón Cards ya está disponible en HACS: no hace falta añadir ningún repositorio personalizado.

**Opción rápida:** pulsa el botón para abrir Neón Cards directamente en tu Home Assistant.

[![Abre tu instancia de Home Assistant y muestra el repositorio dentro de HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Jaguaza&repository=Neon-Cards&category=plugin)

**Opción manual:**

1. Abre **HACS**.
2. Busca **Neon Cards**.
3. Instálalo desde HACS.

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
**Grupo de Domótica:** https://t.me/Domotica_Para_Todos

---
<a name="apoyo_es"></a>
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
- 🔐 **LOCK.**  [Go to Lock](#lock-card-gb)

### 🔌 Common features

- **They adapt to your theme:** they take the corner radius and colors of the active theme.
- **Visual editor** in all five cards, no YAML needed.
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
The main entity is optional: the button works just as well to navigate to another view, open a popup, run a script or represent a room without being tied to a specific domain. With an entity, the neon halo animates when it is active.

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

| View (`size`) | What it shows | Fixed grid size (columns × rows) |
|---|---|---|
| `large` | Current temperature on the left and a draggable semicircular dial on the right, with mode, preset and fan selectors | 12 × 5 |
| `normal` *(default; "Medium" in the editor)* | Draggable semicircular ring around the current temperature | 8 × 5 |
| `compact` | Current temperature and a −/+ pill, with no graphic indicator or sensor footer | 5 × 4 |

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
- **Exclusion when choosing the mode:** when you pick a mode **in the card**, the other entity is turned off if it was active in a different mode. Changes made outside the card (dialog, voice, other automations) are left alone: for those cases there is an example automation at the end of this section.
- At the top right there is a button per entity that opens its more-info dialog.


### **Preset and fan (large view)**

In the `large` view, two more selectors appear next to the mode selector **if the entity supports them**: one for **preset** and one for **fan**. They share the width equally (1, 2 or 3 pills) and the names come translated by Home Assistant. If the entity has no presets or fan modes, that pill simply does not appear. There is nothing to configure.

### **Border halo and palette**

The neon halo around the card's border **only lights up when the device is actually running** (heating or cooling, as the entity reports it), not merely because it is in a mode. Its palette is chosen with `neon_palette`, like in the other cards.

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
entity: climate.entity_1
entity_2: climate.entity_2
name: Living room
size: large
footer:
  - entity: sensor.living_room_humidity
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Termostato%20Gif.gif" width="450"></p>

### **Exclusion also for changes made outside the card (optional)**

The card only turns the other entity off when you pick the mode **in it**; it does not act on its own when the change comes from outside (another card, the entity's dialog, a voice assistant or other automations). If you want that guarantee in those cases too, **you need a Home Assistant automation** (it works with the dashboard closed). It is optional and only makes sense with `entity_2`. Replace `climate.entity_1` and `climate.entity_2` with the card's entities (`entity_1` is `entity`; `entity_2` is `entity_2`):

```yaml
alias: Living room — heating and air conditioning not together
description: If one unit switches to an active mode different from the other's, turn the other off.
mode: queued
triggers:
  - trigger: state
    entity_id:
      - climate.entity_1
      - climate.entity_2
variables:
  other: >-
    {{ 'climate.entity_2' if trigger.entity_id == 'climate.entity_1'
       else 'climate.entity_1' }}
  # Modes that NEVER trigger the exclusion (neither on the unit that changes nor on the other)
  free_modes:
    - "off"
    - fan_only
    - unavailable
    - unknown
conditions:
  - condition: template
    value_template: >-
      {% set new_mode = trigger.to_state.state %}
      {% set other_mode = states(other) %}
      {{ trigger.from_state is not none
         and trigger.from_state.state != new_mode
         and new_mode not in free_modes
         and other_mode not in free_modes
         and other_mode != new_mode }}
actions:
  - action: climate.set_hvac_mode
    target:
      entity_id: "{{ other }}"
    data:
      hvac_mode: "off"
```

The fan (`fan_only`) is free by default: an air conditioner in fan-only mode does not turn the heating off, nor the other way round. More details in the [card documentation](./src/cards/thermostat/README.md).

---

<a name="sensor-card-gb"></a>
### **📈 Neon Sensor Card**

Read-only card for **one** `sensor` or `binary_sensor` entity: name, icon, value with its unit and a **history graph** drawn like the trace of a vital-signs monitor. The graph is shown in the medium and large sizes (the small one has none); what you choose is its color effect. State thresholds are optional and are what marks the card's perimeter. Any other entity (`light`, `switch`, `climate`…) is rejected.

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/sensor/Neon_Sensor_Cards.png" width="450"></p>

### **Title and subtitle**

`name` is the title (by default, the entity's name) and `subtitle` is the text under it. Without `subtitle`, "Sensor" or "Binary sensor" is shown. With `show_subtitle: false` (or by unticking "Show subtitle" in the editor) no subtitle is shown.

### **Three sizes**

| Size (`size`) | What it shows | Fixed grid size (columns × rows) |
|---|---|---|
| `large` | Header on top; below, the value and threshold label on the left and the graph on the right | 12 × 2 |
| `normal` *(default)* | Header and, below, the value and graph in the same row (the graph shrinks instead of wrapping) | 6 × 2 |
| `compact` | Name, subtitle, value (always one decimal, `xx.x`) and label, with no graph or ⋮ menu | 3 × 2 |

Each size takes a fixed slot and cannot be resized from the dashboard. Nothing is drawn outside the card: anything that doesn't fit is clipped inside. The small card measures what its content needs (≈ 90 px without subtitle) instead of filling its 2 rows.

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

---

<a name="lock-card-gb"></a>
### **🔐 Neon Lock Card**

Card for Home Assistant `lock` entities (door locks, latches, garage locks) with an **animated icon** that really opens and closes, a neon halo that follows the lock's state and a **confirmation before opening**. Any entity that is not in the `lock` domain is shown as "Unavailable".

  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/screenshots/cerradura/cerradura.png" width="450"></p>

### **Four animated icons**

Chosen with `lock_icon` (or from the visual editor, which shows each drawing): `padlock` *(default)*, `door`, `garage_roller` (garage with a roller door) and `garage_sliding` (garage with a sliding door). They are custom drawings animated on open and close; with `prefers-reduced-motion` they switch pose without animation.

### **Three sizes**

| Size (`size`) | What it shows | Starting columns (automatic height) |
|---|---|---|
| `large` *(default)* | Icon, name with an optional subtitle, state and three dots on top; up to three footer data points below | 12 |
| `medium` | No subtitle: the state sits under the name; footer of up to two data points (battery and last access) | 6 |
| `compact` | Icon, name and state only (with the three dots); no footer and no subtitle. On tap, the command is chosen with padlock icons, with no text | 3 |

The columns can be changed by hand from the editor's "Layout" tab; the card adapts to the width it is given.

### **State and halo**

The state is shown with a colored dot: green for locked, amber for unlocked or open and red for jammed or unavailable (`status_color_closed`, `status_color_open` and `status_color_alert` change them). The halo turns on when it opens, stays on while it is open and turns off when it reaches locked; when you tap an action that operates the lock it turns on right away, without waiting for the state to change.

With a **door sensor** (`door_entity`) the text tells "Opening door…" (the latch is already released) from "Door open" (the sensor is active). Without a sensor, "Door open" never appears.

### **Confirmation before opening**

For safety, when you tap to **open** the card asks "Open?" inside itself, with the halo on, and does nothing until you confirm: it cancels itself after 8 s and **closing never asks for confirmation**. If the lock also supports opening (`lock.open`), it lets you choose between **Unlock** and **Open** (or **Lock** and **Open**). It is turned off with `confirm_open: false`.

### **Informative footer**

`footer_items` puts up to three data points under a neon line, in the order you write them: `door` (door sensor, with `door_entity`), `battery` (with `battery_entity`; if missing it uses the lock's `battery_level` attribute) and `last_user` (with `last_user_entity`; if missing it uses the `changed_by` attribute). In the `medium` size only `battery` and `last_user` fit (the door sensor is not drawn in the footer, but still serves the "Door open" text); `compact` has no footer. A data point that cannot be obtained is shown as "—".

### **Actions**

`tap_action` is `toggle` by default, `hold_action` opens "more info" and `double_tap_action` does nothing. If your lock asks for a code, use `more-info` or a `call-service` action with the code. More details in the [card documentation](./src/cards/lock/README.md).

### **Minimal configuration**

```yaml
type: custom:neon-lock-card
entity: lock.front_door
```

### **With footer data**

```yaml
type: custom:neon-lock-card
entity: lock.front_door
name: Front Door
lock_icon: padlock
neon_palette: electric
footer_items: [battery, last_user, door]
door_entity: binary_sensor.front_door
```
  <p align="center"><img src="https://raw.githubusercontent.com/Jaguaza/Neon-Cards/main/assets/gifs/Cerradura.gif" width="450"></p>

## 🚀 Coming Soon

Neon Cards is being designed as a complete collection of cards for Home Assistant. More cards will be added over time.

- **NEXT CARD: 🚨 ALARM.**

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

Neón Cards is now available in HACS: there is no need to add a custom repository.

**Quick option:** click the button to open Neón Cards directly in your Home Assistant.

[![Open your Home Assistant instance and show the repository inside HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Jaguaza&repository=Neon-Cards&category=plugin)

**Manual option:**

1. Open **HACS**.
2. Search for **Neon Cards**.
3. Install it from HACS.

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
**Home Automation Group:** https://t.me/Domotica_Para_Todos

---
<a name="apoyo_en"></a>
## ❤️ Support the project

<p align="center">
  If you find this project useful and would like to support its development:
  <br><br>
  <a href="https://paypal.me/NeonCardsHA" target="_blank">
    <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" alt="Donate with PayPal">
  </a>
</p>
