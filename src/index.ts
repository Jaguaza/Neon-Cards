/**
 * Punto de entrada del paquete raíz de Neón Cards.
 *
 * Este paquete agrupa todo salvo `core`, que vive aislado como paquete npm
 * independiente en `../core` (es el candidato natural a publicarse por
 * separado si algún día alguien externo quisiera reutilizarlo).
 *
 * - src/ha      → todo lo que depende de Home Assistant
 * - src/shared  → componentes visuales y estilos reutilizados entre tarjetas
 * - src/utils   → utilidades genéricas puras
 * - src/cards   → cada tarjeta, aislada de las demás (acuerdo nº3)
 *
 * Todavía no hay nada que exportar aquí — se irá completando a medida que
 * se construya la primera tarjeta (fase 2).
 */

export {};
