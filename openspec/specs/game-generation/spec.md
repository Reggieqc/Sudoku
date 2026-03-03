# Game Generation Specification

## Purpose

Definir el contrato funcional de `Nuevo juego` para servir puzzles Sudoku desde un catalogo curado con garantia de solucion unica y reglas de seleccion predecibles para el usuario.

## Requirements

### Requirement: Unique Solution For Every Served Puzzle

The system MUST serve only puzzles that have exactly one valid Sudoku solution whenever `Nuevo juego` starts a game.

#### Scenario: New game serves a uniquely solvable puzzle

- GIVEN the curated puzzle catalog contains active puzzles marked for gameplay
- WHEN the user clicks `Nuevo juego`
- THEN the selected puzzle has exactly one valid solution
- AND the initial board state is created from that puzzle

#### Scenario: Uniqueness guarantee remains true across repeated new games

- GIVEN the user starts multiple games using `Nuevo juego`
- WHEN each game is initialized from the active catalog
- THEN every served puzzle has exactly one valid solution

### Requirement: New Game Uses Curated Catalog Source

The system SHALL source puzzles for `Nuevo juego` from the curated verified catalog and SHALL expose a puzzle-source seam that MAY be replaced in a future change without altering the public `newGame` behavior contract.

#### Scenario: New game selects puzzle from curated source

- GIVEN a curated catalog with one or more active puzzles
- WHEN `newGame` is executed
- THEN the selected puzzle belongs to that curated catalog

#### Scenario: Puzzle source implementation can change without behavior contract break

- GIVEN an alternative puzzle-source strategy is provided behind the same service contract
- WHEN `newGame` is executed through the public game service API
- THEN consumers observe the same `newGame` interaction contract
- AND the uniqueness requirement for served puzzles remains enforced

### Requirement: Anti-Immediate-Repeat Selection Policy

The system SHOULD avoid serving the same puzzle on two consecutive `Nuevo juego` actions when the active catalog has at least two selectable puzzles. The system MAY repeat the same puzzle only when no alternative puzzle is available.

#### Scenario: Avoid immediate repeat when alternatives exist

- GIVEN the active catalog contains at least two selectable puzzles
- AND the previous game used puzzle `A`
- WHEN the user clicks `Nuevo juego` again
- THEN the next served puzzle is not `A`

#### Scenario: Allow repeat when catalog has no alternative

- GIVEN the active catalog contains exactly one selectable puzzle
- AND that puzzle was used in the previous game
- WHEN the user clicks `Nuevo juego`
- THEN the same puzzle is served again

### Requirement: Catalog Uniqueness Validation In Automated Tests

The project test suite MUST include automated validation that each active puzzle in the curated catalog has exactly one valid solution and MUST fail when any active puzzle violates this rule.

#### Scenario: Validation passes for fully unique active catalog

- GIVEN every active puzzle in the curated catalog has exactly one valid solution
- WHEN the catalog uniqueness test suite runs
- THEN all uniqueness validation tests pass

#### Scenario: Validation fails for non-unique or invalid active puzzle

- GIVEN at least one active catalog puzzle has zero or multiple valid solutions
- WHEN the catalog uniqueness test suite runs
- THEN the suite fails and reports the violating puzzle entry
