# examples/

Ejemplos oficiales de uso de cada tarjeta y de cada API pública (acuerdo
nº12 y nº17).

## Neón Card Entity (`custom:neon-card-entity`)

### YAML mínimo

```yaml
type: custom:neon-card-entity
entity: light.living_room
```

### YAML avanzado

```yaml
type: custom:neon-card-entity
name: Salón
neon_palette: cyberpunk
entities:
  - entity: light.living_room
    name: Techo
  - entity: switch.tv_plug
    name: TV
tap_action:
  action: more-info
hold_action:
  action: toggle
double_tap_action:
  action: none
show_status_dot: false
primary_info: name
secondary_info: last-changed
card_orientation: right
```

### Capturas

![Escenarios de Neón Card Entity](../assets/screenshots/entity/Entity%20completa.jpg)

### GIF

![Neón Card Entity en acción](../assets/gifs/Ne%C3%B3n-Card.gif)

### Explicación

Neón Card Entity es un interruptor con un aro neón degradado de 3 colores
alrededor de la píldora. Cada entidad puede mostrar información primaria y
secundaria (nombre, estado, último cambio...), un punto de estado opcional,
y admite tap / mantener pulsado / doble toque configurables por separado.
La orientación de la tarjeta (`card_orientation`) permite elegir si la
píldora queda a la izquierda (por defecto) o a la derecha, con la
información en el lado contrario.
