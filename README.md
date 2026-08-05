# Hero Duel — sitio web

Web pública del juego de cartas coleccionables **Hero Duel** (en beta).

Sitio estático generado con **Astro 7**, construido en GitHub Actions y publicado
por `rsync` en un hosting compartido de Namecheap. **Cero runtime en
producción**: el servidor solo sirve archivos.

---

## Arranque rápido

```bash
npm install
```

```bash
npm run dev
```

Requiere **Node ≥ 22.12** (lo exige Astro 7).

Si es tu primera vez en el proyecto, empieza por
[`docs/runbooks/onboarding.md`](docs/runbooks/onboarding.md): está escrito para
llegar a publicar contenido en media hora sin conocimientos previos del stack.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run verify` | **Todos los gates**: placeholders, datos, tipos y tests |
| `npm run build` | Build estático + inyección del dominio canónico |
| `npm run budget` | Presupuesto de rendimiento sobre `dist/` |
| `npm run data:validate` | Valida el catálogo del juego contra el esquema |
| `npm run search:index` | Índice de búsqueda de Pagefind |

`npm run verify` debe estar en verde antes de abrir cualquier propuesta.

---

## Estructura

```
.claude/          15 subagentes y 6 comandos de Claude Code
.github/          Workflows: checks de PR, staging, producción
docs/             DEPLOY, AGENTES, MEMORIA, CHANGELOG, ADRs y runbooks
public/           .htaccess versionado, robots.txt, favicon
src/
  content/        blog/ y news/ — Markdown validado en build
  data/           Canon del juego: cards.json, heroes.json, DATA_VERSION
  i18n/           Diccionario ES/EN y tabla de rutas localizadas
  lib/deckcode/   Codec del deck code (fase 4)
  styles/         Tokens del sistema de diseño
scripts/          Gates: placeholders, presupuesto, postbuild
tests/            Vitest
```

---

## Reglas que conviene conocer antes de tocar nada

1. **La web no inventa números de balance.** Cartas y héroes son canon del
   juego: se consumen, no se editan. Si un dato no está en `src/data/`, el
   trabajo se detiene y se pregunta.
2. **Cero JavaScript por defecto.** Ninguna directiva `client:*` sin
   justificación escrita en la propuesta.
3. **El presupuesto de rendimiento es un gate, no una guía.** Si tu página lo
   rompe, la página está mal.
4. **Nada se publica en un solo idioma.** ES y EN o marcado explícitamente como
   no disponible.
5. **Código en inglés; documentación, comentarios y contenido en español**
   ([ADR-002](docs/adr/ADR-002-idioma-del-proyecto.md)).

Las reglas completas están en [`CLAUDE.md`](CLAUDE.md).

---

## Estado

**Fase 0 — Base.** El andamiaje técnico está en pie y verificado en local; el
despliegue automático está escrito pero **todavía no se ha ejecutado**: faltan el
dominio y las credenciales del hosting.

El estado vivo, con bloqueos y decisiones abiertas, está en
[`docs/MEMORIA.md`](docs/MEMORIA.md).

---

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Infraestructura, entornos, fases, checklist de lanzamiento |
| [`docs/AGENTES.md`](docs/AGENTES.md) | El equipo de subagentes y el flujo entre ellos |
| [`docs/MEMORIA.md`](docs/MEMORIA.md) | Estado del proyecto y decisiones, con su estado epistémico |
| [`docs/adr/`](docs/adr/) | Decisiones de arquitectura, con su motivo y cuándo reabrirlas |
| [`docs/runbooks/`](docs/runbooks/) | Procedimientos paso a paso |
