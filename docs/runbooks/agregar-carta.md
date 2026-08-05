# Runbook: incorporar una carta al compendio

**Cuándo:** el juego añade una carta y hay que reflejarla en la web.
**Quién:** quien tenga el dato exportado del juego y el arte.
**Tiempo estimado:** 15 minutos por carta; menos en lote.
**Riesgo:** bajo si sigues la regla de oro; alto si la saltas.
**Fase:** 3 en adelante.

---

## Regla de oro

**No se inventa ni un solo valor.** Ni el coste, ni el ataque, ni la vida, ni el
texto de la regla. Si un campo no viene del export del juego, la carta **no se
añade**. Un catálogo con un número inventado es peor que un catálogo incompleto:
el segundo se nota, el primero no.

En la práctica, las cartas llegan en lote con el parche. Ver
`actualizar-datos-juego.md`. Este runbook cubre el caso puntual.

---

## Antes de empezar

Del export del juego necesitas, para cada carta:

| Campo | Obligatorio | Nota |
|---|---|---|
| `id` | Sí | Numérico y estable. **Nunca se reutiliza:** viaja dentro de los deck codes ya compartidos |
| `slug` | Sí | Minúsculas con guiones |
| `name` | Sí | En español **y** en inglés |
| `text` | Sí | En español **y** en inglés |
| `type` | Sí | `unit`, `spell` o `artifact` |
| `rarity` | Sí | `common`, `rare`, `epic` o `legendary` |
| `cost` | Sí | Entero ≥ 0 |
| `stats` | Solo unidades | `attack` y `health` |
| `heroId` | No | Si la carta es exclusiva de un héroe |
| `keywords` | No | Lista |
| `art` | No | Si falta, sale un aviso, no un error |

---

## 1. Añadir el dato

En `src/data/cards.json`, dentro del array `cards`:

```json
{
  "id": 1042,
  "slug": "ember-warden",
  "name": { "es": "Ember Warden", "en": "Ember Warden" },
  "text": { "es": "Texto exacto del juego.", "en": "Exact game text." },
  "type": "unit",
  "rarity": "epic",
  "cost": 4,
  "stats": { "attack": 3, "health": 5 },
  "keywords": []
}
```

**Los nombres de cartas no se traducen** sin una decisión explícita registrada:
los jugadores de los dos idiomas comparten mazos y guías.

---

## 2. Validar

```bash
npm run data:validate
```

Si sale `duplicate-card-id`, **detente**. Reutilizar un id corrompe todos los
deck codes que ya contienen ese número, de forma permanente y sin arreglo
posible. Consúltalo con el equipo del juego antes de tocar nada.

---

## 3. Arte

- Nombre del archivo igual al `slug`.
- Formatos AVIF y WebP, generados por `astro:assets`.
- Dos tamaños: miniatura para el catálogo (**por debajo de 20 KB**) y resolución
  completa solo para la ficha individual.
- Ruta en el campo `art`, relativa a `src/assets/`.

---

## 4. Verificar

```bash
npm run verify
```

```bash
npm run build && npm run budget
```

Y en el navegador:

- La carta aparece en `/es/cartas/` y en `/en/cards/`.
- Su ficha individual carga en los dos idiomas.
- El deckbuilder la ofrece y respeta su límite de copias por rareza.

---

## 5. Auditoría de inodes tras una carga masiva

El plan del hosting admite **300 000 archivos**. Después de subir mucho arte:

```bash
ssh -p PUERTO USUARIO@HOST "find ~/public_html -type f | wc -l"
```

Cada carta suma varios archivos (dos formatos × dos tamaños). Mil cartas con
arte son unos cuatro mil archivos: cómodo, pero conviene medirlo y no suponerlo.

---

## Si algo sale mal

| Síntoma | Causa | Solución |
|---|---|---|
| `unit-without-stats` | Unidad sin `attack`/`health` | Pídelos al export. **No los estimes** |
| `unknown-hero-reference` | `heroId` de un héroe inexistente | Añade primero el héroe |
| Aviso `missing-art` | Falta el arte | Es un aviso, no un error: puedes publicar |
| `npm run budget` falla | Miniaturas demasiado pesadas | Redúcelas por debajo de 20 KB |
