import { SUDOKU_PUZZLE_SEEDS, type SudokuPuzzleSeed } from './puzzle-seeds';

export interface PuzzleSelectionContext {
  lastPuzzleId?: string;
}

export interface PuzzleSource {
  nextPuzzle(context: PuzzleSelectionContext): SudokuPuzzleSeed;
  listActivePuzzles(): readonly SudokuPuzzleSeed[];
}

export class CuratedPuzzleSource implements PuzzleSource {
  constructor(
    private readonly catalog: readonly SudokuPuzzleSeed[],
    private readonly random: () => number = Math.random,
  ) {}

  nextPuzzle(context: PuzzleSelectionContext): SudokuPuzzleSeed {
    const activePuzzles = this.listActivePuzzles();

    if (activePuzzles.length === 0) {
      throw new Error('Curated puzzle catalog has no active verified-unique puzzles.');
    }

    const hasAlternatives = activePuzzles.length > 1;
    const candidates = hasAlternatives
      ? activePuzzles.filter((seed) => seed.id !== context.lastPuzzleId)
      : activePuzzles;
    const fallbackCandidates = candidates.length > 0 ? candidates : activePuzzles;
    const randomIndex = Math.floor(this.random() * fallbackCandidates.length);

    return fallbackCandidates[randomIndex];
  }

  listActivePuzzles(): readonly SudokuPuzzleSeed[] {
    return this.catalog.filter((seed) => seed.active && seed.verifiedUnique);
  }
}

export const CURATED_PUZZLE_SOURCE: PuzzleSource = new CuratedPuzzleSource(SUDOKU_PUZZLE_SEEDS);
