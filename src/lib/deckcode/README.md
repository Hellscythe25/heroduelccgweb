# `src/lib/deckcode/` — codec del deck code

**Fase 4. Deliberadamente vacío hasta entonces** (`docs/DEPLOY.md` §15).

Dueño: agente `dev-deckbuilder` (Opus). Nadie más escribe en esta carpeta.

## Por qué está aislado

Es la única pieza del sitio con complejidad algorítmica real, y la única cuyo
fallo es **irreversible en la práctica**: un bug en el codec rompe de forma
permanente todos los enlaces de mazo que la comunidad ya haya compartido en
Discord, X o foros. No hay migración posible para una URL que ya circula.

## Requisito no negociable antes de considerarlo terminado

Tests de round-trip con *property-based testing* (`fast-check`): codificar →
decodificar → comparar, sobre mazos generados aleatoriamente, incluyendo casos
límite (mazo vacío, ids no contiguos, cantidad máxima por carta, ids altos).

Ese test es un gate de CI, no una sugerencia.

## Especificación vigente

Ver `docs/DEPLOY.md` §7. Resumen del formato `v1`:

```
DK1.<base64url>

payload (bytes):
  [0]      uint8   versión de formato
  varint   id del héroe
  varint   versión de datos (parche) — ej. 803 para 0.8.3
  varint   nº de entradas
  repetir: varint delta(cardId)   # ids ordenados, codificados por diferencia
           varint cantidad
```

El byte de versión permite cambiar el formato sin romper los mazos ya
compartidos: un decodificador nuevo sigue entendiendo `DK1`.

## Bloqueo actual

El codec no puede escribirse todavía porque las reglas de construcción
(`deckRules` en `src/data/heroes.json`) siguen en `null`: el juego aún no las
exporta. Ver `docs/MEMORIA.md`.
