import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

function setCellInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
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

  it('applies invalid visual state after conflicting input', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const targetEditableCell = host.querySelector<HTMLInputElement>(
      'input[aria-label="Row 1 Column 3, editable"]',
    );

    expect(targetEditableCell).toBeTruthy();

    setCellInputValue(targetEditableCell!, '5');
    fixture.detectChanges();

    const updatedTargetCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 3, editable"]');
    const conflictingFixedCell = host.querySelector<HTMLInputElement>('input[aria-label="Row 1 Column 1, fixed"]');

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
