# `deploy/` — configuración de la rama de artefactos

Esta carpeta **no se despliega**. Contiene la plantilla de `.cpanel.yml` que el
workflow inyecta en la rama `deploy`.

## Cómo funciona

```
main  (código fuente)
  │
  └── GitHub Actions: gates → npm run build → dist/
        │
        └── rama `deploy`  (SOLO el sitio construido + .cpanel.yml)
              │
              └── cPanel → Git Version Control → clona `deploy` → Deploy
                    │
                    └── rsync a ~/public_html/
```

## Por qué `main` nunca se despliega directamente

**cPanel no construye el sitio.** Si apuntaras Git Version Control a `main` y
pulsaras "Deploy", copiaría a `public_html` el código fuente — `src/`, `docs/`,
`scripts/`, `package.json`, `CLAUDE.md` — y **ningún `index.html`**, porque el
HTML solo existe después de `npm run build`.

Resultado: el sitio no funcionaría y quedarían accesibles archivos que no deben
servirse.

Por eso la rama `deploy` contiene exclusivamente artefactos, y por eso
`.cpanel.yml` vive aquí y no en la raíz del repositorio.

## Historial lineal, sin `--force`

El workflow hace commits **encima** del estado anterior de `deploy`, sin
reescribir historia. Es deliberado: "Update from Remote" de cPanel hace un
fetch con avance rápido, y un `push --force` lo dejaría en un estado no
fusionable que hay que arreglar a mano por SSH.

El coste es que la rama acumula historial. No importa: es una rama de
artefactos y nadie la lee.

## Rama protegida

`deploy` la escribe **solo** el workflow. Editarla a mano deja el sitio
publicado distinto del código que lo generó, y el siguiente despliegue lo
sobrescribe sin avisar.

El procedimiento completo está en `docs/runbooks/desplegar-cpanel.md`.
