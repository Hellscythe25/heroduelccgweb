---
description: Bump de datos del juego, tabla de cambios y borrador de notas de parche.
argument-hint: "<versión, ej. 0.8.3>"
---

Actualiza el catálogo al parche indicado. **Fase 3 en adelante.**

Versión objetivo: $ARGUMENTS

## 1. Comprobación previa — `curador-datos-juego` (bloqueante)

- ¿Existe el artefacto exportado del juego para esta versión?
- ¿Está publicado con tag `game-data-v$ARGUMENTS`?

**Si no existe, el flujo se detiene.** No se edita `src/data/` a mano para
"adelantar" un parche. Nunca se apunta a `latest`.

## 2. Incorporar los datos

Reemplaza `src/data/cards.json` y `src/data/heroes.json` con el artefacto
pinneado, y actualiza `src/data/DATA_VERSION` a `$ARGUMENTS`.

Las tres referencias de versión (`DATA_VERSION`, `cards.json`, `heroes.json`)
deben coincidir o el validador falla.

## 3. Validar

```bash
npm run data:validate
```

Si falla, **el problema está en el export del juego**, no aquí. Se reporta al
equipo del juego; no se parchea el JSON para que pase.

## 4. Tabla de cambios

`curador-datos-juego` la **genera** por diff contra el parche anterior. No se
escribe a mano, no se redondea, no se suaviza el lenguaje. Formato markdown,
listo para usarse tal cual.

## 5. Borrador de notas de parche — `redactor-contenido`

En `src/content/news/`, con `category: patch` y `gameVersion: $ARGUMENTS`,
usando la tabla del paso 4 sin reinterpretarla.

## 6. Traducción — `localizador`

## 7. Verificación

```bash
npm run verify
```

Más: el deckbuilder avisa correctamente de los mazos creados en parches
anteriores, y las reglas de construcción vigentes se aplican.

## Cierre

Todo va en **un único PR**: bump de datos, tabla de cambios y notas. Separarlos
deja la web afirmando una versión que sus datos no respaldan.
