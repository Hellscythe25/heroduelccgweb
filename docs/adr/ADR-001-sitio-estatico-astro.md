# ADR-001 — Sitio estático con Astro, sin backend en el hosting compartido

- **Estado:** DECIDIDO
- **Fecha:** 2026-08-04
- **Contexto de fase:** 0

## Contexto

El sitio público del juego se aloja en un shared hosting de Namecheap (cPanel).
El plan soporta PHP y ofrece *Setup Node.js App* (Passenger), así que técnicamente
caben Laravel o un servidor Node. La pregunta es si conviene.

El proyecto es una web de videojuego en beta: landing, presskit, blog, noticias,
compendio de cartas y héroes, y un deckbuilder. El pico de tráfico previsible no
es constante: llega de golpe el día del lanzamiento o cuando un medio cubre el
juego, y es exactamente el momento en que no puede fallar.

Restricciones duras del plan: **300 000 inodes**, sin root, sin Docker, sin
daemons, límite de *entry processes* compartido.

## Opciones consideradas

| Criterio | Astro estático | Laravel en cPanel | Node/Passenger en cPanel |
|---|---|---|---|
| Procesos en el servidor | 0 | PHP-FPM compartido | Passenger, se duerme y reinicia |
| Límite de *entry processes* | No aplica | Cuello de botella real | Cuello de botella real |
| Riesgo en pico de tráfico | Nulo: es I/O de disco | Alto | Alto |
| Superficie de ataque | Casi nula | `.env`, DB, dependencias | Dependencias, runtime |
| Inodes consumidos | ~1.5 k archivos | ~30 k con `vendor/` | ~60 k con `node_modules/` |
| Rollback | Copiar una carpeta | Migraciones inversas | Reinstalar + restart |
| Coste de mantenimiento | Bajo | Medio-alto | Alto |

Ninguna funcionalidad de la v1 exige backend:

| Funcionalidad | Solución estática |
|---|---|
| Landing, presskit | HTML generado |
| Blog y noticias | Markdown en el repo → Content Collections |
| Héroes y cartas | JSON validado en build |
| Buscador | Pagefind (índice generado en build) |
| Deckbuilder | Estado en cliente + deck code en la URL + `localStorage` |
| Compartir mazos | El mazo va codificado en la URL |
| Newsletter | Servicio externo |
| Comentarios | Servicio externo |

## Decisión

**Astro 7 con `output: 'static'`. Cero runtime en producción.** El build se hace
en GitHub Actions y al servidor solo llega `dist/`, publicado por `rsync` sobre
SSH.

Lo que se renuncia al elegir esto: cualquier funcionalidad que necesite estado
en servidor queda fuera de la v1. Galería pública de mazos con votos, cuentas de
usuario, estadísticas de meta en vivo y wiki editable **no se pueden construir**
dentro de esta decisión, y eso es deliberado.

## Consecuencias

**A favor**

- El sitio no se cae por tráfico: servir archivos es I/O de disco.
- Rollback en segundos: copiar una carpeta.
- Superficie de ataque casi nula. No hay `.env`, ni base de datos, ni runtime.
- ~1.5 k inodes frente a los 300 k del plan: margen enorme para arte de cartas.

**En contra**

- Todo cambio de contenido pasa por Git y por un build. Para los socios no
  técnicos eso es fricción real, no imaginaria. Se mitiga con runbooks; si aun
  así resulta un obstáculo, la respuesta es un CMS de archivos planos
  (Decap/Tina), no un backend.
- El formulario de prensa necesita un servicio externo o un único `.php` de
  treinta líneas.
- Los tiempos de build crecen con el catálogo de cartas.

## Cuándo reabrir

Cuando aparezca **al menos una** de estas necesidades, y esté confirmada, no
supuesta:

- Galería pública de mazos con votos, comentarios o ranking.
- Cuentas de usuario o vinculación con la cuenta del juego.
- Estadísticas de meta en vivo alimentadas por telemetría.
- Editor de contenido con roles que no tolere el flujo de Git.

**Y aun entonces, la respuesta no es meter Laravel en el shared hosting.** Es
mantener el sitio estático y añadir una API aparte (un VPS pequeño, Supabase o
Cloudflare Workers). El sitio sobrevive intacto aunque la API se caiga; si el
backend vive dentro del hosting, se caen los dos juntos.
