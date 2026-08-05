# Que cambia

<!-- Una frase. Si necesitas tres, probablemente sean tres PRs. -->

## Fase

<!-- docs/DEPLOY.md §15. Trabajo de una fase futura se rechaza. -->

- [ ] Corresponde a la fase actual del proyecto

## Verificación

- [ ] `npm run verify` en verde localmente
- [ ] Build sin advertencias nuevas
- [ ] Presupuesto de rendimiento respetado (`npm run budget`)

## Contenido y datos

- [ ] Paridad ES/EN, o marcado explícitamente como no disponible
- [ ] Ningún valor de balance modificado a mano (`src/data/` es canon del juego)
- [ ] `DATA_VERSION` y la tabla de cambios van en este mismo PR, si aplica

## Docs

- [ ] La documentación afectada se actualiza aquí, no después
- [ ] `docs/MEMORIA.md` refleja las decisiones nuevas

## Riesgo

<!-- Que se rompe si esto sale mal, y como se revierte (docs/runbooks/rollback.md). -->
