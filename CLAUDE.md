# CLAUDE.md — Reglas globales del proyecto

> Se aplican a **todos** los agentes y a toda sesión de Claude Code en este
> repositorio. Sin excepciones y sin interpretación creativa.
>
> Documentos de referencia: `docs/DEPLOY.md` (infraestructura y fases),
> `docs/AGENTES.md` (equipo de subagentes), `docs/MEMORIA.md` (estado vivo).

---

## Idioma

**El código va en inglés. La documentación y el contenido, en español.**

| Elemento | Idioma | Ejemplo |
|---|---|---|
| Identificadores, funciones, tipos, variables | Inglés | `findCardById`, `DeckRules` |
| Nombres de archivo y carpeta de código | Inglés | `src/data/cards.json`, `schemas.ts` |
| Scripts de npm, claves JSON, ramas | Inglés | `npm run data:validate`, `deckRules` |
| Mensajes de commit | Inglés | `feat(deckbuilder): add round-trip tests` |
| Comentarios en el código | Español | `// El canon lo exporta el juego, no esta web.` |
| Documentación, ADRs, runbooks, memoria | Español | `docs/**` |
| Contenido del sitio y textos de interfaz | Español + inglés | `src/i18n/ui.ts` |
| **URLs públicas** | El del visitante | `/es/noticias/`, `/en/news/` |

Las URLs son contenido, no código: viven en la tabla `routes` de
`src/i18n/ui.ts`, que es la fuente única para navegación y `hreflang`.

Los nombres de los agentes (`arquitecto-web`, `curador-datos-juego`) siguen en
español a propósito: son identificadores de documentación, no de código, y
`docs/AGENTES.md` los define así.

---

## Reglas duras

1. **Ningún agente inventa números de balance.** Cartas, heroes, costes,
   estadísticas y reglas de construcción provienen exclusivamente de
   `src/data/`. Si un dato no está ahí, el agente **se detiene y pregunta**.
   Nunca aproxima, nunca completa, nunca "arregla" una inconsistencia aparente:
   la reporta.
2. **Ningún agente edita `main` directamente.** Todo pasa por rama + PR.
3. **Ningún agente toca producción.** Solo `ingeniero-despliegue` modifica CI o
   `.htaccess`, y aun así el despliegue lo dispara el pipeline, no el agente.
4. **Ningún secreto en el repositorio.** Ni de ejemplo, ni comentado, ni en
   `.env.example` con valores reales.
5. **Filtro de alcance.** Antes de escribir código, cada agente verifica que la
   tarea corresponde a la fase actual (`docs/DEPLOY.md` §15). Trabajo de fase
   futura se rechaza y se anota en `docs/MEMORIA.md` como `ABIERTO`.
6. **Idioma según la tabla de arriba.**
7. **El presupuesto de rendimiento (`docs/DEPLOY.md` §12) es un gate, no una
   guía.** `npm run budget` rompe el build; no se sube un límite sin ADR.
8. **Cada agente cierra su turno diciendo:** qué cambió, qué quedó pendiente,
   qué necesita decisión humana.

---

## Fase actual

**Fase 0 — Base.** Criterio de salida: un "hola mundo" llega a staging
automáticamente.

En curso: repo, CI, `.htaccess`, sistema de diseño, i18n, gates.
Fuera de alcance ahora: blog, compendio, deckbuilder, presskit, analítica.

Fases y alcance completo en `docs/DEPLOY.md` §15. El estado vivo, con bloqueos
y decisiones abiertas, en `docs/MEMORIA.md`.

---

## Arquitectura en una línea

Sitio **estático** generado con Astro 7, construido en GitHub Actions y
publicado por `rsync` a un hosting compartido de Namecheap. **Cero runtime en
producción.** Cualquier propuesta que introduzca un proceso vivo en el hosting
compartido se rechaza automáticamente (ADR-001).

---

## Comandos

```bash
npm run dev             # servidor local
npm run verify          # todos los gates: placeholders + datos + tipos + tests
npm run build           # build estático + sustitución de dominio
npm run budget          # presupuesto de rendimiento sobre dist/
```

`npm run verify` es lo que debe estar en verde antes de abrir un PR.

---

## Convención de commits

```
feat|fix|docs|chore|perf|refactor|test(ámbito): descripción en inglés
```

Ámbitos: `landing`, `blog`, `cards`, `heroes`, `deckbuilder`, `data`, `deploy`,
`ui`, `seo`, `i18n`.

Ramas: `feat/<ámbito>-<descripción-corta>`, `fix/...`, `docs/...`.
`main` = producción. `develop` = staging.

---

## Lo que nunca se hace

- `git push --force` sobre `main`.
- Commitear `node_modules/` o `dist/`.
- Editar `.htaccess` por el File Manager de cPanel: el siguiente despliegue lo
  sobrescribe.
- Dejar placeholders (`TUDOMINIO.com`, lorem ipsum) en `main` — hay un gate.
- Añadir una dependencia sin justificarla: cada paquete es superficie de ataque
  y peso de bundle.
- Usar una directiva `client:*` sin justificación explícita. El valor por
  defecto es HTML sin JavaScript.
