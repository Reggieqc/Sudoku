# Delta for Board Editing

## ADDED Requirements

### Requirement: Board Editing Contract Persists After New Game Changes

The system MUST preserve all existing board-editing behaviors for editable and fixed cells after introducing curated unique-solution puzzle selection for `Nuevo juego`.

#### Scenario: Editable cell clearing behavior remains unchanged in a new game board

- GIVEN a board started via `Nuevo juego` from the curated unique catalog
- AND an editable cell currently contains digit `6`
- WHEN the user clears the cell input to empty
- THEN the cell value becomes `0`
- AND the game continues to apply the established editing rules

#### Scenario: Fixed-cell immutability remains unchanged in a new game board

- GIVEN a board started via `Nuevo juego` from the curated unique catalog
- AND a fixed cell currently contains digit `3`
- WHEN the user attempts to clear or replace that fixed cell
- THEN the cell value remains `3`
- AND no mutation is applied to that fixed cell
