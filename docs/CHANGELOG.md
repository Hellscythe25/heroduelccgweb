# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

Este proyecto maneja **dos versionados separados y no confundibles**:

- **Versión del sitio** — SemVer, para la web en sí.
- **Versión de datos** — el parche del juego que muestra el catálogo.

Mantenido por el agente `escriba-changelog`, derivado de los commits
convencionales. Las entradas no se escriben a mano.

---

## [No publicado]

### Corregido — imagen para redes (2026-10-31, rama `fix/seo-og-image-cache`)

- La imagen OG lleva el hash del contenido en su URL. WhatsApp seguía
  mostrando la imagen anterior porque la URL era la misma
  (`/og/default.png`) y la caché duraba una semana.

### Añadido — arte del juego (2026-10-31, rama `feat/landing-game-art`)

- Ilustraciones del juego en el sitio: los cinco retratos, sus arenas, escenas
  de duelo, tablero y campaña, y el emblema del juego en la cabecera.
  `scripts/import-game-art.mjs` las copia y optimiza desde el juego; Astro sirve
  AVIF y WebP en varios anchos.
- Portada con la alineación de los cinco héroes, enlazada a cada ficha.
- Fichas de héroe con el retrato sobre su arena.
- Aviso en el pie: las ilustraciones son provisionales.
- Colores de la interfaz del juego: botón principal en oro fundido, marcos de
  carta con su ilustración por tipo, sección "Tres monedas" con los iconos y
  colores de monedas, esencia y gemas.
- Detalles: cabecera fija translúcida, grano sutil, brasas y entrada
  escalonada de los héroes en la portada (sin movimiento si el sistema pide
  reducirlo).
- Logo del juego en cabecera, portada y pie; favicons nuevos
  (`scripts/generate-icons.mjs`) e imagen OG con el logo y los cinco héroes.

### Cambiado — arte del juego

- Texto en Space Grotesk, la tipografía del juego (`@fontsource/space-grotesk`).
- Sin antetítulos en mayúsculas sobre los títulos de página; rejillas de texto
  con filo dorado en lugar de tarjetas.

### Añadido — fase 1, contenido (2026-10-31, rama `feat/landing-game-heroes`)

- Portada nueva y páginas El juego (`/es/juego/`, `/en/game/`), Cómo se juega
  (`/es/como-se-juega/`, `/en/how-to-play/`) y Héroes (`/es/heroes/`,
  `/en/heroes/`), con los textos largos en `src/i18n/pages/`.
- Héroes importados del juego con `scripts/import-game-data.mjs` (ADR-005).
  Versión de datos: **0.6.0**.
- Emblemas geométricos por héroe (`HeroEmblem.astro`) en lugar de arte.
- Esqueleto del devlog (`/es/devlog/`, `/en/devlog/`), oculto hasta la primera
  entrada.
- Borradores de Política de privacidad y Términos de uso
  (`src/content/legal/`), con interruptor de publicación en `src/legal.ts`.
- Tests de paridad de los textos largos, de presentación por héroe, del
  importador y de los documentos legales.

### Cambiado — fase 1, contenido

- El nombre del sitio pasa a **Hero Duel CCG**.
- Sistema visual "Forja Oscura" del juego: paleta de `Theme.uss`, Cinzel 700
  autoalojada para h1/h2 y solo tema oscuro.
- `HeroSchema` se ajusta al juego (id de texto, vida, campaña); `deckRules`
  solo es obligatorio cuando hay cartas.
- Menú principal sin "Inicio" (la marca ya enlaza a la portada) y con objetivos
  táctiles de 44 px.
- Imagen OG regenerada con la marca nueva.

### Añadido

- Base del proyecto: Astro 7 con salida estática, i18n ES/EN desde el inicio.
- Sistema de diseño con tokens de color, tipografía, espaciado y radios, con
  contraste AA calculado y anotado por par texto/fondo.
- Gates de CI: verificación de placeholders, validación de datos del juego
  contra esquema Zod, typecheck, tests y presupuesto de rendimiento.
- Workflows de GitHub Actions para checks de PR, despliegue a staging y
  despliegue a producción.
- `public/.htaccess` versionado, con cabeceras de seguridad, caché por tipo de
  asset, compresión y bloqueo de dotfiles.
- Inyección del dominio canónico en build desde `SITE_URL` (ADR-003).
- Endurecimiento automático de staging: `noindex` y `robots.txt` restrictivo.
- Contrato de datos del juego en `src/data/schemas.ts`, con comprobaciones de
  unicidad, referencias cruzadas y coherencia de versión.
- 15 subagentes y 6 comandos de Claude Code en `.claude/`.
- Documentación: ADR-001, ADR-002, ADR-003, memoria de proyecto y runbooks.
- Despliegue por rama de artefactos: CI construye y publica el sitio en la rama
  `deploy`, que clona Git Version Control de cPanel (ADR-004).
- Protección de `main` versionada como ruleset importable en
  `.github/rulesets/main.json`.
- Imagen OG por defecto generada desde los tokens del sistema de diseño
  (`scripts/generate-og.mjs`), aplicada a toda página sin imagen propia.
- Enlaces externos centralizados en `src/site.ts`, con los CTA de la landing
  condicionados a que la URL exista.
- Kit de prensa en formato `presskit()` (`src/press.ts` y `/es/prensa/`,
  `/en/presskit/`), que se publica solo cuando deja de faltarle campos.

### Corregido

- La landing afirmaba una mecánica del juego que no procedía del estudio.
  Sustituida por la afirmación mínima defendible.
- Textos internos de fase visibles al público, en la landing y en el pie.
- Permisos del despliegue: `rsync` heredaba el umask del clon de git y el
  servidor no podía leer los archivos ni el `.htaccess`.
- `<header>` dentro de `<article>` duplicaba un landmark de banner.

**Versión del sitio:** sin publicar todavía; no se ha etiquetado ninguna.
**Versión de datos:** `0.0.0` — el catálogo aún no está vinculado a un parche
del juego. Ver `docs/MEMORIA.md`, ABIERTO.
