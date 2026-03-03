import { CommonModule } from '@angular/common';
import { Component, inject, type Signal } from '@angular/core';
import { SudokuGameService, type SudokuCell, type SudokuGameState } from './game/sudoku-game.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly gameService = inject(SudokuGameService);

  readonly gameState: Signal<SudokuGameState> = this.gameService.gameState;

  onCellInput(row: number, col: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    if (rawValue.length === 0) {
      this.gameService.updateCell(row, col, 0);
      input.value = this.displayValue(this.gameState().cells[row][col]);
      return;
    }

    if (rawValue.length !== 1 || !/[1-9]/.test(rawValue)) {
      input.value = this.displayValue(this.gameState().cells[row][col]);
      return;
    }

    const parsedValue = Number(rawValue);

    this.gameService.updateCell(row, col, parsedValue);
    input.value = this.displayValue(this.gameState().cells[row][col]);
  }

  onResetGame(): void {
    this.gameService.resetGame();
  }

  onNewGame(): void {
    this.gameService.newGame();
  }

  displayValue(cell: SudokuCell): string {
    return cell.value === 0 ? '' : String(cell.value);
  }

  cellAriaLabel(cell: SudokuCell): string {
    const row = cell.row + 1;
    const col = cell.col + 1;
    const state = cell.fixed ? 'fixed' : 'editable';
    return `Row ${row} Column ${col}, ${state}`;
  }
}
