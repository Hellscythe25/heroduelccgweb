# Noticias

Contenido para **prensa y jugadores**: notas de parche, anuncios, comunicados.
El proceso creativo y las decisiones de diseño van en `src/content/blog/`.

Fase 2 (`docs/DEPLOY.md` §15). Vacío a propósito hasta entonces.

## Frontmatter obligatorio

```yaml
---
title: Parche 0.8.3
description: Ajustes de balance en tres héroes y dos cartas legendarias.
lang: es                       # es | en
publishedAt: 2026-08-04
author: Equipo Hero Duel
category: patch                # patch | press | announcement
gameVersion: 0.8.3             # obligatorio de facto en category: patch
draft: false
---
```

## Regla dura para notas de parche

La tabla de cambios **se genera** a partir del diff de `src/data/cards.json`
entre parches; la produce el agente `curador-datos-juego`. No se escribe a mano
y no se "redondea" para que lea mejor: si la web y el juego divergen, la
comunidad pierde la confianza en el compendio y en el deckbuilder a la vez.

`gameVersion` debe coincidir con `src/data/DATA_VERSION` en el mismo PR.

El paso a paso está en `docs/runbooks/publicar-noticia.md` y
`docs/runbooks/actualizar-datos-juego.md`.
