# src/core

Clases y contratos base compartidos por todas las tarjetas de Neón Cards.

Solo código verdaderamente transversal vive aquí (ver acuerdo nº4 en
[docs/es](../../docs/es)). Nada específico de Home Assistant — eso
pertenece a `src/ha`.

Vive dentro de `src/` como el resto de módulos (ver `../ha`, `../shared`,
`../utils`, `../cards`) — no es un paquete npm aparte. Si en el futuro
alguien externo quisiera reutilizarlo por separado, extraerlo a su propio
paquete es un cambio sencillo y aislado.
