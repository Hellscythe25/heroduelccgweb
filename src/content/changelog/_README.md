# Novedades por versión

Contenido de la página pública de changelog (`/es/novedades/`, `/en/changelog/`).
Un archivo por versión e idioma: `es/0.8.0.md` y `en/0.8.0.md`.

## De dónde sale el texto

Del registro de jugadores del juego, `Docs/CHANGELOG_Jugadores.md`, leído del
espejo estable (`TCGMaster-github`) con `git show <commit>:<ruta>`. El texto en
español se adapta de ahí; el inglés es una traducción de esa adaptación que
aprueba el dueño. Los nombres en inglés (cartas, héroes, pantallas, botones) son
los del propio juego (`ContentDatabase.json`), no traducciones nuevas.

Primera importación: commit `fae841f` del espejo (2026-11-15), versiones 0.2.0
a 0.8.0.

## Reglas de adaptación

Decididas por el dueño el 2026-11-15. Solo se quita o se acorta; **nunca se
añade** nada que el registro del juego no diga.

1. **Fuera los avisos de "versión en preparación"** ("todavía no repartida",
   "llega junto con…"): esas versiones ya salieron. Lo que el aviso dice y sigue
   siendo un hecho (actualización obligatoria, reinicio de progreso) pasa al
   campo `notice`.
2. **Sin nombres de rangos**, en ningún idioma. Se describen sin nombrarlos
   ("cada uno de los 14 rangos tiene su escudo").
3. **Sin gemas** ni nada de moneda premium, paquetes de gemas o compras de
   prueba. Un punto que solo habla de gemas se quita; si las nombra de paso, se
   quita solo esa parte.
4. **Sin fechas**: las de la beta y el lanzamiento son internas.
5. **Sin nombres internos ni técnicos**: ni el nombre interno del proyecto, ni
   códigos de tarea, ni proveedores, ni cambios que solo ve el equipo (por
   ejemplo, errores del editor).
6. Si al quitar algo una sección queda vacía, se quita la sección.

## Formato

```yaml
---
version: 0.8.0
lang: es                     # es | en
notice: Actualización obligatoria…   # opcional
highlights:                  # opcional, hasta 6; vacío en versiones cortas
  - Una frase que resume un punto de esta misma versión.
---

### Novedades

- **Título del punto:** el texto del punto.
```

- Los títulos de sección (`### Novedades`, `### Correcciones`…) siguen los del
  registro del juego. La página pone el `h2` con el número de versión.
- Los destacados resumen puntos que ya están en el detalle; no traen nada nuevo.
- Los dos idiomas tienen las mismas versiones, el mismo número de destacados y
  el mismo aviso. `tests/changelog.test.ts` lo comprueba, junto con las reglas
  3 y 4 y el nombre interno.
