# Devlog

Contenido para la **comunidad**: proceso, decisiones de diseño, arte, cocina
interna. Las notas de parche y los comunicados de prensa **no** van aquí; van en
`src/content/news/`. Son audiencias distintas y feeds RSS distintos.

Fase 2 (`docs/DEPLOY.md` §15). Vacío a propósito hasta entonces.

## Frontmatter obligatorio

```yaml
---
title: Cómo decidimos el coste de las cartas legendarias
description: Una frase que se lee sola en un resultado de búsqueda.
lang: es                       # es | en
publishedAt: 2026-08-04
author: Nombre de quien firma
tags: [diseño, balance]        # opcional
draft: false                   # opcional, por defecto false
translationOf: how-we-price-legendaries   # opcional, slug del equivalente
cover:                         # opcional
  src: ../../assets/blog/mi-imagen.webp
  alt: Descripción real de la imagen, no el título del post.
---
```

`alt` es obligatorio si hay portada. Un `alt` vacío bloquea el merge.

## Nomenclatura

`kebab-case.md`, sin fecha en el nombre: la fecha vive en el frontmatter y el
slug debe poder sobrevivir a una republicación.

El paso a paso completo está en `docs/runbooks/publicar-noticia.md`.
