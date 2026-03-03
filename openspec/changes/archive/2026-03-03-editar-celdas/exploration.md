## Exploration: editar-celdas

### Current State
- The board already supports replacing an editable value with another digit `1-9` via `onCellInput` -> `updateCell`.
- Clearing a previously entered value is blocked: when input becomes empty (`rawValue.length !== 1`), UI restores the old value instead of writing empty.
- Service-level validation rejects `0` (`isAllowedInput` only accepts `1-9`), even though `0` is the board's internal empty state.
- Fixed clues are read-only in UI and guarded in service (`targetCell.fixed`), so they cannot be changed or cleared.
- Conflict highlighting and solved status are recomputed after every accepted update, so any clear operation should naturally affect `invalid` flags and `status`.

### Affected Areas
- `src/app/app.component.ts` — input parsing currently blocks empty string clears.
- `src/app/app.component.html` — input constraints (`pattern`, `maxlength`, input event path) shape edit/clear UX.
- `src/app/game/sudoku-game.service.ts` — `updateCell` validation currently disallows `0` clear value.
- `src/app/game/sudoku-game.service.spec.ts` — existing test asserts `0` is rejected; must be updated and expanded for clear behavior.
- `src/app/app.component.spec.ts` — should verify clearing by user interaction keeps cell empty.

### Approaches
1. **Extend `updateCell` to accept clear value (`0`)** — treat empty UI input as `0` and persist through existing update flow.
   - Pros: Reuses one mutation path; conflict/status recalculation remains centralized; minimal conceptual changes.
   - Cons: Requires changing existing test assumptions about rejected `0`.
   - Effort: Low.

2. **Add explicit clear action (`clearCell`) in service** — keep `updateCell` as `1-9` only, add dedicated API for empty.
   - Pros: Stronger API semantics (`update` vs `clear`); avoids broadening update validator.
   - Cons: More surface area; component must branch between two service calls; more tests for parallel APIs.
   - Effort: Medium.

### Recommendation
Use Approach 1. The domain already models empties as `0`, so allowing `0` in `updateCell` keeps state transitions simple and preserves the current architecture where recalculation is done in one place. In the component, map `''` to `0`, keep digit validation for `1-9`, and continue restoring displayed value after service update.

### Risks
- Regressing validation by accidentally allowing non-digit single characters or `0` typed directly to behave inconsistently across browsers.
- Breaking existing tests that currently encode "0 is invalid" behavior.
- UX ambiguity when users paste multi-character values; current behavior reverts value and should remain explicit.

### Ready for Proposal
Yes — scope is clear: support clear-to-empty for editable cells while preserving fixed-cell protection, conflict marking, and solved-status transitions.
