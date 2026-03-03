# Board Editing Specification

## Purpose

Definir el comportamiento esperado al editar celdas del tablero cuando el usuario limpia una celda editable, preservando la inmutabilidad de pistas fijas y el recalculo de conflictos/estado resuelto.

## Requirements

### Requirement: Clear Editable Cell To Empty State

The system MUST allow an editable cell to transition to the internal empty value `0` when the user clears its UI input.

#### Scenario: Clear an editable cell with previous digit

- GIVEN an editable cell currently contains digit `7`
- WHEN the user clears the cell input to empty
- THEN the cell value becomes `0`
- AND the rendered input shows empty value

#### Scenario: Clear an already empty editable cell

- GIVEN an editable cell currently contains `0`
- WHEN the user clears the cell input to empty
- THEN the cell value remains `0`
- AND no other cell values change

### Requirement: UI Empty Input Mapping And Input Contract

The system MUST map UI empty input (`''`) to internal value `0` for editable cells. The system MUST accept only single digits `1-9` or empty input from the editing interaction.

#### Scenario: Accept valid single-digit replacement

- GIVEN an editable cell currently contains `0`
- WHEN the user enters a single digit `5`
- THEN the cell value becomes `5`

#### Scenario: Reject invalid non-contract input

- GIVEN an editable cell currently contains digit `4`
- WHEN the user enters an invalid value outside `1-9` and empty (for example `12` or `a`)
- THEN the cell value remains `4`

### Requirement: Fixed Cells Remain Immutable

The system MUST NOT change a fixed cell through edit or clear interactions.

#### Scenario: Attempt to clear fixed cell

- GIVEN a fixed cell currently contains digit `9`
- WHEN the user clears the cell input to empty
- THEN the cell value remains `9`
- AND no mutation is applied to that fixed cell

#### Scenario: Attempt to replace fixed cell digit

- GIVEN a fixed cell currently contains digit `2`
- WHEN the user enters digit `8`
- THEN the cell value remains `2`

### Requirement: Recalculate Conflicts And Solved Status After Accepted Clear

The system MUST recalculate conflict markers and game status after any accepted clear operation on editable cells.

#### Scenario: Clear removes an existing conflict

- GIVEN two editable cells conflict under Sudoku rules and at least one is marked invalid
- WHEN the user clears one conflicting editable cell
- THEN conflict markers are recomputed for affected cells
- AND game status is `IN_PROGRESS`

#### Scenario: Clear transitions solved board to in progress

- GIVEN the game status is `SOLVED`
- WHEN the user clears any editable cell
- THEN the cleared cell value becomes `0`
- AND game status transitions to `IN_PROGRESS`
