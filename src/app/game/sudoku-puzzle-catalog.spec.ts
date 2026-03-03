import {
  cloneBoard,
  SUDOKU_PUZZLE_SEEDS,
  type SudokuBoard,
  type SudokuPuzzleSeed,
} from './puzzle-seeds';
import { countSudokuSolutions } from './sudoku-solver-count';

// Test-only boundary: dataset uniqueness validation imports solver-count helper from *.spec.ts only.

interface CatalogViolation {
  id: string;
  solutionCount: number;
}

function listActiveCuratedSeeds(catalog: readonly SudokuPuzzleSeed[]): SudokuPuzzleSeed[] {
  return catalog.filter((seed) => seed.active && seed.verifiedUnique);
}

function collectUniquenessViolations(catalog: readonly SudokuPuzzleSeed[]): CatalogViolation[] {
  return listActiveCuratedSeeds(catalog)
    .map((seed) => ({
      id: seed.id,
      solutionCount: countSudokuSolutions(cloneBoard(seed.initialBoard), 2),
    }))
    .filter(({ solutionCount }) => solutionCount !== 1);
}

describe('Sudoku curated catalog uniqueness', () => {
  it('uses unique ids for each curated seed', () => {
    const ids = SUDOKU_PUZZLE_SEEDS.map((seed) => seed.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('uses 9x9 boards with values in range 0-9', () => {
    const allBoardsAreValid = SUDOKU_PUZZLE_SEEDS.every((seed) => {
      if (seed.initialBoard.length !== 9) {
        return false;
      }

      return seed.initialBoard.every(
        (row) => row.length === 9 && row.every((value) => Number.isInteger(value) && value >= 0 && value <= 9),
      );
    });

    expect(allBoardsAreValid).toBeTrue();
  });

  it('accepts only active curated puzzles with exactly one solution', () => {
    const violations = collectUniquenessViolations(SUDOKU_PUZZLE_SEEDS);

    expect(violations).withContext(`Uniqueness violations: ${JSON.stringify(violations)}`).toEqual([]);
  });

  it('flags invalid and non-unique active fixtures', () => {
    const invalidBoard = cloneBoard(SUDOKU_PUZZLE_SEEDS[0].initialBoard);
    invalidBoard[0][1] = invalidBoard[0][0];

    const nonUniqueBoard = Array.from({ length: 9 }, () => Array(9).fill(0)) as SudokuBoard;

    const fixtures: SudokuPuzzleSeed[] = [
      {
        id: 'fixture-invalid-no-solution',
        name: 'Invalid fixture',
        difficulty: 'easy',
        active: true,
        verifiedUnique: true,
        initialBoard: invalidBoard,
      },
      {
        id: 'fixture-non-unique-multiple-solutions',
        name: 'Non unique fixture',
        difficulty: 'easy',
        active: true,
        verifiedUnique: true,
        initialBoard: nonUniqueBoard,
      },
    ];

    const violations = collectUniquenessViolations(fixtures);

    expect(violations).toContain({
      id: 'fixture-invalid-no-solution',
      solutionCount: 0,
    });
    expect(violations).toContain({
      id: 'fixture-non-unique-multiple-solutions',
      solutionCount: 2,
    });
  });
});
