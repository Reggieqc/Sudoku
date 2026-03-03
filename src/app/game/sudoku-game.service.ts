import { Injectable, type Signal, signal } from '@angular/core';
import { type CellValue, cloneBoard, type SudokuBoard } from './puzzle-seeds';
import { CURATED_PUZZLE_SOURCE, type PuzzleSource } from './puzzle-source';
import { findConflicts, isSolved } from './sudoku-validator';

const GRID_SIZE = 9;

export interface SudokuCell {
  row: number;
  col: number;
  value: CellValue;
  fixed: boolean;
  invalid: boolean;
}

export type SudokuGameStatus = 'in_progress' | 'solved';

export interface SudokuGameState {
  cells: SudokuCell[][];
  status: SudokuGameStatus;
  puzzleId: string;
}

export interface SudokuGameActions {
  newGame(): void;
  resetGame(): void;
  /**
   * Accepts integer values 0-9, where 0 clears an editable cell.
   */
  updateCell(row: number, col: number, value: number): void;
}

@Injectable({
  providedIn: 'root',
})
export class SudokuGameService implements SudokuGameActions {
  private readonly puzzleSource: PuzzleSource = CURATED_PUZZLE_SOURCE;

  private readonly stateSignal = signal<SudokuGameState>({
    cells: [],
    status: 'in_progress',
    puzzleId: '',
  });

  private initialBoard: SudokuBoard = [];

  readonly gameState: Signal<SudokuGameState> = this.stateSignal.asReadonly();

  constructor() {
    this.newGame();
  }

  newGame(): void {
    const puzzleSeed = this.puzzleSource.nextPuzzle({
      lastPuzzleId: this.stateSignal().puzzleId || undefined,
    });

    this.initialBoard = cloneBoard(puzzleSeed.initialBoard);
    this.stateSignal.set(this.createStateFromBoard(puzzleSeed.id, this.initialBoard));
  }

  resetGame(): void {
    const currentState = this.stateSignal();

    if (currentState.puzzleId.length === 0 || this.initialBoard.length === 0) {
      this.newGame();
      return;
    }

    this.stateSignal.set(
      this.createStateFromBoard(currentState.puzzleId, cloneBoard(this.initialBoard)),
    );
  }

  updateCell(row: number, col: number, value: number): void {
    if (!this.isWithinGrid(row, col)) {
      return;
    }

    if (!this.isAllowedInput(value)) {
      return;
    }

    const currentState = this.stateSignal();
    const targetCell = currentState.cells[row]?.[col];

    if (!targetCell || targetCell.fixed) {
      return;
    }

    const updatedCells = currentState.cells.map((stateRow, rowIndex) =>
      stateRow.map((cell, colIndex) => {
        if (rowIndex !== row || colIndex !== col) {
          return cell;
        }

        return {
          ...cell,
          value,
        };
      }),
    );

    this.stateSignal.set(this.createStateFromCells(currentState.puzzleId, updatedCells));
  }

  private createStateFromBoard(puzzleId: string, board: SudokuBoard): SudokuGameState {
    const cells = board.map((rowValues, rowIndex) =>
      rowValues.map((cellValue, colIndex) => ({
        row: rowIndex,
        col: colIndex,
        value: cellValue,
        fixed: cellValue !== 0,
        invalid: false,
      })),
    );

    return this.createStateFromCells(puzzleId, cells);
  }

  private createStateFromCells(puzzleId: string, cells: SudokuCell[][]): SudokuGameState {
    const board = cells.map((row) => row.map((cell) => cell.value)) as SudokuBoard;
    const conflicts = findConflicts(board);

    const cellsWithInvalidState = cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        ...cell,
        invalid: conflicts.cells[rowIndex][colIndex],
      })),
    );

    return {
      cells: cellsWithInvalidState,
      status: isSolved(board, conflicts) ? 'solved' : 'in_progress',
      puzzleId,
    };
  }

  private isAllowedInput(value: number): value is CellValue {
    return Number.isInteger(value) && value >= 0 && value <= GRID_SIZE;
  }

  private isWithinGrid(row: number, col: number): boolean {
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
  }
}
