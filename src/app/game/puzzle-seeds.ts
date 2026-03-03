export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SudokuBoard = CellValue[][];

export interface SudokuPuzzleSeed {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialBoard: SudokuBoard;
}

export const SUDOKU_PUZZLE_SEEDS: readonly SudokuPuzzleSeed[] = [
  {
    id: 'classic-easy-001',
    name: 'Classic Starter',
    difficulty: 'easy',
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
];

export function cloneBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]) as SudokuBoard;
}

export function getPuzzleSeedById(id: string): SudokuPuzzleSeed | undefined {
  return SUDOKU_PUZZLE_SEEDS.find((seed) => seed.id === id);
}

export function getRandomPuzzleSeed(): SudokuPuzzleSeed {
  const randomIndex = Math.floor(Math.random() * SUDOKU_PUZZLE_SEEDS.length);

  return SUDOKU_PUZZLE_SEEDS[randomIndex];
}
