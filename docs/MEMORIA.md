# MEMORIA.md — Continuidad entre sesiones

> Mantenido por el agente `escriba-memoria`. Se lee al abrir cada sesión y se
> actualiza al cerrarla.
>
> Estados: `DECIDIDO` (no se reabre sin ADR) · `PROPUESTO` (sin confirmar) ·
> `DESCARTADO` (con motivo, siempre) · `ABIERTO` (requiere decisión humana).

**Fase actual: 0 — Base.**
Criterio de salida: un "hola mundo" llega a staging automáticamente.

**Última actualización:** 2026-08-04

---

## Estado de la fase 0

| Elemento | Estado |
|---|---|
| Repositorio y estructura | Hecho |
| Astro 7 estático, i18n ES/EN | Hecho |
| Sistema de diseño (tokens, contraste AA verificado) | Hecho |
| `.htaccess` versionado en `public/` | Hecho |
| Gates de CI (placeholders, datos, tipos, tests, presupuesto) | Hecho |
| Workflows: PR, staging, producción | Escritos, **sin ejecutar todavía** |
| Despliegue real a staging | **Bloqueado** — faltan credenciales y dominio |
| SSL / AutoSSL | **Bloqueado** — depende del dominio |

Estado medido en la última verificación local: build en verde, 4 páginas,
**0 KB de JavaScript**, 2.4 KB de CSS comprimido, 11 tests en verde.

---

## DECIDIDO

- **ADR-001 — Sitio estático con Astro 7, sin backend en el hosting compartido.**
  Cero runtime en producción. Ver `docs/adr/ADR-001-sitio-estatico-astro.md`.
- **Build en GitHub Actions; al servidor solo llega `dist/`.** Subir
  `node_modules/` quemaría entre el 15 % y el 25 % de la cuota de 300 000 inodes
  sin beneficio.
- **`rsync` sobre SSH como método principal; FTPS como fallback.**
- **`.htaccess` versionado dentro de `public/`,** para que viaje en `dist/` y
  `rsync --delete` sea seguro.
- **Cartas y héroes son canon del juego.** La web los consume, no los edita.
- **Deckbuilder sin backend; el mazo viaja en la URL.**
- **i18n ES/EN desde el inicio.**
- **ADR-002 — Código en inglés, documentación y contenido en español.**
  Directiva del proyecto (2026-08-04). Implica renombrar respecto a la
  estructura propuesta en `DEPLOY.md` §3: `cards.json`, `heroes.json`,
  `schemas.ts`, `DATA_VERSION`, `src/content/news/`, `npm run data:validate`.
  Las URLs públicas siguen siendo del idioma del visitante (`/es/noticias/`,
  `/en/news/`) porque son contenido, no código.
  Ver `docs/adr/ADR-002-idioma-del-proyecto.md`.
- **ADR-003 — El dominio se inyecta por entorno, no se escribe en el repo.**
  `SITE_URL` → `scripts/postbuild.mjs` → `dist/.htaccess` y `dist/robots.txt`.
  Un gate (`npm run placeholders`) rompe el build si un token sobrevive.
  Resuelve la prohibición de placeholders sin tener que decidir el dominio ya.
  Ver `docs/adr/ADR-003-dominio-por-entorno.md`.
- **La raíz `/` es una página de reparto de idioma,** no una redirección de
  Apache. Un hosting estático no puede negociar `Accept-Language` sin romper la
  caché de la CDN, y una redirección incondicional a `/es/` dejaría al visitante
  anglófono sin salida visible.
- **`deckRules` vale `null` mientras el juego no exporte las reglas de
  construcción.** No se rellena con valores plausibles: el tamaño de mazo y los
  límites de copias por rareza son balance. El validador exige reglas reales en
  cuanto haya un solo héroe cargado.

---

## PROPUESTO

- **Cloudflare gratis por delante del dominio.** Caché global, absorción de picos
  el día del lanzamiento, DDoS. Requiere mover los nameservers en Namecheap.
  Pendiente de decidir. Si se hace: SSL en modo *Full (strict)*, y dejar el
  dominio en DNS-only durante la emisión inicial de AutoSSL.
- **Pagefind para el buscador estático.** Ya integrado en el pipeline
  (`npm run search:index`) y funcionando. Alternativa si el catálogo se queda por
  debajo de ~300 cartas: índice JSON propio, más ligero.
- **Giscus para comentarios.** Requiere que la audiencia tenga cuenta de GitHub;
  puede no encajar con jugadores de un CCG.
- **Decap CMS o TinaCMS** si el flujo de Git resulta ser fricción real para los
  socios no técnicos. Decidir después de que publiquen su primer post a mano.
- **Imagen OG por defecto (`/og/default.png`).** El componente `Seo.astro` ya
  acepta el parámetro y omite la etiqueta si el asset no existe. Falta el diseño.
  Bloquea el cumplimiento de "ninguna página se publica sin imagen OG".
- **JSON-LD (`VideoGame`, `Article`, `BreadcrumbList`).** Fase 1–2, dueño
  `seo-tecnico`. No se implementó en fase 0 por disciplina de alcance.
