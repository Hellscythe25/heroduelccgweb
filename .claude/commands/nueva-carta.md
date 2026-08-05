---
description: Flujo guiado para incorporar una carta — datos, validación, arte y verificación.
argument-hint: "[id o slug de la carta]"
---

Flujo para incorporar una carta al compendio. **Fase 3 en adelante.** Si el
proyecto está en una fase anterior, detente y dilo.

Carta objetivo: $ARGUMENTS

## 1. Datos — `curador-datos-juego` (bloqueante)

Los valores vienen del export del juego. **Si no tienes el export, el flujo se
detiene aquí.** No se inventa ni un coste, ni una estadística, ni un texto de
regla. Ningún campo se completa "provisionalmente".

Verifica que la carta trae: `id`, `slug`, `name` (ES y EN), `text` (ES y EN),
`type`, `rarity`, `cost`, y `stats` si es una unidad.

## 2. Validación

```bash
npm run data:validate
```

Debe pasar antes de continuar. Si falla, se reporta el problema al origen (el
build del juego); no se parchea el JSON.

## 3. Arte — `disenador-ui`

Nomenclatura, dos tamaños, AVIF + WebP vía `astro:assets`. Miniatura del
catálogo por debajo de 20 KB; el arte a resolución completa solo en la ficha
individual.

Si el arte todavía no existe, la carta se publica sin él: el validador emite un
aviso, no un error.

## 4. Verificación — `qa-web`

- La carta aparece en `/es/cartas/` y en `/en/cards/`.
- Su ficha individual carga en los dos idiomas.
- El deckbuilder la ofrece y aplica correctamente sus límites de copias.
- `npm run budget` sigue en verde tras añadir el arte.

## 5. Auditoría de inodes

Tras una carga masiva de arte, `ingeniero-despliegue` audita la cuota
(límite del plan: 300 000 archivos).

## Cierre

Reporta qué se añadió, qué quedó pendiente y qué necesita decisión humana.
