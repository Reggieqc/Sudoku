# Design: Nuevo juego con Sudoku de solucion unica

## Technical Approach

El cambio introduce una capa de origen de puzzles (`PuzzleSource`) para desacoplar `SudokuGameService.newGame()` del dataset actual y permitir evolucion futura a generacion runtime sin romper el contrato publico (`newGame`, `resetGame`, `updateCell`).

En fase 1, la implementacion concreta sera un catalogo curado en memoria con puzzles `verified-unique`, consumido por un selector con politica anti-repeticion inmediata: si hay alternativas, evita repetir el ultimo puzzle servido; si no hay alternativa, permite repeticion.

La garantia de unicidad se reforzara en pruebas automatizadas con un contador de soluciones por backtracking con corte temprano en 2 soluciones (`0`, `1`, `>=2`). Esto evita costo en runtime de produccion y falla rapido cuando el catalogo incluye seeds invalidos o ambiguos.

## Architecture Decisions

### Decision: Introducir abstraccion de origen de puzzles en capa de juego

**Choice**: Definir una interfaz `PuzzleSource` (o equivalente) en `src/app/game/` con una implementacion `CuratedPuzzleSource` que encapsula catalogo y seleccion.
**Alternatives considered**: Mantener `getRandomPuzzleSeed()` como funcion global sin interfaz; inyectar directamente arrays de seeds en el servicio.
**Rationale**: La interfaz crea el seam pedido por la spec para cambiar estrategia en el futuro sin alterar consumidores de `SudokuGameService`.

### Decision: Catalogo curado con metadato explicito de elegibilidad

**Choice**: Extender `SudokuPuzzleSeed` para fase 1 con metadatos de curacion (por ejemplo `verifiedUnique: true`, `active: true`) y publicar una coleccion activa para gameplay.
**Alternatives considered**: Mantener solo `id/name/difficulty/initialBoard`; separar metadata en archivo paralelo.
**Rationale**: Un contrato explicito hace auditable que `newGame` solo usa puzzles marcados para juego y simplifica el filtrado/validacion en tests.

### Decision: Politica anti-immediate-repeat con fallback determinista

**Choice**: El selector recibe `lastPuzzleId` y aplica: (1) elegir aleatorio del conjunto activo excluyendo `lastPuzzleId`; (2) si no hay candidatos, elegir del conjunto activo completo; (3) si catalogo activo vacio, lanzar error controlado de configuracion.
**Alternatives considered**: Permitir repeticion libre; usar cola circular en vez de aleatoriedad; fallback silencioso al seed hardcodeado.
**Rationale**: Cumple requerimiento SHOULD de no repeticion inmediata cuando hay alternativas, mantiene comportamiento definido cuando hay 1 puzzle, y evita estados silenciosos corruptos cuando no hay datos.

### Decision: Validar unicidad en pruebas con solver-count dedicado

**Choice**: Crear helper de test para contar soluciones Sudoku via backtracking y poda temprana a 2, usado para validar todas las seeds activas del catalogo.
**Alternatives considered**: Confiar solo en validacion offline manual; validar solo algunos seeds muestreados; ejecutar solver en runtime de `newGame`.
**Rationale**: La suite automatica se vuelve barrera de calidad del dataset sin penalizar performance de usuario final.

### Decision: Preservar contratos de board-editing sin cambios de API

**Choice**: Mantener invariantes de `updateCell`/`resetGame` y estructura de `SudokuGameState`; `newGame` solo cambia origen/seleccion del puzzle.
**Alternatives considered**: Cambiar firma de `newGame` para aceptar estrategia externa; resetear reglas de celdas fijas/editables en otra capa.
**Rationale**: El delta de board-editing exige compatibilidad funcional; mantener APIs reduce riesgo de regresion en UI y pruebas existentes.

## Data Flow

Flujo de `Nuevo juego` con fuente curada y anti-repeticion:

    AppComponent.onNewGame()
             |
             v
    SudokuGameService.newGame()
      - lee lastPuzzleId del estado actual
      - solicita seed a PuzzleSource
             |
             v
    CuratedPuzzleSource.nextPuzzle({ lastPuzzleId })
      - filtra catalogo activo y verified-unique
      - excluye lastPuzzleId si hay alternativas
      - selecciona aleatorio de candidatos
      - fallback: usa catalogo completo activo si no hay alternativa
             |
             v
    SudokuGameService
      - cloneBoard(seed.initialBoard)
      - createStateFromBoard(seed.id, board)
      - publica stateSignal

