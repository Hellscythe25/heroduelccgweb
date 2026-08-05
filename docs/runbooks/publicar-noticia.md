# Runbook: publicar una noticia o un devlog

**Cuándo:** quieres publicar una nota de parche, un anuncio o una entrada de
devlog.
**Quién:** cualquier socio con acceso al repositorio.
**Tiempo estimado:** 20 minutos, más lo que tardes en escribir.
**Riesgo:** bajo. Nada llega a la web hasta que la propuesta se aprueba y se
fusiona.

---

## Antes de empezar

- Haber hecho el `onboarding.md` una vez.
- Tener el texto escrito, en al menos un idioma.
- Si es una nota de parche: tener la tabla de cambios generada por el agente
  `curador-datos-juego`. **No la escribas a mano.**

---

## 1. Elegir la carpeta

| Va en | Cuando |
|---|---|
| `src/content/blog/` | Proceso, decisiones de diseño, arte, comunidad |
| `src/content/news/` | Parches, prensa, anuncios |

Si dudas: **¿esto lo citaría un periodista?** Si sí, es noticia; si no, es
devlog. No se mezclan porque tienen feeds RSS y audiencias distintas.

---

## 2. Crear una rama

```bash
git checkout develop
```

```bash
git pull
```

```bash
git checkout -b feat/blog-nombre-corto-del-post
```

---

## 3. Crear el archivo

Nombre en minúsculas y con guiones, **sin fecha**: `coste-de-legendarias.md`.
La fecha va dentro del archivo; el nombre debe sobrevivir a una republicación.

Contenido, empezando por el bloque de datos entre `---`:

```markdown
---
title: Cómo decidimos el coste de las cartas legendarias
description: Una frase que se entienda sola en un resultado de búsqueda.
lang: es
publishedAt: 2026-08-04
author: Tu nombre
tags: [diseño, balance]
draft: false
---

Aquí el texto, en Markdown normal.
```

Para una noticia, cambia las dos últimas claves por:

```yaml
category: patch          # patch | press | announcement
gameVersion: 0.8.3       # obligatorio si category es patch
```

**Todos los campos son obligatorios salvo los marcados como opcionales en
`src/content/*/_README.md`.** Si falta uno, el sitio no compila. Es el
comportamiento correcto: es preferible que no compile a que se publique a medias.

---

## 4. Escribir la contraparte en el otro idioma

**Ninguna página se publica en un solo idioma.** Crea el archivo equivalente
con `lang: en` y añade en ambos:

```yaml
translationOf: slug-del-otro-archivo
```

Si no puedes traducirlo ahora, díselo al agente `localizador` en la propuesta.
Un sitio medio traducido se lee como abandonado.

---

## 5. Verlo antes de publicarlo

```bash
npm run dev
```

Abre la dirección que aparece y navega hasta tu post. Comprueba: título,
acentos, enlaces y que la imagen (si la hay) se ve.

---

## 6. Comprobar que todo está bien

```bash
npm run verify
```

Sin errores en rojo. Si los hay, léelos: casi siempre señalan un campo que falta
en el bloque de datos.

---

## 7. Proponer el cambio

```bash
git add .
```

```bash
git commit -m "docs(blog): add post on legendary card costs"
```

```bash
git push -u origin feat/blog-nombre-corto-del-post
```

Abre la propuesta (PR) en GitHub **contra `develop`**, no contra `main`, y
completa la plantilla que aparece.

---

## Cómo saber que funcionó

1. Los checks automáticos de la propuesta salen en verde.
2. Tras fusionar a `develop`, el post aparece en el sitio de staging.
3. Cuando `develop` se fusiona a `main`, aparece en la web pública.

---

## Si algo sale mal

| Síntoma | Causa | Solución |
|---|---|---|
| `Invalid frontmatter` | Falta un campo o la fecha está mal escrita | Usa el formato `AAAA-MM-DD` |
| `alt is required` | Pusiste una portada sin texto alternativo | Descríbela: no repitas el título |
| El post no aparece | `draft: true` | Cámbialo a `false` |
| El nombre del archivo empieza por `_` | Esos se ignoran a propósito | Renómbralo |
