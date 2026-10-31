# ADR-005 — Datos del juego importados desde el ContentDatabase.json

- **Estado:** PROPUESTO (pendiente de la aprobación del dueño junto con la fase 1)
- **Fecha:** 2026-10-31
- **Contexto de fase:** 1
- **Relación:** resuelve en parte el punto ABIERTO "¿Existe pipeline de
  exportación de datos desde Unity?" de `docs/MEMORIA.md`; ajusta el contrato
  PROPUESTO de `src/data/schemas.ts`

## Contexto

La página de héroes necesita la vida, la pasiva y las habilidades de cada
héroe. La regla dura del proyecto es que la web no inventa balance: esos datos
tienen que venir del juego.

El runbook `actualizar-datos-juego.md` suponía un artefacto exportado y
publicado como GitHub Release (`game-data-vX.Y.Z`). Ese artefacto no existe.
Lo que sí existe es la fuente de verdad del propio juego:
`Assets/ContentAuthoring/ContentDatabase.json`, que genera el Card Designer y
de donde salen el catálogo del servidor y los textos del cliente. Tiene héroes,
cartas, sets y campañas con sus textos en español e inglés.

El contrato de `src/data/schemas.ts` era una propuesta anterior a conocer el
juego: ids numéricos, tres tipos de carta y cuatro rarezas. El juego real usa
ids de texto (`brakka`), cuatro tipos (instantánea, arma, armadura, trinket) y
cinco rarezas.

## Decisión

1. **`scripts/import-game-data.mjs` lee el `ContentDatabase.json` y escribe
   `src/data/heroes.json`, `cards.json` (solo la versión) y `DATA_VERSION`.**
   La transformación vive en `scripts/lib/game-data.mjs` y está cubierta por
   tests: copia los valores tal cual y solo parte la pasiva "Nombre: texto" en
   sus dos campos. Si el formato cambia, falla en vez de adivinar.
2. **La versión de datos es la `bundleVersion` del build del juego** de donde
   sale el archivo (hoy `0.6.0`), y se pasa como argumento.
3. **`HeroSchema` se ajusta al juego**: id de texto, `life`, habilidades con su
   id y campaña opcional. `CardSchema` no se toca todavía: se rediseñará con el
   compendio (fase 3), contra las cartas reales.
4. **`deckRules` solo es obligatorio cuando hay cartas.** La página de héroes
   no lo usa; el deckbuilder sí. Seguirá en `null` hasta que el juego exporte
   las reglas (hoy viven en código C#, `DeckRules.cs`: mazo de 20 y copias
   3/3/2/2/1), para no copiarlas a mano.
5. **El repositorio del juego es de solo lectura para esta web.** El script se
   ejecuta a mano con la ruta al archivo; CI no accede al repositorio del juego
   (es Plastic SCM y privado).

## Consecuencias

- Los valores publicados coinciden con los del juego en la versión declarada, y
  la página de héroes lo dice ("valores de la versión 0.6.0").
- Actualizar los héroes es: ejecutar el script, `npm run verify`, PR.
- El rol y el estilo de juego de cada héroe no están en el `ContentDatabase`:
  viven en `src/i18n/pages/heroes.ts`, resumidos del GDD. Un test exige que cada
  héroe importado tenga su entrada ahí.
- Si algún día el juego publica un artefacto propio (GitHub Release), el script
  se sustituye por la descarga de ese artefacto sin cambiar el formato de
  `src/data/`.