Flujo de validacion de unicidad en tests:

    curated catalog (active seeds)
             |
             v
    countSudokuSolutions(board, maxSolutions=2)
      - backtracking + validacion de candidatos
      - corta cuando encuentra 2
             |
             v
    expect(result).toBe(1) para cada seed activa

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/game/puzzle-seeds.ts` | Modify | Extender contrato de seed con metadatos de curacion (`verifiedUnique`, `active`) y ampliar catalogo inicial de fase 1. |
| `src/app/game/puzzle-source.ts` | Create | Definir interfaz `PuzzleSource`, tipos de seleccion (`lastPuzzleId`) e implementacion curada para gameplay. |
| `src/app/game/sudoku-game.service.ts` | Modify | Reemplazar dependencia a `getRandomPuzzleSeed()` por `PuzzleSource.nextPuzzle(...)`, persistir `lastPuzzleId` via `stateSignal().puzzleId`, y mantener API publica. |
| `src/app/game/sudoku-game.service.spec.ts` | Modify | Verificar que `newGame` usa catalogo curado, evita repeticion inmediata con >=2 seeds, y permite repeticion con 1 seed. |
| `src/app/game/sudoku-solver-count.ts` | Create | Implementar contador de soluciones reutilizable para tests (backtracking con limite de soluciones). |
| `src/app/game/sudoku-puzzle-catalog.spec.ts` | Create | Suite dedicada que recorre seeds activas y exige conteo de soluciones exactamente igual a 1. |

## Interfaces / Contracts

```ts
export interface SudokuPuzzleSeed {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialBoard: SudokuBoard;
  verifiedUnique: boolean;
  active: boolean;
}

export interface PuzzleSelectionContext {
  lastPuzzleId?: string;
}

export interface PuzzleSource {
  nextPuzzle(context: PuzzleSelectionContext): SudokuPuzzleSeed;
  listActivePuzzles(): readonly SudokuPuzzleSeed[];
}
```

```ts
// Testing-only helper contract
// Returns 0 (invalid/unsolved), 1 (unique), or >=2 (non-unique)
export function countSudokuSolutions(
  board: SudokuBoard,
  maxSolutions?: number,
): number;
```

Compatibilidad esperada del servicio (sin cambios de firma):

```ts
export interface SudokuGameActions {
  newGame(): void;
  resetGame(): void;
  updateCell(row: number, col: number, value: number): void;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Selector anti-repeticion inmediata | Casos para catalogo con 0, 1 y >=2 seeds; afirmar exclusion de `lastPuzzleId` cuando existen alternativas y fallback cuando no. |
| Unit | Integracion de `SudokuGameService.newGame` con `PuzzleSource` | Espiar/instrumentar fuente para confirmar que `newGame` consume solo seeds activos/curados y actualiza `puzzleId`/board correctamente. |
| Unit | Unicidad del catalogo activo | `sudoku-puzzle-catalog.spec.ts`: para cada seed `active && verifiedUnique`, `countSudokuSolutions(cloneBoard(seed.initialBoard), 2) === 1`. |
| Integration | Contratos de board-editing tras `newGame` | Mantener y ampliar pruebas existentes de limpiar editable y bloquear fixed en tableros provenientes del catalogo curado. |
| E2E | N/A actualmente | El proyecto no tiene suite E2E; se cubre con pruebas de servicio/componente y validacion de dataset. |

## Migration / Rollout

No migration required.

Rollout por fases:
1. Introducir `PuzzleSource` + catalogo curado fase 1.
2. Habilitar pruebas de unicidad del catalogo en CI.
3. Ampliar dataset progresivamente manteniendo `verifiedUnique`.

## Open Questions

- [x] Definir tamano minimo del catalogo fase 1 (recomendado: >= 5 seeds) para reducir repeticion percibida. **Outcome**: diferido a cambio de seguimiento; la implementacion actual conserva 1 seed activa y cumple la regla de fallback de anti-repeticion cuando no hay alternativas.
- [x] Confirmar si `sudoku-solver-count.ts` debe exportarse solo para tests o compartirse como util interno para futuros comandos de verificacion de dataset. **Outcome**: mantener uso solo en pruebas por ahora; no se usa en runtime de `newGame()` y queda como helper de validacion de catalogo.
