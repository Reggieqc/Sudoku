# Tasks: Nuevo juego con Sudoku de solucion unica

## Phase 1: Foundation - PuzzleSource and Curated Catalog

- [x] 1.1 Update `src/app/game/puzzle-seeds.ts` to extend `SudokuPuzzleSeed` with `verifiedUnique` and `active`, and ensure every catalog entry defines both flags (trace: game-generation "New Game Uses Curated Catalog Source").
- [x] 1.2 Add `src/app/game/puzzle-source.ts` with `PuzzleSelectionContext`, `PuzzleSource`, and `CuratedPuzzleSource` contracts, including `nextPuzzle()` and `listActivePuzzles()` signatures from design.
- [x] 1.3 Implement curated catalog filtering in `CuratedPuzzleSource` so gameplay candidates are only seeds where `active === true && verifiedUnique === true` (trace: game-generation "Unique Solution For Every Served Puzzle").
- [x] 1.4 Add controlled error handling in `CuratedPuzzleSource.nextPuzzle()` for an empty active curated catalog (trace: design anti-repeat fallback decision).

## Phase 2: Core Behavior - newGame Selection and Anti-Repeat Policy

- [x] 2.1 Refactor `src/app/game/sudoku-game.service.ts` to depend on `PuzzleSource.nextPuzzle({ lastPuzzleId })` instead of direct random seed helpers while keeping `newGame()` public API unchanged.
- [x] 2.2 In `src/app/game/sudoku-game.service.ts`, pass `stateSignal().puzzleId` as `lastPuzzleId` when selecting the next puzzle (trace: design data flow).
- [x] 2.3 Implement anti-immediate-repeat selection in `src/app/game/puzzle-source.ts`: exclude `lastPuzzleId` when at least 2 candidates exist; allow repeat when only 1 candidate exists (trace: game-generation "Anti-Immediate-Repeat Selection Policy").
- [x] 2.4 Ensure selected seed still drives board cloning/state creation in `src/app/game/sudoku-game.service.ts` without changing `resetGame()` / `updateCell()` semantics (trace: board-editing compatibility requirement).

## Phase 3: Automated Uniqueness Validation (Solver-Count Strategy)

- [x] 3.1 Create `src/app/game/sudoku-solver-count.ts` implementing `countSudokuSolutions(board, maxSolutions = 2)` with backtracking and early stop at `>=2` solutions.
- [x] 3.2 Create `src/app/game/sudoku-puzzle-catalog.spec.ts` that iterates curated active seeds and asserts `countSudokuSolutions(cloneBoard(seed.initialBoard), 2) === 1` for each (trace: game-generation "Catalog Uniqueness Validation In Automated Tests").
- [x] 3.3 Add a negative-path test in `src/app/game/sudoku-puzzle-catalog.spec.ts` (or adjacent test helper spec) proving the suite reports/fails when a puzzle has 0 or multiple solutions.
- [x] 3.4 Keep solver-count logic test-only in usage scope (no runtime `newGame` dependency) and document intent in test file naming/import boundaries.

## Phase 4: Regression Coverage - Service and Board Editing Compatibility

- [x] 4.1 Update `src/app/game/sudoku-game.service.spec.ts` to verify `newGame()` selects puzzles from curated source only (trace: game-generation curated source scenario).
- [x] 4.2 Add deterministic tests in `src/app/game/sudoku-game.service.spec.ts` for anti-repeat with catalog size `>=2` and repeat-allowed behavior with catalog size `1`.
- [x] 4.3 Extend existing board-editing tests in `src/app/game/sudoku-game.service.spec.ts` (or the current board-editing spec file) to confirm clearing editable cells still sets `0` after curated `newGame()`.
- [x] 4.4 Extend fixed-cell regression tests to confirm attempts to clear/overwrite fixed cells remain no-op after curated `newGame()` (trace: board-editing delta scenarios).

## Phase 5: Verification and Closure

- [x] 5.1 Run the project test command(s) covering `src/app/game/**/*.spec.ts` and confirm uniqueness + anti-repeat + board-editing regressions pass together.
- [x] 5.2 Verify no public API signature changes for `newGame()`, `resetGame()`, and `updateCell()` in `src/app/game/sudoku-game.service.ts`.
- [x] 5.3 Cross-check implemented behavior against `openspec/changes/sudoku-unica-solucion/specs/game-generation/spec.md` and `openspec/changes/sudoku-unica-solucion/specs/board-editing/spec.md`, then mark completed checklist items.
- [x] 5.4 Record any unresolved design open question outcomes (catalog minimum size, solver helper exposure) in `openspec/changes/sudoku-unica-solucion/design.md` or follow-up change notes.

### Phase 5 Closure Notes (2026-03-03)

- Test evidence for 5.1: `npm test -- --watch=false --browsers=ChromeHeadless --no-progress --include "src/app/game/**/*.spec.ts"` -> `TOTAL: 29 SUCCESS`.
- API closure for 5.2: `src/app/game/sudoku-game.service.ts` keeps public signatures unchanged: `newGame(): void`, `resetGame(): void`, `updateCell(row: number, col: number, value: number): void`.
- Spec trace for 5.3: game-generation requirements covered by `src/app/game/puzzle-source.spec.ts`, `src/app/game/sudoku-puzzle-catalog.spec.ts`, and `src/app/game/sudoku-game.service.spec.ts`; board-editing delta scenarios covered by fixed/editable cell tests in `src/app/game/sudoku-game.service.spec.ts`.
- Checklist sync for 5.3: `openspec/changes/sudoku-unica-solucion/proposal.md` success criteria marked complete.
- Open-question outcomes for 5.4: recorded in `openspec/changes/sudoku-unica-solucion/design.md` (catalog minimum size deferred to follow-up; solver helper remains test-only for now).

## Post-Verify Regression Fixes (2026-03-03)

- [x] PV-1 Fix `Nuevo juego` UX regression by expanding the active curated catalog beyond one puzzle so selection changes can surface in UI.
- [x] PV-2 Add UI regression coverage in `src/app/app.component.spec.ts` to assert clicking `Nuevo juego` re-renders cell values from the newly selected puzzle board.
- [x] PV-3 Re-run focused regression suites for app + game generation (`app.component.spec.ts`, `sudoku-game.service.spec.ts`, `sudoku-puzzle-catalog.spec.ts`) and confirm all pass.
- [x] PV-4 Stabilize `app.component.spec.ts` conflict/editable-cell assertions against randomized curated puzzle selection by using deterministic test puzzle source setup and row-driven conflict targeting.
