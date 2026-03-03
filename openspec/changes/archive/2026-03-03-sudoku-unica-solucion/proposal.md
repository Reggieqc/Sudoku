# Proposal: Nuevo juego con Sudoku de solucion unica

## Intent

Garantizar que cada click en `Nuevo juego` entregue un Sudoku con exactamente una solucion valida, eliminando tableros ambiguos y mejorando la confianza del usuario en la logica del juego.

## Scope

### In Scope
- Reemplazar la fuente actual de puzzle por un catalogo curado de seeds pre-validados con solucion unica.
- Integrar seleccion aleatoria de seed en `newGame()` evitando repeticion inmediata cuando sea posible.
- Agregar pruebas automatizadas que validen que cada seed del catalogo tiene exactamente una solucion y que `Nuevo juego` usa ese catalogo.
- Definir un punto de extension para cambiar en el futuro a un generador runtime sin romper el contrato de `SudokuGameService`.

### Out of Scope
- Implementar un generador dinamico de Sudoku en cliente con backtracking durante esta iteracion.
- Redisenar UX del tablero, dificultad adaptativa, o telemetria de uso.

## Approach

Adoptar un enfoque de **catalogo curado pre-validado** (recomendado en exploracion): mantener una lista de puzzles marcados como `verified-unique`, seleccionar uno por `newGame()` y reforzar la garantia con pruebas que cuentan soluciones en entorno de test. La carga en runtime se mantiene minima y se deja un seam claro para sustituir el origen de puzzles por una estrategia generativa en un cambio futuro.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/game/puzzle-seeds.ts` | Modified | Ampliar/normalizar catalogo de seeds con metadato o contrato de puzzles de solucion unica. |
| `src/app/game/sudoku-game.service.ts` | Modified | Consumir catalogo curado en `newGame()` y encapsular estrategia de seleccion con extension point. |
| `src/app/game/sudoku-game.service.spec.ts` | Modified | Cubrir garantias de unicidad y comportamiento de nuevo juego con semilla aleatoria controlada. |
| `src/app/game/` (nuevo modulo auxiliar) | New | Añadir helper de validacion/contador de soluciones para uso en pruebas o verificacion de dataset. |
| `openspec/changes/sudoku-unica-solucion/*` | Modified | Documentar propuesta, specs delta y tareas del cambio. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Seed no realmente unico dentro del catalogo | Med | Validacion automatizada por test de conteo de soluciones para cada seed antes de merge. |
| Catalogo pequeno genera percepcion de repeticion | Med | Incluir varias seeds iniciales y regla anti-repeticion inmediata; ampliar dataset por lotes. |
| Pruebas flaky por aleatoriedad | Low | Inyectar/fijar fuente aleatoria en tests y verificar comportamiento determinista. |
| Deuda tecnica por acoplar seleccion de puzzle al servicio | Low | Introducir interfaz/estrategia de fuente de puzzles desde esta iteracion. |

## Rollback Plan

Si se detectan regresiones, revertir la seleccion al seed unico actual en `SudokuGameService` manteniendo intacta la API publica del servicio. Desactivar temporalmente el catalogo curado y dejar las pruebas de unicidad marcadas para reevaluar el dataset antes de reintentar.

## Dependencies

- Dataset inicial de puzzles Sudoku validados offline con solucion unica.
- Capacidad de ejecutar suite de pruebas del proyecto en CI/local para validar unicidad.

## Success Criteria

- [x] Cada accion de `Nuevo juego` usa un puzzle proveniente del catalogo `verified-unique`.
- [x] Suite automatizada verifica que cada seed activa tiene exactamente una solucion.
- [x] `SudokuGameService` mantiene compatibilidad con flujo actual (`newGame`, `resetGame`, edicion) sin regresiones funcionales.
- [x] El sistema evita repetir inmediatamente el mismo puzzle cuando existen alternativas en el catalogo.