- **Tipografía autoalojada en woff2.** Ahora mismo se usa el stack del sistema,
  coste 0 KB. Cuando haya identidad de marca definida, `disenador-ui` la sustituye.

---

## ABIERTO — requiere decisión humana

Ordenados por lo que bloquean.

1. **¿Cuál es el dominio?** *Bloquea el despliegue real, AutoSSL, el subdominio
   de staging y las URLs canónicas.* Todo lo demás está listo: solo hay que
   definir las variables `SITE_URL_PROD` y `SITE_URL_STAGING` en GitHub.
   Pregunta asociada: ¿el dominio es el del estudio o uno propio del juego? La
   respuesta cambia la estructura de subdominios.
2. **Credenciales del hosting.** *Bloquea todo despliegue.* Hacen falta como
   GitHub Secrets: `SSH_HOST`, `SSH_PORT` (no es el 22; confirmar en cPanel →
   SSH Access, habitualmente `21098`), `SSH_USER`, `SSH_PRIVATE_KEY`,
   `DEPLOY_PATH_PROD`, `DEPLOY_PATH_STAGING`. Procedimiento en
   `docs/runbooks/rotar-claves.md`.
3. **¿Existe pipeline de exportación de datos desde Unity, o hay que
   construirlo?** *Bloquea las fases 3 y 4 por completo.* Sin export, el
   compendio y el deckbuilder no pueden existir sin inventar balance, y eso está
   prohibido. Si la respuesta es "hay que construirlo", el interino aceptable es
   un JSON mantenido a mano **con fecha límite registrada aquí**.
4. **¿Qué entidad legal figura como responsable del tratamiento de datos?**
   *Bloquea la captura de correos y, por tanto, la newsletter de la fase 1.*
   Conviene resolverlo antes del primer suscriptor, no después.
5. **¿Quién asume el rol de editor de contenido dentro del estudio?** *Bloquea
   la fase 2 en la práctica:* sin un dueño, el blog se publica dos veces y se
   abandona.
6. **¿Plan de hosting concreto?** El límite de 20 GB de Stellar es holgado para
   un sitio estático, pero conviene confirmar cuál se contrató, sobre todo por
   la disponibilidad de SSH.
7. **Discrepancia menor en `AGENTES.md`:** la tabla del §1 dice 8 agentes Sonnet
   y 4 Haiku, pero las etiquetas por agente de los §3 y §4 suman 9 Sonnet y 3
   Haiku. Se implementaron las etiquetas por agente, que son más específicas.
   Confirmar cuál es la intención.

---

## DESCARTADO

Con su motivo. **Sin el motivo, la misma idea vuelve cada tres sesiones.**

- **Laravel o Node/Passenger en el shared hosting.** Procesos vivos en un plan
  con límite de *entry processes*; se convierten en cuello de botella
  exactamente el día del lanzamiento, que es cuando llega el tráfico. Passenger
  además se duerme por inactividad y reinicia sin aviso. Ver ADR-001.
- **WordPress.** Superficie de ataque y mantenimiento desproporcionados para
  tres tipos de contenido que caben en Markdown.
- **Commitear `node_modules/` o `dist/` a `main`.** Ensucia el historial,
  multiplica el tamaño del repo y quema la cuota de inodes.
- **Editar archivos directamente por el File Manager de cPanel en producción.**
  El siguiente `rsync --delete` los borra sin dejar rastro, y el cambio se pierde
  justo cuando alguien confía en que está aplicado.
- **Redirección incondicional de `/` a `/es/` en `.htaccess`.** Deja al visitante
  anglófono sin salida visible y rompe la caché de una CDN por delante.
- **Google Fonts.** Petición a un tercero en la ruta crítica y problema de
  privacidad. Las tipografías se autoalojan.

---

## Bitácora

### 2026-08-04 — Sesión 1: arranque

Se levantó el proyecto completo de fase 0 desde un directorio con solo los dos
documentos de partida.

- Repositorio Git iniciado, remoto `origin` configurado.
- Astro 7.1.6 estático con i18n ES/EN, `trailingSlash: 'always'`,
  `build.format: 'directory'`.
- Sistema de diseño con contraste AA calculado y anotado token a token.
- Gates de CI implementados y verificados en local: `check-placeholders.mjs`,
  validación de datos por esquema Zod, typecheck, tests, `check-budget.mjs`.
- Tres workflows escritos (PR, staging, producción). **Ninguno se ha ejecutado:**
  faltan dominio y credenciales.
- 15 subagentes y 6 comandos definidos en `.claude/`.
- `src/data/` queda con catálogo vacío y `DATA_VERSION` en `0.0.0`, a propósito:
  no se inventó ni una carta ni una regla de construcción.

Pendiente inmediato: desbloquear los puntos 1 y 2 de ABIERTO para que la fase 0
pueda cerrarse de verdad (el criterio de salida exige que el "hola mundo" llegue
a staging **automáticamente**, y eso todavía no ha ocurrido).
