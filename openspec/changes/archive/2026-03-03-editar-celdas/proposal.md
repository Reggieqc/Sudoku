# Proposal: Permitir limpiar celdas editables

## Intent

Permitir que una celda editable vuelva al estado vacio desde la UI para corregir entradas sin reemplazarlas por otro digito. Esto resuelve una friccion actual donde borrar revierte al valor anterior, mientras mantiene intacta la proteccion de pistas fijas y el recalculo de validacion/estado resuelto.

## Scope

### In Scope
- Permitir que `updateCell` acepte `0` como valor valido para representar limpieza de una celda editable.
- Mapear entrada vacia (`''`) en la UI a `0` para activar el flujo de limpieza.
- Conservar el comportamiento existente para celdas fijas (sin cambios) y recalculo de conflictos/estado de juego tras limpiar.
- Actualizar pruebas de servicio y componente para cubrir limpieza exitosa y protecciones vigentes.

### Out of Scope
- Agregar nuevas acciones separadas de dominio (por ejemplo, `clearCell`).
- Cambios de UX mas amplios (atajos, botones dedicados, soporte especial para pegado).
- Refactor de arquitectura del tablero o del ciclo de deteccion de conflictos.

## Approach

Adoptar la ruta recomendada en exploracion: extender el flujo existente de `updateCell` para aceptar `0` (vacio interno) y mantener el resto de validaciones de entrada en UI para `1-9` o vacio. La limpieza usa el mismo camino de actualizacion para aprovechar recalculo centralizado de `invalid` y `status` sin duplicar logica.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/app.component.ts` | Modified | Convertir input vacio a `0` y mantener parseo de digitos validos. |
| `src/app/app.component.html` | Modified | Asegurar que restricciones de input no bloqueen borrar a vacio. |
| `src/app/game/sudoku-game.service.ts` | Modified | Permitir `0` en validacion de `updateCell` para celdas no fijas. |
| `src/app/game/sudoku-game.service.spec.ts` | Modified | Ajustar expectativa previa de rechazo de `0` y cubrir limpieza. |
| `src/app/app.component.spec.ts` | Modified | Verificar que borrar deja la celda editable vacia en UI. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Aceptar entradas no deseadas al flexibilizar validacion | Medium | Mantener regla estricta: solo `1-9` o vacio en UI; en servicio solo `0-9` con guardias actuales. |
| Regresion en proteccion de celdas fijas | Low | Reutilizar guardia existente `targetCell.fixed` y añadir prueba de no limpieza en fijas. |
| Inconsistencias de UX al pegar valores invalidos | Medium | Preservar comportamiento de revertir a valor previo para entradas fuera de contrato. |

## Rollback Plan

Revertir los cambios en componente y servicio para restablecer la regla previa (`updateCell` solo `1-9`) y restaurar pruebas originales. Como no hay cambios de datos persistentes ni migraciones, el rollback es solo de codigo.

## Dependencies

- Ninguna dependencia externa; solo actualizacion coordinada entre componente, servicio y pruebas.

## Success Criteria

- [ ] Borrar el contenido de una celda editable la deja vacia (valor interno `0`) sin revertir al valor previo.
- [ ] Intentar limpiar o editar una celda fija sigue sin efecto.
- [ ] Despues de limpiar, conflictos (`invalid`) y estado de juego (`IN_PROGRESS`/`SOLVED`) se recalculan correctamente.
- [ ] Suite de pruebas relevante de componente y servicio pasa con los nuevos casos de limpieza.
