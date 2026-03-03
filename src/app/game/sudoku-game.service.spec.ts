import { TestBed } from '@angular/core/testing';
import { CURATED_PUZZLE_SOURCE, CuratedPuzzleSource } from './puzzle-source';
import { cloneBoard, SUDOKU_PUZZLE_SEEDS, type SudokuPuzzleSeed } from './puzzle-seeds';
import { SudokuGameService } from './sudoku-game.service';

describe('SudokuGameService', () => {
  let service: SudokuGameService;
  const solution: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  function createSeedFixture(id: string): SudokuPuzzleSeed {
    return {
      ...SUDOKU_PUZZLE_SEEDS[0],
      id,
      name: id,
      initialBoard: cloneBoard(SUDOKU_PUZZLE_SEEDS[0].initialBoard),
    };
  }

  function usePuzzleSourceFixture(source: CuratedPuzzleSource): void {
    (service as any).puzzleSource = source;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SudokuGameService);
  });

  it('initializes with a 9x9 board and in-progress status', () => {
    const state = service.gameState();

    expect(state.cells.length).toBe(9);
    expect(state.cells.every((row) => row.length === 9)).toBeTrue();
    expect(state.cells.flat().length).toBe(81);
    expect(state.status).toBe('in_progress');
    expect(state.puzzleId.length).toBeGreaterThan(0);
  });

  it('ignores edits to fixed cells', () => {
    const fixedCell = service.gameState().cells.flat().find((cell) => cell.fixed);
    expect(fixedCell).toBeDefined();

    const before = service.gameState().cells[fixedCell!.row][fixedCell!.col].value;
    const attempted = before === 9 ? 8 : 9;

    service.updateCell(fixedCell!.row, fixedCell!.col, attempted);

    const after = service.gameState().cells[fixedCell!.row][fixedCell!.col].value;
    expect(after).toBe(before);
  });

  it('ignores out-of-range and non-integer values without changing existing editable value', () => {
    const editableCell = service.gameState().cells.flat().find((cell) => !cell.fixed);
    expect(editableCell).toBeDefined();

    service.updateCell(editableCell!.row, editableCell!.col, 4);

    const before = service.gameState().cells[editableCell!.row][editableCell!.col].value;
    expect(before).toBe(4);

    service.updateCell(editableCell!.row, editableCell!.col, 10);
    service.updateCell(editableCell!.row, editableCell!.col, 4.5);

    const after = service.gameState().cells[editableCell!.row][editableCell!.col].value;
    expect(after).toBe(before);
  });

  it('clears an editable cell to 0', () => {
    const editableCell = service.gameState().cells.flat().find((cell) => !cell.fixed);
    expect(editableCell).toBeDefined();

    service.updateCell(editableCell!.row, editableCell!.col, 7);
    expect(service.gameState().cells[editableCell!.row][editableCell!.col].value).toBe(7);

    service.updateCell(editableCell!.row, editableCell!.col, 0);

    expect(service.gameState().cells[editableCell!.row][editableCell!.col].value).toBe(0);
  });

  it('keeps values unchanged when clearing an already empty editable cell', () => {
    const editableCell = service.gameState().cells.flat().find((cell) => !cell.fixed && cell.value === 0);
    expect(editableCell).toBeDefined();

    const beforeValues = service.gameState().cells.map((row) => row.map((cell) => cell.value));

    service.updateCell(editableCell!.row, editableCell!.col, 0);

    const afterValues = service.gameState().cells.map((row) => row.map((cell) => cell.value));

    expect(afterValues).toEqual(beforeValues);
    expect(service.gameState().cells[editableCell!.row][editableCell!.col].value).toBe(0);
  });

  it('keeps fixed-cell value when clear is attempted', () => {
    const fixedCell = service.gameState().cells.flat().find((cell) => cell.fixed);
    expect(fixedCell).toBeDefined();

    const before = service.gameState().cells[fixedCell!.row][fixedCell!.col].value;

    service.updateCell(fixedCell!.row, fixedCell!.col, 0);

    const after = service.gameState().cells[fixedCell!.row][fixedCell!.col].value;
    expect(after).toBe(before);
  });

  it('resets editable cells while preserving fixed clues', () => {
    const initialState = service.gameState();
    const editableCell = initialState.cells.flat().find((cell) => !cell.fixed);
    expect(editableCell).toBeDefined();

    service.updateCell(editableCell!.row, editableCell!.col, 1);
    const changedValue = service.gameState().cells[editableCell!.row][editableCell!.col].value;
    expect(changedValue).toBe(1);

    service.resetGame();
    const resetState = service.gameState();

    expect(resetState.cells[editableCell!.row][editableCell!.col].value).toBe(0);
    expect(resetState.cells.flat().filter((cell) => cell.fixed).length).toBe(
      initialState.cells.flat().filter((cell) => cell.fixed).length,
    );
    expect(resetState.puzzleId).toBe(initialState.puzzleId);
  });

  it('newGame reinitializes puzzle state and clears progress', () => {
    const initialState = service.gameState();
    const editableCell = initialState.cells.flat().find((cell) => !cell.fixed);
    expect(editableCell).toBeDefined();

    service.updateCell(editableCell!.row, editableCell!.col, 2);
    expect(service.gameState().cells[editableCell!.row][editableCell!.col].value).toBe(2);

    service.newGame();
    const nextState = service.gameState();

    expect(nextState.cells.length).toBe(9);
    expect(nextState.cells.flat().length).toBe(81);
    expect(nextState.status).toBe('in_progress');
    expect(nextState.puzzleId.length).toBeGreaterThan(0);

    if (nextState.puzzleId === initialState.puzzleId) {
      expect(nextState.cells[editableCell!.row][editableCell!.col].value).toBe(0);
    }
  });

  it('selects new games from the curated active puzzle source', () => {
    const activePuzzleIds = new Set(CURATED_PUZZLE_SOURCE.listActivePuzzles().map((seed) => seed.id));

    service.newGame();

    expect(activePuzzleIds.has(service.gameState().puzzleId)).toBeTrue();
  });

  it('passes current puzzleId as lastPuzzleId when selecting a new puzzle', () => {
    const nextPuzzleSpy = spyOn(CURATED_PUZZLE_SOURCE, 'nextPuzzle').and.callThrough();
    const currentPuzzleId = service.gameState().puzzleId;

    service.newGame();

    expect(nextPuzzleSpy).toHaveBeenCalledWith({ lastPuzzleId: currentPuzzleId });
  });

  it('builds state from the selected seed and clones the seed board', () => {
    const selectedSeed = {
      ...SUDOKU_PUZZLE_SEEDS[0],
      id: 'service-selected-seed',
      initialBoard: cloneBoard(SUDOKU_PUZZLE_SEEDS[0].initialBoard),
    };
    const nextPuzzleSpy = spyOn(CURATED_PUZZLE_SOURCE, 'nextPuzzle').and.returnValue(selectedSeed);

    service.newGame();

    const state = service.gameState();
    const values = state.cells.map((row) => row.map((cell) => cell.value));
    expect(nextPuzzleSpy).toHaveBeenCalled();
    expect(state.puzzleId).toBe('service-selected-seed');
    expect(values).toEqual(selectedSeed.initialBoard);

    selectedSeed.initialBoard[0][0] = 0;
    expect(service.gameState().cells[0][0].value).toBe(5);
  });

  it('avoids immediate repeat at service level when fixture source has alternatives', () => {
    usePuzzleSourceFixture(
      new CuratedPuzzleSource([createSeedFixture('fixture-a'), createSeedFixture('fixture-b')], () => 0),
    );

    service.newGame();
    const firstPuzzleId = service.gameState().puzzleId;

    service.newGame();
    const secondPuzzleId = service.gameState().puzzleId;

    expect(firstPuzzleId).toBe('fixture-a');
    expect(secondPuzzleId).toBe('fixture-b');
  });

  it('allows repeat at service level when fixture source has one puzzle', () => {
    usePuzzleSourceFixture(new CuratedPuzzleSource([createSeedFixture('fixture-only')], () => 0));

    service.newGame();
    const firstPuzzleId = service.gameState().puzzleId;

    service.newGame();
    const secondPuzzleId = service.gameState().puzzleId;

    expect(firstPuzzleId).toBe('fixture-only');
    expect(secondPuzzleId).toBe('fixture-only');
  });

  it('keeps editable-cell clear behavior after curated newGame selection', () => {
    usePuzzleSourceFixture(new CuratedPuzzleSource([createSeedFixture('fixture-clear')], () => 0));
    service.newGame();

    const editableCell = service.gameState().cells.flat().find((cell) => !cell.fixed);
    expect(editableCell).toBeDefined();

    service.updateCell(editableCell!.row, editableCell!.col, 6);
    expect(service.gameState().cells[editableCell!.row][editableCell!.col].value).toBe(6);

    service.updateCell(editableCell!.row, editableCell!.col, 0);
    expect(service.gameState().cells[editableCell!.row][editableCell!.col].value).toBe(0);
  });

  it('keeps fixed-cell clear and overwrite as no-op after curated newGame selection', () => {
    usePuzzleSourceFixture(new CuratedPuzzleSource([createSeedFixture('fixture-fixed')], () => 0));
    service.newGame();

    const fixedCell = service.gameState().cells.flat().find((cell) => cell.fixed);
    expect(fixedCell).toBeDefined();

    const before = service.gameState().cells[fixedCell!.row][fixedCell!.col].value;
    const overwriteAttempt = before === 9 ? 8 : 9;

    service.updateCell(fixedCell!.row, fixedCell!.col, 0);
    service.updateCell(fixedCell!.row, fixedCell!.col, overwriteAttempt);

    const after = service.gameState().cells[fixedCell!.row][fixedCell!.col].value;
    expect(after).toBe(before);
  });

  it('recomputes conflicts and status after an accepted clear', () => {
    usePuzzleSourceFixture(new CuratedPuzzleSource([createSeedFixture('fixture-solution')], () => 0));
    service.newGame();

    const state = service.gameState();

    for (let row = 0; row < state.cells.length; row += 1) {
      for (let col = 0; col < state.cells[row].length; col += 1) {
        if (!state.cells[row][col].fixed) {
          service.updateCell(row, col, solution[row][col]);
        }
      }
    }

    expect(service.gameState().status).toBe('solved');

    const conflictRow = service
      .gameState()
      .cells.find((row) => row.filter((cell) => !cell.fixed).length >= 2);
    expect(conflictRow).toBeDefined();

    const [firstEditable, secondEditable] = conflictRow!.filter((cell) => !cell.fixed);
    service.updateCell(firstEditable.row, firstEditable.col, secondEditable.value);

    let currentState = service.gameState();
    expect(currentState.cells[firstEditable.row][firstEditable.col].invalid).toBeTrue();
    expect(currentState.cells[secondEditable.row][secondEditable.col].invalid).toBeTrue();
    expect(currentState.status).toBe('in_progress');

    service.updateCell(firstEditable.row, firstEditable.col, 0);

    currentState = service.gameState();
    expect(currentState.cells[firstEditable.row][firstEditable.col].value).toBe(0);
    expect(currentState.cells[firstEditable.row][firstEditable.col].invalid).toBeFalse();
    expect(currentState.cells[secondEditable.row][secondEditable.col].invalid).toBeFalse();
    expect(currentState.status).toBe('in_progress');
  });

  it('marks game as solved when all editable cells are filled correctly', () => {
    usePuzzleSourceFixture(new CuratedPuzzleSource([createSeedFixture('fixture-solution')], () => 0));
    service.newGame();

    const state = service.gameState();

    for (let row = 0; row < state.cells.length; row += 1) {
      for (let col = 0; col < state.cells[row].length; col += 1) {
        if (!state.cells[row][col].fixed) {
          service.updateCell(row, col, solution[row][col]);
        }
      }
    }

    const solvedState = service.gameState();

    expect(solvedState.status).toBe('solved');
    expect(solvedState.cells.flat().some((cell) => cell.invalid)).toBeFalse();
  });
});
