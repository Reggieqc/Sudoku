export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SudokuBoard = CellValue[][];

export interface SudokuPuzzleSeed {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialBoard: SudokuBoard;
  verifiedUnique: boolean;
  active: boolean;
}

export const SUDOKU_PUZZLE_SEEDS: readonly SudokuPuzzleSeed[] = [
  {
    id: 'classic-easy-001',
    name: 'Classic Starter',
    difficulty: 'easy',
    verifiedUnique: true,
    active: true,
    initialBoard: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
  {
    id: 'classic-easy-002',
    name: 'Classic Crosshatch',
    difficulty: 'easy',
    verifiedUnique: true,
    active: true,
    initialBoard: [
      [5, 3, 0, 6, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
  {
    id: 'classic-easy-003',
    name: 'Classic Band Shift',
    difficulty: 'easy',
    verifiedUnique: true,
    active: true,
    initialBoard: [
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
    ],
  },
  {
    id: 'classic-easy-004',
    name: 'Classic Transpose',
    difficulty: 'easy',
    verifiedUnique: true,
    active: true,
    initialBoard: [
      [5, 6, 0, 8, 4, 7, 0, 0, 0],
      [3, 0, 9, 0, 0, 0, 6, 0, 0],
      [0, 0, 8, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 8, 0, 0, 4, 0],
      [7, 9, 0, 6, 0, 2, 0, 1, 8],
      [0, 5, 0, 0, 3, 0, 0, 9, 0],
      [0, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 6, 0, 0, 0, 8, 0, 7],
      [0, 0, 0, 3, 1, 6, 0, 5, 9],
    ],
  },
  {
    id: 'classic-easy-005',
    name: 'Classic Digit Shuffle',
    difficulty: 'easy',
    verifiedUnique: true,
    active: true,
    initialBoard: [
      [5, 7, 0, 0, 3, 0, 0, 0, 0],
      [4, 0, 0, 9, 1, 5, 0, 0, 0],
      [0, 1, 2, 0, 0, 0, 0, 4, 0],
      [2, 0, 0, 0, 4, 0, 0, 0, 7],
      [6, 0, 0, 2, 0, 7, 0, 0, 9],
      [3, 0, 0, 0, 8, 0, 0, 0, 4],
      [0, 4, 0, 0, 0, 0, 8, 2, 0],
      [0, 0, 0, 6, 9, 1, 0, 0, 5],
      [0, 0, 0, 0, 2, 0, 0, 3, 1],
    ],
  },
  {
    id: 'classic-easy-006',
    name: 'Classic Stack Swap',
    difficulty: 'easy',
    verifiedUnique: true,
    active: true,
    initialBoard: [
      [0, 3, 5, 0, 7, 0, 0, 0, 0],
      [0, 0, 6, 1, 9, 5, 0, 0, 0],
      [8, 9, 0, 0, 0, 0, 0, 6, 0],
      [0, 0, 8, 0, 6, 0, 0, 0, 3],
      [0, 0, 4, 8, 0, 3, 0, 0, 1],
      [0, 0, 7, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
];

export function cloneBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]) as SudokuBoard;
}

export function getPuzzleSeedById(id: string): SudokuPuzzleSeed | undefined {
  return SUDOKU_PUZZLE_SEEDS.find((seed) => seed.id === id);
}
