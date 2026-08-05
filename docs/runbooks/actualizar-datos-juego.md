# Runbook: actualizar los datos del juego a un parche nuevo

**Cuándo:** el juego publica un parche y la web debe reflejarlo.
**Quién:** quien tenga el artefacto exportado del juego.
**Tiempo estimado:** 20 minutos.
**Riesgo:** medio. Un catálogo incorrecto hace que la comunidad deje de fiarse
del compendio y del deckbuilder a la vez.

---

## Regla que manda sobre todas las demás

**La web no inventa ni edita números de balance.** Cartas, héroes, costes,
estadísticas y reglas de construcción vienen del build del juego. Si un dato
parece equivocado, **se reporta al equipo del juego; no se corrige aquí**.
Corregirlo en la web esconde el problema y hace que el juego y la web digan
cosas distintas.

---

## Antes de empezar

- El artefacto exportado del juego: `cards.json` y `heroes.json`.
- Publicado como GitHub Release con tag `game-data-vX.Y.Z`.
- **Si no existe ese artefacto, este runbook se detiene aquí.** No se edita
  `src/data/` a mano para adelantar un parche.

---

## 1. Crear la rama

```bash
git checkout develop
```

```bash
git pull
```

```bash
git checkout -b feat/data-bump-0-8-3
```

---

## 2. Reemplazar los datos

Copia los dos archivos del artefacto **pinneado al tag** (nunca `latest`) sobre:

- `src/data/cards.json`
- `src/data/heroes.json`

Y escribe la versión nueva en `src/data/DATA_VERSION`. El archivo contiene una
sola línea, por ejemplo:

```
0.8.3
```

Las tres versiones (`DATA_VERSION`, y el campo `dataVersion` de cada JSON) deben
coincidir. Si no coinciden, la validación falla — a propósito.

---

## 3. Validar

```bash
npm run data:validate
```

**Si falla, el problema está en el export del juego, no aquí.** Copia el error
completo y pásalo al equipo del juego. No modifiques el JSON para que pase: eso
convierte un error detectado en un error publicado.

Errores frecuentes y qué significan:

| Error | Significado |
|---|---|
| `version-mismatch` | Las tres versiones no coinciden |
| `duplicate-card-id` | Dos cartas con el mismo id. **Grave:** los ids viajan dentro de los deck codes ya compartidos |
| `unit-without-stats` | Una unidad sin ataque o vida |
| `unknown-hero-reference` | Una carta apunta a un héroe que no existe |
| `missing-deck-rules` | Hay héroes pero `deckRules` sigue en `null` |

Los avisos de `missing-art` no bloquean: la carta se publica sin arte.

---

## 4. Generar la tabla de cambios

La produce el agente `curador-datos-juego` por diff contra el parche anterior.
**No se escribe a mano y no se suaviza el lenguaje**: si un coste bajó de 5 a 4,
la tabla dice 5 → 4, no "ligeramente ajustado".

---

## 5. Notas de parche

El agente `redactor-contenido` redacta la noticia en `src/content/news/`, con
`category: patch` y `gameVersion` igual a la versión nueva, usando la tabla del
paso 4 tal cual.

Después, `localizador` escribe la contraparte en el otro idioma.

---

## 6. Verificar y proponer

```bash
npm run verify
```

```bash
git add .
```

```bash
git commit -m "feat(data): bump game data to 0.8.3"
```

```bash
git push -u origin feat/data-bump-0-8-3
```

**Todo va en una única propuesta:** datos, tabla de cambios y notas de parche.
Separarlos deja la web afirmando una versión que sus datos no respaldan.

---

## Cómo saber que funcionó

1. `npm run data:validate` en verde.
2. En staging, el compendio muestra las cartas nuevas y los valores ajustados.
3. El deckbuilder avisa correctamente en los mazos creados con el parche anterior.

---

## Si algo sale mal

Revierte con `git checkout src/data/` y vuelve a empezar desde el artefacto
correcto. Los datos anteriores siguen en el historial de Git: nada se pierde.
