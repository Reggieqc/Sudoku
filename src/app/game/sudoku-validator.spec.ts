import { type SudokuBoard } from './puzzle-seeds';
import {
  findColumnConflicts,
  findConflicts,
  findRowConflicts,
  findSubgridConflicts,
  isSolved,
} from './sudoku-validator';

const SOLVED_BOARD: SudokuBoard = [
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

function cloneBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]) as SudokuBoard;
}

describe('sudoku-validator', () => {
  it('accepts valid entry positions without marking conflicts', () => {
    const board = cloneBoard(SOLVED_BOARD);
    board[0][2] = 0;
    board[0][2] = 4;

    const conflicts = findConflicts(board);

    expect(conflicts.hasConflicts).toBeFalse();
    expect(conflicts.cells[0][2]).toBeFalse();
  });

  it('detects row conflicts and marks all duplicate cells', () => {
    const board = cloneBoard(SOLVED_BOARD);
    board[0][2] = 5;

    const conflicts = findRowConflicts(board);

    expect(conflicts[0][0]).toBeTrue();
    expect(conflicts[0][2]).toBeTrue();
  });

  it('detects column conflicts and marks all duplicate cells', () => {
    const board = cloneBoard(SOLVED_BOARD);
    board[1][0] = 5;

    const conflicts = findColumnConflicts(board);

    expect(conflicts[0][0]).toBeTrue();
    expect(conflicts[1][0]).toBeTrue();
  });

  it('detects subgrid conflicts and marks all duplicate cells', () => {
    const board = cloneBoard(SOLVED_BOARD);
    board[1][1] = 5;

    const conflicts = findSubgridConflicts(board);

    expect(conflicts[0][0]).toBeTrue();
    expect(conflicts[1][1]).toBeTrue();
  });

  it('returns true for solved board with no conflicts', () => {
    expect(isSolved(SOLVED_BOARD)).toBeTrue();
  });

  it('returns false for incomplete or conflicting boards', () => {
    const incomplete = cloneBoard(SOLVED_BOARD);
    incomplete[8][8] = 0;

    const conflicting = cloneBoard(SOLVED_BOARD);
    conflicting[8][8] = 1;

    expect(isSolved(incomplete)).toBeFalse();
    expect(isSolved(conflicting)).toBeFalse();
  });
});
