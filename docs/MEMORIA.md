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
| Dominio decidido (`heroduelccg.com`) | Hecho |
| Workflow de la rama `deploy` (vía activa) | Escrito, **pendiente de primera ejecución** |
| Configuración de cPanel apuntando a `deploy` | **Pendiente** — la hace un humano |
| Workflows de rsync (PR, staging, producción) | Escritos, **inactivos** por falta de secretos SSH |
| SSL / AutoSSL | Pendiente de verificar tras el primer despliegue |

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
- **El dominio es `heroduelccg.com`** (2026-08-04). Vive en el repositorio como
  valor por defecto: es información pública, no un secreto. `SITE_URL` lo
  sobrescribe para staging, y staging **falla** si no define el suyo — heredar el
  dominio real generaría canónicas apuntando a producción desde una copia que no
  debe indexarse.
- **ADR-004 — Se despliega por rama de artefactos, no por rsync.** GitHub
  Actions construye y publica el sitio en una rama `deploy`; cPanel clona esa
  rama. `main` **nunca** se despliega directo: cPanel no construye el sitio, y un
  `.cpanel.yml` en `main` publicaría el código fuente y ninguna página. Los
  workflows de rsync quedan escritos pero solo lanzables a mano.
  Ver `docs/adr/ADR-004-despliegue-por-rama-de-artefactos.md`.
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

1. **Configurar Git Version Control de cPanel apuntando a la rama `deploy`.**
   *Bloquea el primer despliegue real.* Es trabajo humano, no de CI: clonar el
   repositorio en `~/repositories/`, **fuera de `public_html`**, y seleccionar
   `deploy` como *Checked-Out Branch*. Si queda en `main`, se publica el código
   fuente y ninguna página. Paso a paso en `docs/runbooks/desplegar-cpanel.md`.
2. **Credenciales SSH del hosting.** *Ya no bloquea el despliegue* (ADR-004 lo
   resolvió por otra vía), pero **sí bloquea las tres cosas que se perdieron**:
   despliegue automático de punta a punta, publicación casi atómica y rollback en
   segundos con respaldo previo. Hacen falta como GitHub Secrets: `SSH_HOST`,
   `SSH_PORT` (no es el 22; confirmar en cPanel → SSH Access, habitualmente
   `21098`), `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH_PROD`,
   `DEPLOY_PATH_STAGING`. Procedimiento en `docs/runbooks/rotar-claves.md`.
3. **¿Se crea el subdominio de staging (`staging.heroduelccg.com`)?**
   *Bloquea el criterio de salida de la fase 0*, que exige que el "hola mundo"
   llegue **a staging** automáticamente. Con la vía actual el despliegue va a
   producción y requiere dos clics manuales, así que la fase 0 cierra con una
   salvedad registrada, no con el criterio literal cumplido.
4. **¿Existe pipeline de exportación de datos desde Unity, o hay que
   construirlo?** *Bloquea las fases 3 y 4 por completo.* Sin export, el
   compendio y el deckbuilder no pueden existir sin inventar balance, y eso está
   prohibido. Si la respuesta es "hay que construirlo", el interino aceptable es
   un JSON mantenido a mano **con fecha límite registrada aquí**.
5. **¿Qué entidad legal figura como responsable del tratamiento de datos?**
   *Bloquea la captura de correos y, por tanto, la newsletter de la fase 1.*
   Conviene resolverlo antes del primer suscriptor, no después.
6. **¿Quién asume el rol de editor de contenido dentro del estudio?** *Bloquea
   la fase 2 en la práctica:* sin un dueño, el blog se publica dos veces y se
   abandona.
7. **¿Plan de hosting concreto?** El límite de 20 GB de Stellar es holgado para
   un sitio estático, pero conviene confirmar cuál se contrató, sobre todo por
   la disponibilidad de SSH.
8. **Discrepancia menor en `AGENTES.md`:** la tabla del §1 dice 8 agentes Sonnet
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

### 2026-08-05 — Sesión 2: despliegue real

- Dominio decidido: `heroduelccg.com`.
- ADR-004: se despliega por rama de artefactos con Git Version Control de
  cPanel, porque los secretos SSH siguen sin existir.
- cPanel configurado apuntando a `deploy`. Primer despliegue ejecutado: los
  archivos llegaron a `public_html`.
- **Incidente — permisos.** El sitio respondía con un listado de directorio en
  `/` y 404 en todo lo demás. Causa: `rsync -a` preserva los permisos del
  origen, y el clon de git de cPanel hereda el umask restrictivo de la cuenta
  (600/700). LiteSpeed no podía leer los archivos **ni el `.htaccess`**, así que
  además de los 404 quedaron inactivas la redirección canónica, las cabeceras de
  seguridad y `Options -Indexes`.
  Corregido con `--chmod=D755,F644` en `deploy/cpanel.yml`.
  Lección registrada en el runbook: **un "Index of /" no es un despliegue
  parcial, es un despliegue fallido**, aunque los archivos se vean.
- **Segundo incidente, de procedimiento:** dos despliegues seguidos publicaron
  la misma versión rota. Causa: se pulsó *Deploy HEAD Commit* sin *Update from
  Remote*, y `Deploy` solo publica lo que el servidor ya tiene. La pista está en
  el panel: cambia "Last Deployed on" pero no el SHA. Anotado en el runbook.
- **Sitio verificado en producción (2026-08-05, commit de datos `e926f37`):**
  rutas `/`, `/es/`, `/en/`, sitemap, robots y favicon en 200; `http`, `www` y
  las rutas sin barra final redirigen con un solo 301 al ápice en HTTPS; las
  siete cabeceras de seguridad presentes, CSP en Report-Only; assets con hash
  cacheados un año e HTML con `must-revalidate`; 404 propio en vez del de
  LiteSpeed; SSL válido; **cero JavaScript** en la landing; `src/`,
  `package.json`, `docs/`, `.env`, `.git/` y `.cpanel.yml` inaccesibles.

**La fase 0 queda funcionalmente cerrada**, con una salvedad registrada: el
criterio de salida literal pide que el "hola mundo" llegue **a staging** de
forma **automática**. Llega a **producción** y con **dos clics manuales** en
cPanel. Ver ADR-004 y los puntos 2 y 3 de ABIERTO.
