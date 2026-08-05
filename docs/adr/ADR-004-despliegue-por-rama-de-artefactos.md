# ADR-004 — Despliegue por rama de artefactos con Git Version Control de cPanel

- **Estado:** DECIDIDO
- **Fecha:** 2026-08-04
- **Contexto de fase:** 0
- **Relación:** aplaza (no anula) el pipeline de rsync de `docs/DEPLOY.md` §9

## Contexto

Al intentar desplegar desde cPanel, el panel devolvió:

> The system cannot deploy. […] 2. A valid `.cpanel.yml` file exists.

El repositorio no tiene `.cpanel.yml`, y su ausencia era deliberada: el pipeline
principal de `DEPLOY.md` §9 es `rsync` sobre SSH desde GitHub Actions.

Pero ese pipeline está bloqueado por una dependencia que no controla el equipo
técnico: los secretos SSH (`SSH_HOST`, `SSH_PORT`, `SSH_USER`,
`SSH_PRIVATE_KEY`, rutas). Mientras no existan, no hay despliegue de ningún tipo,
y la fase 0 no puede cerrar su criterio de salida.

**El error de fondo no es la falta del archivo.** Es que añadir `.cpanel.yml` a
`main` produciría un desastre silencioso: **cPanel no construye el sitio.** Un
`cp -R ./*` desde `main` copiaría a `public_html` el código fuente — `src/`,
`docs/`, `scripts/`, `package.json`, `CLAUDE.md` — y **ningún `index.html`**,
porque el HTML solo existe tras `npm run build`. El sitio no funcionaría, y
quedarían accesibles archivos que no deben servirse.

## Opciones consideradas

| Opción | Resultado |
|---|---|
| `.cpanel.yml` en `main` | **Descartada.** Publica código fuente y ningún sitio |
| Commitear `dist/` a `main` | **Descartada.** Prohibido explícitamente (`CLAUDE.md`); ensucia el historial y multiplica el tamaño del repo |
| Esperar a los secretos SSH | Bloquea la fase 0 indefinidamente por una dependencia externa |
| **Rama `deploy` solo con artefactos** | CI construye; cPanel clona una rama que ya contiene el sitio |

La cuarta es el patrón que el propio `DEPLOY.md` §9 señala como "viable si se
elige esta vía".

## Decisión

**GitHub Actions construye y publica los artefactos en una rama `deploy`;
cPanel clona esa rama.**

```
main  (código fuente)
  └── .github/workflows/deploy-cpanel.yml
        gates → npm run build → dist/
          └── rama `deploy`  (sitio construido + .cpanel.yml)
                └── cPanel → Git Version Control → rsync a ~/public_html/
```

Detalles que importan:

- **`.cpanel.yml` vive en `deploy/cpanel.yml`** dentro de `main`, versionado y
  revisable en un PR, y el workflow lo copia a la raíz de `deploy`. En `main`
  está inerte.
- **Una sola tarea de despliegue, idempotente.** Si una tarea de `.cpanel.yml`
  falla a mitad, cPanel se detiene y **no revierte** las anteriores. Cuantas
  menos tareas, menos estados intermedios rotos posibles.
- **`rsync -a --delete`, no `cp -R`.** `cp` no borra lo que desapareció del
  build; como los assets llevan hash de contenido, cada despliegue dejaría los
  antiguos para siempre — consume inodes y mantiene servidas páginas ya
  eliminadas. `--delete` es seguro porque `.htaccess` viaja dentro del artefacto.
- **Sin `push --force` sobre `deploy`.** "Update from Remote" de cPanel avanza
  por fast-forward; una historia reescrita lo deja en un estado no fusionable que
  hay que arreglar a mano por SSH. El workflow hace commits encima del anterior.
- **Los workflows de rsync pasan a ejecución manual.** Activarlos por `push` sin
  secretos llenaría el historial de rojo, y un CI que siempre falla enseña al
  equipo a ignorar los fallos de CI.
- **El dominio de producción (`heroduelccg.com`) pasa a estar en el repositorio**
  como valor por defecto. Es información pública, no un secreto. `SITE_URL` lo
  sigue sobrescribiendo para staging, y **staging falla si no define el suyo**:
  heredar el dominio real generaría canónicas apuntando a producción desde una
  copia que no debe indexarse.

## Consecuencias

**A favor**

- El despliegue funciona **hoy**, sin depender de credenciales SSH.
- El servidor nunca ve código fuente: solo recibe HTML, CSS y assets.
- Los gates siguen mandando: si un test falla, la rama `deploy` no se toca y el
  sitio publicado no cambia.
- El "Deploy HEAD Commit" de cPanel se vuelve seguro y predecible.

**En contra**

- **El despliegue deja de ser automático de punta a punta.** Alguien tiene que
  entrar a cPanel y pulsar dos botones. Es el precio de esta vía, y afecta al
  criterio de salida de la fase 0, que pide que el "hola mundo" llegue a staging
  *automáticamente*. Se puede automatizar después con un webhook o un cron de
  cPanel; no antes de que el flujo manual esté probado.
- **No es atómico.** Durante el `rsync` del servidor hay una ventana en la que
  conviven versiones. Es corta, pero existe; `--delay-updates` no está
  disponible por esta vía.
- **No hay respaldo automático previo,** que sí tiene el pipeline de rsync desde
  CI. El rollback pasa por revertir el commit y volver a desplegar, que es más
  lento. Ver `docs/runbooks/rollback.md`.
- La rama `deploy` acumula historial de artefactos. Irrelevante: nadie la lee.
- **Todavía no está probado end-to-end:** falta que cPanel clone la rama.

## Cuándo reabrir

Cuando existan los secretos SSH. Entonces se vuelve al pipeline de rsync de §9,
que es superior en los tres puntos que aquí se pierden: automatización completa,
despliegue casi atómico y respaldo previo para revertir en segundos.

Los workflows de rsync se conservan escritos y verificados precisamente para que
esa vuelta sea cambiar un disparador, no reescribir el despliegue.
