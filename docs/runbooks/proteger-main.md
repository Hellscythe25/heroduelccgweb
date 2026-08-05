# Runbook: proteger la rama `main`

**Cuándo:** una sola vez, en cuanto el sitio esté en producción.
**Quién:** quien administre el repositorio en GitHub.
**Tiempo estimado:** 5 minutos.
**Riesgo:** ninguno sobre el sitio. A partir de aquí no podrás hacer push
directo a `main`, que es justamente el objetivo.

---

## Por qué

`main` es producción: cada commit que llega ahí dispara un build que acaba en el
servidor. Sin protección, un push apresurado de viernes por la tarde salta todos
los gates que el proyecto se ha molestado en construir.

La regla ya está escrita en `CLAUDE.md` ("ningún agente edita `main`
directamente"), pero una regla que solo vive en un documento **no es una regla,
es una intención**. Esto la vuelve mecánica.

---

## Pasos

1. GitHub → repositorio → **Settings** → **Rules** → **Rulesets** → **New
   ruleset** → **New branch ruleset**.
2. **Ruleset Name:** `main protegida`
3. **Enforcement status:** **Active**
4. **Target branches** → *Add target* → **Include default branch**.
5. Marca estas reglas:

   | Regla | Por qué |
   |---|---|
   | **Restrict deletions** | Nadie borra producción por accidente |
   | **Block force pushes** | Reescribir el historial de producción rompe el repo de todos |
   | **Require a pull request before merging** | El cambio se lee antes de publicarse |
   | **Require status checks to pass** | Los gates dejan de ser opcionales |

6. Dentro de *Require a pull request before merging*:
   - **Required approvals: 0** si trabajas en solitario. El valor está en que el
     cambio pase por un PR con sus checks, no en la firma. Súbelo a 1 cuando
     haya más de una persona.
   - Marca **Dismiss stale pull request approvals when new commits are pushed**.
7. Dentro de *Require status checks to pass*, busca y añade: **`Gates`**
   (el job de `.github/workflows/pr-checks.yml`).
   - Marca también **Require branches to be up to date before merging**.
8. **Create**.

---

## Cómo saber que funcionó

```bash
git checkout main && git commit --allow-empty -m "test: protection check" && git push origin main
```

Debe **fallar** con un mensaje de *protected branch*. Deshaz el commit local:

```bash
git reset --hard origin/main
```

---

## A partir de ahora, el flujo es

```bash
git checkout -b feat/ambito-descripcion
```

```bash
git push -u origin feat/ambito-descripcion
```

Abres el PR en GitHub, esperan los checks, y fusionas.

---

## Si necesitas saltártela una vez

No lo hagas. Si de verdad hay una urgencia, el camino correcto es un PR con los
checks en verde: tarda dos minutos más y deja rastro. Desactivar la protección
"solo por esta vez" es cómo termina siendo permanente.

---

## Nota sobre el ruleset y el despliegue

La protección **no** afecta a la rama `deploy`: la escribe GitHub Actions con el
token del propio workflow, y el ruleset apunta solo a la rama por defecto.

Si algún día proteges también `deploy`, tendrás que añadir una *bypass list* con
el rol de GitHub Actions, o el despliegue dejará de funcionar.
