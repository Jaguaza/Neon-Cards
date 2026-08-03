/**
 * Punto de entrada del paquete de Neón Cards (paquete único, sin
 * workspaces).
 *
 * - src/core    → clases y contratos base compartidos
 * - src/ha      → todo lo que depende de Home Assistant
 * - src/shared  → componentes visuales y estilos reutilizados entre tarjetas
 * - src/utils   → utilidades genéricas puras
 * - src/cards   → cada tarjeta, aislada de las demás (acuerdo nº3)
 *
 * El punto de entrada real que se empaqueta es src/neon-cards.ts (registra
 * todas las tarjetas); este archivo es el "main" del paquete para
 * cualquier consumo futuro tipo librería.
 */

export {};
