import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CuratedPuzzleSource } from './game/puzzle-source';
import { cloneBoard, SUDOKU_PUZZLE_SEEDS, type SudokuPuzzleSeed } from './game/puzzle-seeds';
import { SudokuGameService } from './game/sudoku-game.service';

function setCellInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function createSeedFixture(id: string, board: SudokuPuzzleSeed['initialBoard']): SudokuPuzzleSeed {
  return {
    ...SUDOKU_PUZZLE_SEEDS[0],
    id,
    name: id,
    initialBoard: cloneBoard(board),
  };
}

function usePuzzleSourceFixture(source: CuratedPuzzleSource): void {
  const service = TestBed.inject(SudokuGameService);
  (service as any).puzzleSource = source;
  service.newGame();
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    const defaultSeed = createSeedFixture('default-fixture', SUDOKU_PUZZLE_SEEDS[0].initialBoard);
    usePuzzleSourceFixture(new CuratedPuzzleSource([defaultSeed], () => 0));
  });

  it('renders a 9x9 board with fixed and editable cells', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const cells = host.querySelectorAll<HTMLInputElement>('.board-cell');

    expect(cells.length).toBe(81);
    expect(Array.from(cells).some((cell) => cell.readOnly)).toBeTrue();
    expect(Array.from(cells).some((cell) => !cell.readOnly)).toBeTrue();
  });

  it('resets user-entered values when reset control is used', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const editableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');
    const resetButton = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Reiniciar'),
    );

    expect(editableCell).toBeTruthy();
    expect(resetButton).toBeTruthy();

    setCellInputValue(editableCell!, '4');
    fixture.detectChanges();
    expect(editableCell!.value).toBe('4');

    resetButton!.click();
    fixture.detectChanges();

    const updatedEditableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');
    expect(updatedEditableCell?.value).toBe('');
  });

  it('starts a fresh puzzle state when new game control is used', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const editableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');
    const newGameButton = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Nuevo juego'),
    );

    expect(editableCell).toBeTruthy();
    expect(newGameButton).toBeTruthy();

    setCellInputValue(editableCell!, '4');
    fixture.detectChanges();
    expect(editableCell!.value).toBe('4');

    newGameButton!.click();
    fixture.detectChanges();

    const updatedEditableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');
    expect(updatedEditableCell?.value).toBe('');
  });

  it('updates rendered cells to the selected puzzle board on new game', () => {
    const seedA = createSeedFixture('fixture-a', SUDOKU_PUZZLE_SEEDS[0].initialBoard);
    const secondBoard = cloneBoard(SUDOKU_PUZZLE_SEEDS[0].initialBoard);
    secondBoard[0][2] = 4;
    const seedB = createSeedFixture('fixture-b', secondBoard);

    usePuzzleSourceFixture(new CuratedPuzzleSource([seedA, seedB], () => 0.99));

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const newGameButton = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.includes('Nuevo juego'),
    );
    const boardCells = host.querySelectorAll<HTMLInputElement>('.board-cell');

    expect(newGameButton).toBeTruthy();
    expect(boardCells[2].value).toBe('4');

    newGameButton!.click();
    fixture.detectChanges();

    const updatedBoardCells = host.querySelectorAll<HTMLInputElement>('.board-cell');
    expect(updatedBoardCells[2].value).toBe('');
  });

  it('applies invalid visual state after conflicting input', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const firstRowCells = fixture.componentInstance.gameState().cells[0];
    const conflictingFixedCellModel = firstRowCells.find((cell) => cell.fixed && cell.value !== 0);
    const targetEditableCellModel = firstRowCells.find((cell) => !cell.fixed);

    expect(conflictingFixedCellModel).toBeTruthy();
    expect(targetEditableCellModel).toBeTruthy();

    const targetEditableCell = host.querySelector<HTMLInputElement>(
      `input[aria-label="Row ${targetEditableCellModel!.row + 1} Column ${targetEditableCellModel!.col + 1}, editable"]`,
    );

    expect(targetEditableCell).toBeTruthy();

    setCellInputValue(targetEditableCell!, String(conflictingFixedCellModel!.value));
    fixture.detectChanges();

    const updatedTargetCell = host.querySelector<HTMLInputElement>(
      `input[aria-label="Row ${targetEditableCellModel!.row + 1} Column ${targetEditableCellModel!.col + 1}, editable"]`,
    );
    const conflictingFixedCell = host.querySelector<HTMLInputElement>(
      `input[aria-label="Row ${conflictingFixedCellModel!.row + 1} Column ${conflictingFixedCellModel!.col + 1}, fixed"]`,
    );

    expect(updatedTargetCell?.classList.contains('board-cell--invalid')).toBeTrue();
    expect(updatedTargetCell?.getAttribute('aria-invalid')).toBe('true');
    expect(conflictingFixedCell?.classList.contains('board-cell--invalid')).toBeTrue();
  });

  it('renders editable cell as empty string after clearing input', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const editableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');

    expect(editableCell).toBeTruthy();
    expect(editableCell?.getAttribute('maxlength')).toBe('1');
    expect(editableCell?.getAttribute('pattern')).toBe('[1-9]');
    expect(editableCell?.getAttribute('inputmode')).toBe('numeric');

    setCellInputValue(editableCell!, '4');
    fixture.detectChanges();
    expect(editableCell!.value).toBe('4');
    expect(fixture.componentInstance.gameState().cells[0][2].value).toBe(4);

    setCellInputValue(editableCell!, '');
    fixture.detectChanges();

    const updatedEditableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');
    expect(updatedEditableCell?.value).toBe('');
    expect(fixture.componentInstance.gameState().cells[0][2].value).toBe(0);
  });

  it('reverts displayed value to the last valid value after invalid input', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const editableCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');

    expect(editableCell).toBeTruthy();

    setCellInputValue(editableCell!, '4');
    fixture.detectChanges();
    expect(editableCell!.value).toBe('4');

    setCellInputValue(editableCell!, '12');
    fixture.detectChanges();
    expect(editableCell!.value).toBe('4');

    setCellInputValue(editableCell!, 'a');
    fixture.detectChanges();
    expect(editableCell!.value).toBe('4');
  });
});
