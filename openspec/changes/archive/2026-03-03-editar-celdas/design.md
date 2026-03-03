# Design: Permitir limpiar celdas editables

## Technical Approach

La implementacion extiende el flujo existente de edicion sin agregar nuevas acciones de dominio: `onCellInput` en UI normaliza `''` a `0` y sigue usando `updateCell(row, col, value)` como unico punto de mutacion. El servicio conserva guardias de rango, coordenadas y celdas fijas, y siempre recompone estado mediante `createStateFromCells` para recalcular `invalid` y `status` tras una limpieza aceptada, alineado con `board-editing/spec.md`.

## Architecture Decisions

### Decision: Reusar `updateCell` para reemplazo y limpieza

**Choice**: Permitir contrato de entrada `0-9` en `SudokuGameService.updateCell`, donde `0` representa vacio interno.
**Alternatives considered**: Crear API separada `clearCell(row, col)` y mantener `updateCell` limitado a `1-9`.
**Rationale**: Un unico camino de escritura evita duplicar validaciones e impide divergencias en recalculo de conflictos/estado entre editar y limpiar.

### Decision: Normalizar en UI y mantener contrato estricto de interaccion

**Choice**: En componente, mapear input vacio (`''`) a `0`; aceptar solo `1-9` o vacio; para cualquier entrada fuera de contrato, revertir visualmente al valor vigente de estado.
**Alternatives considered**: Dejar que el servicio filtre todos los invalidos sin reversion en UI; permitir longitudes >1 y truncar.
**Rationale**: La reversion inmediata mantiene semantica UX existente (sin estados intermedios ambiguos) y protege el servicio de ruido de eventos de input/pegado.

### Decision: Mantener inmutabilidad de pistas fijas en servicio como fuente de verdad

**Choice**: Conservar guardia `targetCell.fixed` en `updateCell` como control definitivo para bloquear edicion o limpieza de pistas.
**Alternatives considered**: Confiar solo en `readonly` del input.
**Rationale**: Las restricciones de UI no son garantia de integridad; la regla de dominio debe permanecer en capa de servicio para cualquier llamador.

## Data Flow

Edicion valida y limpieza siguen el mismo circuito:

    <input> (evento input)
        |
        v
    AppComponent.onCellInput
      - '' -> 0
      - '1'-'9' -> numero
      - invalido -> revertir y salir
        |
        v
    SudokuGameService.updateCell(row,col,value)
      - valida coordenadas y rango 0-9
      - rechaza fixed
      - aplica valor en celda editable
        |
        v
    createStateFromCells
      - findConflicts(board)
      - isSolved(board, conflicts)
      - emite nuevo gameState
        |
        v
    UI renderiza displayValue (0 => '')

Caso invalido en UI (`12`, `a`, etc.):
- No se invoca mutacion valida de dominio.
- Se restaura `input.value` desde `gameState` actual para preservar semantica de reversion.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/app.component.ts` | Modify | Asegurar mapeo `'' -> 0`, mantener parseo de un digito `1-9`, y reversion del input para entradas fuera de contrato. |
| `src/app/app.component.html` | Modify | Mantener restricciones de input (`maxlength=1`, `inputmode`, `pattern`) sin impedir transicion a vacio. |
| `src/app/game/sudoku-game.service.ts` | Modify | Definir contrato de `updateCell` para `0-9` con bloqueo de celdas fijas y recalculo de estado centralizado. |
| `src/app/game/sudoku-game.service.spec.ts` | Modify | Cubrir limpieza aceptada en editable, rechazo en fixed, y recalculo de `invalid`/`status` tras limpiar. |
| `src/app/app.component.spec.ts` | Modify | Verificar que limpiar en UI deja celda vacia y que entrada invalida revierte al valor previo. |

## Interfaces / Contracts

```ts
// UI interaction contract (AppComponent)
// Accepted raw input values from the cell interaction:
// - ''  => maps to 0
// - '1'..'9' => maps to 1..9
// - any other value => rejected and reverted in the input element
onCellInput(row: number, col: number, event: Event): void
```

```ts
// Domain contract (SudokuGameService)
// - row/col must be within 0..8
// - value must be integer 0..9
// - fixed cells are immutable (no-op)
// - accepted update always triggers recomputation of conflicts/status
updateCell(row: number, col: number, value: number): void
```

```ts
// State invariants after accepted clear (value = 0)
// - target editable cell value becomes 0
// - all invalid markers are recalculated from full board
// - status is recomputed and cannot remain 'solved' if any 0 exists
interface SudokuGameState {
  cells: SudokuCell[][];
  status: 'in_progress' | 'solved';
  puzzleId: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `updateCell` acepta `0` en editable y mantiene no-op en fixed | Casos en `sudoku-game.service.spec.ts` validando valor final y no mutacion de pistas. |
| Unit | Recalculo de conflictos y estado tras limpiar | Preparar conflicto/estado resuelto, limpiar una celda, afirmar `invalid` actualizado y `status` en `in_progress`. |
| Integration | Mapping UI `'' -> 0` y render vacio | Simular `input` vacio en `app.component.spec.ts`, ejecutar `detectChanges`, verificar `input.value === ''` y estado consistente. |
| Integration | Reversion de entrada invalida | Simular `input` con `12` o `a`, confirmar que el valor mostrado vuelve al ultimo valor valido. |
| E2E | N/A actualmente | No hay suite E2E en el proyecto; cobertura se mantiene en pruebas de componente + servicio. |

## Migration / Rollout

No migration required.

## Open Questions

- [ ] None.
