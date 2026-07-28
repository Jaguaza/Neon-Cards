# Acuerdos del repositorio de Neón Cards

## 1. Estructura clara

El repositorio tendrá una estructura sencilla y fácil de navegar.

- Una carpeta = una responsabilidad.
- Nada de carpetas "misc", "common" o "temp".
- La estructura debe poder entenderse en pocos minutos.

## 2. Arquitectura por dominios

El código se organiza por responsabilidades, no por tipos de archivo:

```
cards/
core/
ha/
shared/
utils/
docs/
examples/
```

## 3. Independencia de las tarjetas

Cada tarjeta es un módulo independiente. Nunca podrá importar código de otra
tarjeta. Solo podrá depender de `core`, `ha`, `shared` y `utils`.

## 4. Código reutilizable

Cuando una funcionalidad sea reutilizable, se mueve al framework. Nunca se
copia entre tarjetas.

## 5. Sin dependencias circulares

No puede existir ninguna dependencia circular entre módulos.

## 6. Sin carpetas genéricas

No existirán carpetas como `helpers/`, `commons/`, `manager/` o `misc/`. Cada
carpeta debe describir claramente su contenido.

## 7. Archivos pequeños

Objetivos orientativos: función ≤ 50 líneas, clase ≤ 500 líneas, archivo
≤ 500 líneas.

## 8. Una responsabilidad por clase

Una clase hace una sola cosa. Si empieza a asumir varias responsabilidades,
se divide.

## 9. Código autodocumentado

Preferimos buenos nombres y funciones pequeñas sobre comentarios. Los
comentarios explican el porqué, no el qué.

## 10. Sin magia

Nada ocurre automáticamente sin que el desarrollador lo vea. Evitar registro
automático, convenciones ocultas y decoradores complejos.

## 11. Dependencias mínimas

Añadir una librería solo cuando aporte un beneficio claro. Preferir
soluciones propias cuando sean sencillas.

## 12. Ejemplos oficiales

Cada funcionalidad pública tendrá un ejemplo. `examples/` es parte del
repositorio y de la documentación.

## 13. La documentación vive en el repositorio

Toda la documentación está versionada junto al código. No hay documentación
"externa" como fuente principal.

## 14. Documentación bilingüe

Toda la documentación oficial está en español e inglés.

## 15. Arquitectura documentada

Existe documentación específica para desarrolladores: arquitectura, API,
convenciones, ejemplos y cómo crear una tarjeta.

## 16. API documentada

Toda API pública tiene: descripción, parámetros, valor devuelto y ejemplo.

## 17. Un ejemplo por tarjeta

Cada tarjeta tiene: YAML mínimo, YAML avanzado, captura, GIF y explicación.

## 18. Calidad obligatoria antes de publicar

Una tarjeta no se publica hasta tener: código, editor, documentación,
ejemplos, animaciones y rendimiento validado.

## 19. Sin deuda técnica en main

No se permiten `TODO`, `FIXME` ni `HACK`. Todo pendiente debe estar
registrado como una Issue.

## 20. Revisión obligatoria

Antes de integrar cambios importantes se revisa: arquitectura, API,
rendimiento y documentación.

## 21. Lint y comprobaciones obligatorias

No se publica una versión si falla ESLint, TypeScript, tests o build.

## 22. Modo desarrollo

Dos modos: desarrollo (logs, avisos, diagnóstico) y producción (sin código
de depuración, máximo rendimiento).

## 23. Feature Flags internas

Las funcionalidades experimentales se activan mediante flags internas. Nunca
llegan activadas a producción.

## 24. Compatibilidad planificada

Solo se da soporte a un rango definido de versiones de Home Assistant. No se
mantiene compatibilidad indefinida.

## 25. Framework Freeze

Cuando la Neón Card Entity esté terminada, se congela la arquitectura, la
API pública y las convenciones. A partir de ese momento el framework
evoluciona sin rediseñarse.
