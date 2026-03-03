import { CuratedPuzzleSource } from './puzzle-source';
import type { SudokuPuzzleSeed } from './puzzle-seeds';

const BASE_BOARD = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
] as const;

function createSeed(
  id: string,
  options?: Partial<Pick<SudokuPuzzleSeed, 'active' | 'verifiedUnique'>>,
): SudokuPuzzleSeed {
  return {
    id,
    name: id,
    difficulty: 'easy',
    active: options?.active ?? true,
    verifiedUnique: options?.verifiedUnique ?? true,
    initialBoard: BASE_BOARD.map((row) => [...row]) as SudokuPuzzleSeed['initialBoard'],
  };
}

describe('CuratedPuzzleSource', () => {
  it('lists only active and verified-unique puzzles', () => {
    const source = new CuratedPuzzleSource([
      createSeed('eligible-a'),
      createSeed('inactive', { active: false }),
      createSeed('not-verified', { verifiedUnique: false }),
      createSeed('eligible-b'),
    ]);

    expect(source.listActivePuzzles().map((seed) => seed.id)).toEqual(['eligible-a', 'eligible-b']);
  });

  it('throws a controlled error when no active curated puzzle exists', () => {
    const source = new CuratedPuzzleSource([
      createSeed('inactive', { active: false }),
      createSeed('not-verified', { verifiedUnique: false }),
    ]);

    expect(() => source.nextPuzzle({})).toThrowError(
      'Curated puzzle catalog has no active verified-unique puzzles.',
    );
  });

  it('avoids immediate repeat when an alternative exists', () => {
    const source = new CuratedPuzzleSource(
      [createSeed('seed-a'), createSeed('seed-b')],
      () => 0,
    );

    const next = source.nextPuzzle({ lastPuzzleId: 'seed-a' });

    expect(next.id).toBe('seed-b');
  });

  it('allows repeat when only one selectable puzzle exists', () => {
    const source = new CuratedPuzzleSource([createSeed('seed-a')], () => 0);

    const next = source.nextPuzzle({ lastPuzzleId: 'seed-a' });

    expect(next.id).toBe('seed-a');
  });
});
