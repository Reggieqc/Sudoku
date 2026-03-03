import { CellValue, SudokuBoard } from './puzzle-seeds';

export interface CellPosition {
  row: number;
  col: number;
}

export interface SudokuConflicts {
  hasConflicts: boolean;
  cells: boolean[][];
}

const GRID_SIZE = 9;
const SUBGRID_SIZE = 3;

function createConflictGrid(): boolean[][] {
  return Array.from({ length: GRID_SIZE }, () => Array<boolean>(GRID_SIZE).fill(false));
}

function valueIsFilled(value: CellValue): value is Exclude<CellValue, 0> {
  return value >= 1 && value <= 9;
}

function markDuplicatePositions(
  board: SudokuBoard,
  positions: CellPosition[],
  conflicts: boolean[][],
): void {
  const positionsByValue = new Map<CellValue, CellPosition[]>();

  for (const position of positions) {
    const value = board[position.row][position.col];

    if (!valueIsFilled(value)) {
      continue;
    }

    const entry = positionsByValue.get(value) ?? [];
    entry.push(position);
    positionsByValue.set(value, entry);
  }

  for (const duplicatePositions of positionsByValue.values()) {
    if (duplicatePositions.length < 2) {
      continue;
    }

    for (const duplicatePosition of duplicatePositions) {
      conflicts[duplicatePosition.row][duplicatePosition.col] = true;
    }
  }
}

export function findRowConflicts(board: SudokuBoard): boolean[][] {
  const conflicts = createConflictGrid();

  for (let row = 0; row < GRID_SIZE; row += 1) {
    const rowPositions = Array.from({ length: GRID_SIZE }, (_, col) => ({ row, col }));
    markDuplicatePositions(board, rowPositions, conflicts);
  }

  return conflicts;
}

export function findColumnConflicts(board: SudokuBoard): boolean[][] {
  const conflicts = createConflictGrid();

  for (let col = 0; col < GRID_SIZE; col += 1) {
    const columnPositions = Array.from({ length: GRID_SIZE }, (_, row) => ({ row, col }));
    markDuplicatePositions(board, columnPositions, conflicts);
  }

  return conflicts;
}

export function findSubgridConflicts(board: SudokuBoard): boolean[][] {
  const conflicts = createConflictGrid();

  for (let rowStart = 0; rowStart < GRID_SIZE; rowStart += SUBGRID_SIZE) {
    for (let colStart = 0; colStart < GRID_SIZE; colStart += SUBGRID_SIZE) {
      const subgridPositions: CellPosition[] = [];

      for (let row = rowStart; row < rowStart + SUBGRID_SIZE; row += 1) {
        for (let col = colStart; col < colStart + SUBGRID_SIZE; col += 1) {
          subgridPositions.push({ row, col });
        }
      }

      markDuplicatePositions(board, subgridPositions, conflicts);
    }
  }

  return conflicts;
}

export function findConflicts(board: SudokuBoard): SudokuConflicts {
  const mergedConflicts = createConflictGrid();
  const rowConflicts = findRowConflicts(board);
  const columnConflicts = findColumnConflicts(board);
  const subgridConflicts = findSubgridConflicts(board);

  let hasConflicts = false;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const isConflict = rowConflicts[row][col] || columnConflicts[row][col] || subgridConflicts[row][col];
      mergedConflicts[row][col] = isConflict;
      hasConflicts = hasConflicts || isConflict;
    }
  }

  return {
    hasConflicts,
    cells: mergedConflicts,
  };
}

export function isSolved(board: SudokuBoard, conflicts: SudokuConflicts = findConflicts(board)): boolean {
  if (conflicts.hasConflicts) {
    return false;
  }

  return board.every((row) => row.every((value) => valueIsFilled(value)));
}
