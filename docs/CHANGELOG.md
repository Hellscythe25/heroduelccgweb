# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

Este proyecto maneja **dos versionados separados y no confundibles**:

- **Versión del sitio** — SemVer, para la web en sí.
- **Versión de datos** — el parche del juego que muestra el catálogo.

Mantenido por el agente `escriba-changelog`, derivado de los commits
convencionales. Las entradas no se escriben a mano.

---

## [No publicado]

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

**Versión de datos:** `0.0.0` — el catálogo aún no está vinculado a un parche
del juego. Ver `docs/MEMORIA.md`, punto 3 de ABIERTO.
