---
description: Flujo de publicación — borrador, traducción, SEO y PR.
argument-hint: "[blog|noticias] [tema]"
---

Flujo para publicar contenido editorial. **Fase 2 en adelante.**

Objetivo: $ARGUMENTS

## 1. Decidir la colección

| Va en | Cuando |
|---|---|
| `src/content/blog/` | Proceso, decisiones de diseño, arte, comunidad |
| `src/content/news/` | Parches, prensa, anuncios |

No se mezclan: son audiencias distintas y feeds RSS distintos. Si dudas, la
pregunta es "¿esto lo citaría un periodista?" — si sí, es noticia.

## 2. Borrador — `redactor-contenido`

Frontmatter completo (ver `src/content/*/_README.md`). Cada afirmación sobre el
juego debe rastrearse a `src/data/` o a una decisión registrada. Nada de fechas,
precios o plataformas sin confirmar.

Si es una nota de parche, la tabla de cambios la genera `curador-datos-juego`
por diff; no se escribe a mano.

## 3. Traducción — `localizador`

Contraparte en el otro idioma, con `translationOf` apuntando al slug equivalente
en ambas direcciones. Los nombres propios del juego no se traducen.

**Ningún post se mergea existiendo en un solo idioma.**

## 4. SEO — `seo-tecnico`

Título ≤ 60 caracteres, descripción ≤ 155, imagen OG, JSON-LD `Article` +
`BreadcrumbList`, `hreflang` recíprocos.

## 5. Verificación — `qa-web`

```bash
npm run verify
npm run build && npm run budget
```

Más: enlaces internos, imagen OG que carga, `alt` real en toda imagen.

## 6. PR — `git-ops`

Rama `docs/<slug>` o `feat/blog-<slug>`, plantilla de PR completa.

## Cierre

Reporta qué se publicó, en qué idiomas, y qué quedó pendiente.
