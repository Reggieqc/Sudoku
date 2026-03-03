## Exploration: Nuevo juego con Sudoku de solucion unica

### Current State
- `Nuevo juego` dispara `onNewGame()` en `AppComponent`, que delega en `SudokuGameService.newGame()` sin logica adicional.
- `newGame()` hoy toma un seed con `getRandomPuzzleSeed()`, clona `initialBoard` y crea estado; no existe generador ni solucionador en runtime.
- El catalogo de puzzles (`SUDOKU_PUZZLE_SEEDS`) contiene 1 solo seed, por lo que cada click termina en el mismo tablero base (solo cambia el ciclo de estado).
- El sistema actual valida conflictos y estado resuelto, pero no valida cantidad de soluciones de un puzzle.
- Las pruebas cubren reset/nuevo juego a nivel de estado UI/servicio, pero no incluyen garantias de unicidad de solucion.

### Affected Areas
- `src/app/game/sudoku-game.service.ts` — punto central de `newGame`; aqui debe conectarse una estrategia que garantice puzzle con solucion unica.
- `src/app/game/puzzle-seeds.ts` — hoy define seeds estaticos; si se mantiene estrategia por catalogo, aqui vive el contrato de puzzles pre-validados.
- `src/app/app.component.ts` y `src/app/app.component.html` — el boton ya usa la ruta correcta; impacto bajo, pero puede requerir estado de carga si generar puzzle tarda.
- `src/app/game/sudoku-game.service.spec.ts` — debe agregar asserts de "nuevo juego produce puzzle valido con solucion unica" y comportamiento estable.
- `src/app/game/` (nuevo modulo sugerido, p. ej. `sudoku-generator.ts`/`sudoku-solver.ts`) — necesario si se implementa garantia algoritmica en runtime.

### Approaches
1. **Catalogo de puzzles pre-validados con solucion unica** — ampliar seeds con varios tableros validados offline (cada uno con una unica solucion) y seleccionar aleatoriamente evitando repeticion inmediata.
   - Pros: Implementacion simple, bajo riesgo tecnico, tiempos de respuesta instantaneos en UI.
   - Cons: La garantia depende del proceso externo de curacion; variedad limitada al catalogo disponible.
   - Effort: Low.

2. **Generacion dinamica con verificador de conteo de soluciones** — generar tablero completo y remover pistas, verificando tras cada remocion que el contador de soluciones sea exactamente 1 (corte temprano al encontrar 2).
   - Pros: Garantia fuerte en runtime y variedad alta por click.
   - Cons: Complejidad alta (backtracking + heuristicas), costo de CPU en cliente, posible latencia visible sin optimizacion.
   - Effort: High.

### Recommendation
Empezar con **Approach 1** para cumplir rapido el requisito funcional de `Nuevo juego` con garantia de solucion unica y bajo riesgo en Angular cliente. Definir un contrato claro de seeds "verified-unique" y pruebas que validen cada seed contra un contador de soluciones en test. Dejar preparado un punto de extension en `SudokuGameService` (estrategia/factory de puzzle source) para evolucionar luego a generacion dinamica si se requiere mayor variedad.

### Risks
- Riesgo de calidad del dataset: un seed incorrectamente curado rompe la promesa de unicidad.
- Si el catalogo es pequeno, usuarios pueden percibir repeticion frecuente pese al "nuevo juego".
- Si se elige generacion dinamica desde el inicio, riesgo de degradacion de rendimiento en dispositivos lentos.
- Cambios en tests existentes de `newGame` pueden volverse fragiles si no se controla determinismo de aleatoriedad.

### Ready for Proposal
Yes — alcance claro: introducir una fuente de puzzles con garantia de solucion unica para `newGame`, actualizar pruebas y mantener comportamiento de reinicio/edicion actual.
