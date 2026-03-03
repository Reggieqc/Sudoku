# Tasks: Permitir limpiar celdas editables

## Phase 1: Service Contract Foundation

- [x] 1.1 Update `src/app/game/sudoku-game.service.ts` to document and enforce `updateCell(row, col, value)` accepting integer `0-9` (with `0` as empty) while keeping coordinate guards.
- [x] 1.2 Keep fixed-cell immutability in `src/app/game/sudoku-game.service.ts` (`targetCell.fixed` no-op) and ensure accepted clear/edit still routes through `createStateFromCells`.
- [x] 1.3 Validation checkpoint: in `src/app/game/sudoku-game.service.spec.ts`, add or adjust one focused test proving `updateCell(..., 10)` and non-integer inputs are ignored, preserving previous editable value.

## Phase 2: Component Input Handling

- [x] 2.1 Update `src/app/app.component.ts` `onCellInput` so `rawValue === ''` maps to `updateCell(row, col, 0)` and then re-syncs input using `displayValue`.
- [x] 2.2 Keep single-digit contract in `src/app/app.component.ts`: accept only one-character numeric input that parses to `1-9`; reject everything else by reverting `input.value` from current `gameState`.
- [x] 2.3 Confirm `src/app/app.component.html` input attributes (`maxlength="1"`, `pattern="[1-9]"`, `inputmode="numeric"`, `(input)` handler) remain compatible with clear-to-empty behavior.
- [x] 2.4 Validation checkpoint: run component interaction manually via existing test harness expectation in `src/app/app.component.spec.ts` to verify editable clear renders as empty string.

## Phase 3: Domain Behavior And Recalculation Coverage

- [x] 3.1 Update `src/app/game/sudoku-game.service.spec.ts` to replace prior assumption that `0` is rejected; add scenario where clearing an editable cell transitions value to `0`.
- [x] 3.2 Add service test in `src/app/game/sudoku-game.service.spec.ts` for fixed clue protection when clear is attempted (`updateCell(row, col, 0)` keeps original fixed value).
- [x] 3.3 Add service test in `src/app/game/sudoku-game.service.spec.ts` proving conflict and status recomputation after accepted clear (conflict removed and status becomes `in_progress` when board is no longer solved).

## Phase 4: UI Regression Tests And Verification

- [x] 4.1 Add component test in `src/app/app.component.spec.ts` covering clear flow: editable cell with prior digit receives empty input and re-renders empty while state stores `0`.
- [x] 4.2 Add component test in `src/app/app.component.spec.ts` for invalid interaction (`'12'` or `'a'`) confirming displayed value reverts to last valid value.
- [x] 4.3 Run `npm test -- --watch=false --include src/app/game/sudoku-game.service.spec.ts --include src/app/app.component.spec.ts` and ensure all new/updated scenarios pass.
- [x] 4.4 Final checkpoint: run `npm test -- --watch=false` to confirm no regressions outside board-editing flows.

## Phase 5: Post-verify Gap Closure

- [x] 5.1 Add focused coverage in `src/app/game/sudoku-game.service.spec.ts` for scenario "Clear an already empty editable cell", asserting value remains `0` and no other cell values change.
