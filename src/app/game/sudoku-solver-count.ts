import type { CellValue, SudokuBoard } from './puzzle-seeds';
import { cloneBoard } from './puzzle-seeds';
import { findConflicts } from './sudoku-validator';

const GRID_SIZE = 9;
const SUBGRID_SIZE = 3;

interface CellPosition {
  row: number;
  col: number;
}

function isValidCellValue(value: number): value is CellValue {
  return Number.isInteger(value) && value >= 0 && value <= GRID_SIZE;
}

function hasValidBoardShape(board: SudokuBoard): boolean {
  if (board.length !== GRID_SIZE) {
    return false;
  }

  return board.every((row) => row.length === GRID_SIZE && row.every((value) => isValidCellValue(value)));
}

function isCandidateValid(board: SudokuBoard, row: number, col: number, candidate: CellValue): boolean {
  for (let index = 0; index < GRID_SIZE; index += 1) {
    if (board[row][index] === candidate || board[index][col] === candidate) {
      return false;
    }
  }

  const rowStart = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
  const colStart = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;

  for (let rowOffset = 0; rowOffset < SUBGRID_SIZE; rowOffset += 1) {
    for (let colOffset = 0; colOffset < SUBGRID_SIZE; colOffset += 1) {
      if (board[rowStart + rowOffset][colStart + colOffset] === candidate) {
        return false;
      }
    }
  }

  return true;
}

function collectCandidates(board: SudokuBoard, row: number, col: number): CellValue[] {
  const candidates: CellValue[] = [];

  for (let candidate = 1 as CellValue; candidate <= GRID_SIZE; candidate += 1) {
    if (isCandidateValid(board, row, col, candidate)) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

function findNextCell(board: SudokuBoard): { position: CellPosition; candidates: CellValue[] } | undefined {
  let nextPosition: CellPosition | undefined;
  let nextCandidates: CellValue[] | undefined;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }

      const candidates = collectCandidates(board, row, col);

      if (candidates.length === 0) {
        return {
          position: { row, col },
          candidates,
        };
      }

      if (!nextCandidates || candidates.length < nextCandidates.length) {
        nextPosition = { row, col };
        nextCandidates = candidates;

        if (candidates.length === 1) {
          return {
            position: nextPosition,
            candidates: nextCandidates,
          };
        }
      }
    }
  }

  if (!nextPosition || !nextCandidates) {
    return undefined;
  }

  return {
    position: nextPosition,
    candidates: nextCandidates,
  };
}

export function countSudokuSolutions(board: SudokuBoard, maxSolutions = 2): number {
  if (!hasValidBoardShape(board)) {
    return 0;
  }

  if (maxSolutions < 1) {
    return 0;
  }

  const workingBoard = cloneBoard(board);

  if (findConflicts(workingBoard).hasConflicts) {
    return 0;
  }

  let solutions = 0;

  const search = (): void => {
    if (solutions >= maxSolutions) {
      return;
    }

    const nextCell = findNextCell(workingBoard);

    if (!nextCell) {
      solutions += 1;
      return;
    }

    const { row, col } = nextCell.position;

    if (nextCell.candidates.length === 0) {
      return;
    }

    for (const candidate of nextCell.candidates) {
      workingBoard[row][col] = candidate;
      search();

      if (solutions >= maxSolutions) {
        workingBoard[row][col] = 0;
        return;
      }

      workingBoard[row][col] = 0;
    }
  };

  search();
  return solutions;
}
