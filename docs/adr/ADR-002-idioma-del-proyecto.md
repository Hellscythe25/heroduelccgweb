# ADR-002 — Código en inglés, documentación y contenido en español

- **Estado:** DECIDIDO
- **Fecha:** 2026-08-04
- **Contexto de fase:** 0

## Contexto

`AGENTES.md` §2.6 fija la regla: "Código, identificadores y commits en inglés;
documentación, contenido y comentarios en español". La dirección del proyecto la
reafirmó explícitamente al arrancar el desarrollo.

El problema práctico: la estructura de repositorio propuesta en `DEPLOY.md` §3
usa nombres en español para archivos que **son código**:

```
src/content/noticias/
src/data/cartas.json
src/data/esquemas.ts
src/data/VERSION_DATOS
npm run datos:validar
```

Las dos reglas del mismo conjunto de documentos se contradicen. Hay que elegir.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Seguir §3 literalmente | Coincide con el documento | Contradice la regla de idioma; mezcla `cartas.json` con `deckRules` en el mismo objeto |
| Todo en inglés, incluidas URLs | Máxima coherencia | Un visitante hispanohablante navega URLs en inglés; peor SEO local |
| **Código en inglés, URLs y contenido en el idioma del visitante** | Cumple la regla; las URLs sirven al lector | Se aparta de los nombres literales de §3 |

## Decisión

**Código en inglés. Documentación, comentarios y contenido en español. Las URLs
públicas, en el idioma del visitante.**

| Elemento | Idioma |
|---|---|
| Identificadores, tipos, funciones, variables | Inglés |
| Nombres de archivo y carpeta de código | Inglés |
| Scripts de npm, claves JSON, ramas | Inglés |
| Mensajes de commit | Inglés |
| Comentarios en el código | Español |
| Documentación, ADRs, runbooks, memoria | Español |
| Contenido del sitio y textos de interfaz | Español + inglés |
| **URLs públicas** | El del visitante |

Renombres respecto a `DEPLOY.md` §3:

| §3 propone | Se implementa |
|---|---|
| `src/content/noticias/` | `src/content/news/` |
| `src/data/cartas.json` | `src/data/cards.json` |
| `src/data/esquemas.ts` | `src/data/schemas.ts` |
| `src/data/VERSION_DATOS` | `src/data/DATA_VERSION` |
| `npm run datos:validar` | `npm run data:validate` |

**Las URLs no siguen esa regla porque no son código.** Viven en la tabla
`routes` de `src/i18n/ui.ts`, que es la fuente única para la navegación y los
`hreflang`: el hispanohablante ve `/es/noticias/` y el anglófono `/en/news/`.

**Los nombres de los agentes siguen en español** (`arquitecto-web`,
`curador-datos-juego`). Son identificadores de documentación, no de código, y
`AGENTES.md` los define así. Renombrarlos rompería todas las referencias
cruzadas de los dos documentos de partida sin ganar nada.

## Consecuencias

- Cualquier persona que llegue al repositorio lee código en el idioma en que se
  escribe código, y documentación en el idioma del equipo.
- Hay un punto de fricción permanente: `docs/DEPLOY.md` §3 sigue mostrando la
  estructura original. Se deja tal cual **a propósito**, como documento de
  partida; esta tabla de renombres es la referencia vigente.
- Un test (`tests/i18n.test.ts`) verifica la paridad ES/EN de las cadenas de
  interfaz en CI, para que la regla no dependa de que alguien se acuerde.

## Cuándo reabrir

Si el equipo deja de ser hispanohablante de forma mayoritaria, o si se
incorporan colaboradores externos que no leen español, tocaría revisar el idioma
de la documentación (no el del código, que ya estaría bien).
