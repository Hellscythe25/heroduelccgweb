# MEMORIA.md — Continuidad entre sesiones

> Mantenido por el agente `escriba-memoria`. Se lee al abrir cada sesión y se
> actualiza al cerrarla.
>
> Estados: `DECIDIDO` (no se reabre sin ADR) · `PROPUESTO` (sin confirmar) ·
> `DESCARTADO` (con motivo, siempre) · `ABIERTO` (requiere decisión humana).

**Fase actual: 1 — Landing.**
Criterio de salida: producción en vivo y la prensa puede citar el juego.

**Última actualización:** 2026-10-31 (sesión 4, rama `feat/landing-game-heroes`)

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
| Workflow de la rama `deploy` (vía activa) | Hecho y ejecutado |
| Configuración de cPanel apuntando a `deploy` | Hecho |
| Sitio en producción y verificado | Hecho (2026-08-05) |
| SSL / AutoSSL | Verificado, sin advertencias |
| Imagen OG por defecto | Hecha — `scripts/generate-og.mjs` |
| Workflows de rsync (PR, staging, producción) | Escritos, **inactivos** por falta de secretos SSH |
| Protección de `main` | Hecha y verificada (2026-08-06) |

Estado medido en la última verificación: build en verde, 4 páginas,
**0 KB de JavaScript**, 2.6 KB de CSS comprimido, 11 tests en verde.

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

- **Decisiones del dueño del 2026-10-31** (sesión 4):
  - El nombre comercial es **Hero Duel CCG**. *TCGMaster* es solo el nombre
    interno del proyecto de Unity y no aparece en el sitio. La editorial es
    Inca Games (inca.games); no se enlaza salvo que el dueño lo pida.
  - Se continúa **este** repositorio (no se reconstruye de cero) con el
    despliegue actual de cPanel.
  - Alcance de la fase 1: inicio, el juego, cómo se juega, héroes, esqueleto
    del devlog y borradores de Privacidad y Términos. Compendio y deckbuilder
    siguen fuera.
  - ~~No se publica el arte provisional~~ — **revisado el mismo día**: el
    dueño pidió usar las imágenes del juego. Se publican retratos, arenas,
    escenas y el emblema, importados con `scripts/import-game-art.mjs`, con un
    aviso en el pie de que son provisionales. El emblema geométrico queda como
    respaldo para un héroe sin retrato.
  - El responsable de los datos en los legales es **Inca Games** (Nueva
    Jersey, EE. UU.).
  - El pie acredita al estudio: **"Desarrollado por" Wildcat Games**, con su
    logo oficial (kit de marca de Wildcat) y enlace a wildcatgames.net.
  - **El número de héroes es abierto**: llega un sexto y habrá más. Ningún
    diseño ni texto fija cuántos son; un héroe nuevo entra al aparecer en
    `src/data/heroes.json` (con su retrato y su color en `tokens.css`, o con el
    emblema y el oro de respaldo mientras no los tenga). `tests/heroes.test.ts`
    lo vigila.
- **Los datos del juego no publicables todavía** (decisión del juego, no de la
  web): fechas internas de la beta y del lanzamiento, nombres de rango (copian
  a World of Warcraft y se van a sustituir), precios y número de cartas.

---

## PROPUESTO

- **ADR-005 — Héroes importados del `ContentDatabase.json`** con
  `scripts/import-game-data.mjs`. Ver `docs/adr/ADR-005-datos-del-juego-desde-contentdatabase.md`.
- **Solo tema oscuro, con el sistema "Forja Oscura" del juego** (GDD §14 y
  `Theme.uss`): carbón `#0b0c10`, oro `#e0b357`, Cinzel 700 autoalojada para
  h1/h2 (15 KB, `@fontsource/cinzel`, OFL). El tema claro se retiró porque los
  colores de héroe obligarían a verificar cada par dos veces. Contrastes
  anotados en `src/styles/tokens.css`.
- **Legales y devlog con interruptor de publicación**, como el kit de prensa:
  `src/legal.ts` (`draft` / `published`) y `src/devlog.ts` (hay entradas o no).
  En borrador: `noindex`, fuera del sitemap y sin enlace.
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
- **JSON-LD (`VideoGame`, `Article`, `BreadcrumbList`).** Fase 1–2, dueño
  `seo-tecnico`. `VideoGame` necesita datos que todavía no existen (plataformas,
  fecha, género declarado): se implementa junto con el presskit, no antes.
- **Tipografía autoalojada en woff2.** Ahora mismo se usa el stack del sistema,
  coste 0 KB. Cuando haya identidad de marca definida, `disenador-ui` la sustituye.

---

## ABIERTO — requiere decisión humana

Ordenados por lo que bloquean.

1. **Credenciales SSH del hosting.** *Ya no bloquea el despliegue* (ADR-004 lo
   resolvió por otra vía), pero **sí bloquea las tres cosas que se perdieron**:
   despliegue automático de punta a punta, publicación casi atómica y rollback en
   segundos con respaldo previo. Hacen falta como GitHub Secrets: `SSH_HOST`,
   `SSH_PORT` (no es el 22; confirmar en cPanel → SSH Access, habitualmente
   `21098`), `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH_PROD`,
   `DEPLOY_PATH_STAGING`. Procedimiento en `docs/runbooks/rotar-claves.md`.
2. **¿Se crea el subdominio de staging (`staging.heroduelccg.com`)?**
   *Bloquea el criterio de salida de la fase 0*, que exige que el "hola mundo"
   llegue **a staging** automáticamente. Con la vía actual el despliegue va a
   producción y requiere dos clics manuales, así que la fase 0 cierra con una
   salvedad registrada, no con el criterio literal cumplido.
3. *(Parcialmente resuelto el 2026-10-31 por ADR-005 para los héroes; las
   cartas y las reglas de construcción siguen pendientes.)*
   **¿Existe pipeline de exportación de datos desde Unity, o hay que
   construirlo?** *Bloquea las fases 3 y 4 por completo.* Sin export, el
   compendio y el deckbuilder no pueden existir sin inventar balance, y eso está
   prohibido. Si la respuesta es "hay que construirlo", el interino aceptable es
   un JSON mantenido a mano **con fecha límite registrada aquí**.
4. *(2026-10-31: el dueño decidió que es Inca Games. Faltan la razón social
   exacta, la dirección, los correos de privacidad y de contacto, la edad
   mínima, la ley aplicable y la revisión legal. Los borradores están en
   `src/content/legal/`, con cada hueco marcado `[PENDIENTE]`. Además, el
   juego debe resolver antes de publicarlos el consentimiento real de
   Analytics y una vía de borrado de cuenta; ver la bitácora de la sesión 4.)*
   **¿Qué entidad legal figura como responsable del tratamiento de datos?**
   *Bloquea las páginas legales de la fase 1.* No se publica una política de
   privacidad con un responsable inventado: un documento legal falso es peor que
   su ausencia. Hace falta razón social exacta, identificador fiscal, domicilio
   y un correo para ejercicio de derechos. Al no haber newsletter ni analítica,
   ahora mismo el sitio **no trata datos personales**, así que esto ya no es
   urgente — pero vuelve a serlo el día que se añada cualquiera de las dos.
5. **Enlaces externos: existen Steam y Discord, pero faltan las URLs.**
   *Bloquea los CTA de la landing*, que es la razón de ser de la fase 1. La
   estructura ya está lista: en cuanto se rellenen en `src/site.ts`, los botones
   aparecen en los dos idiomas. La invitación de Discord debe ser **permanente**;
   las que caducan a los 7 días dejan la landing rota sin que nadie se entere.
6. **Contenido real de la landing y del presskit.** *Bloquea el criterio de
   salida de la fase 1* ("la prensa puede citar el juego"). Hacen falta:
   descripción corta y larga, factsheet (plataformas, fecha, precio, modos,
   idiomas), logotipo en SVG y PNG, capturas a resolución completa, GIFs,
   tráiler y correo de contacto de prensa. Nada de eso puede redactarse aquí sin
   inventar.
7. **¿Quién asume el rol de editor de contenido dentro del estudio?** *Bloquea
   la fase 2 en la práctica:* sin un dueño, el blog se publica dos veces y se
   abandona.
8. **¿Plan de hosting concreto?** El límite de 20 GB de Stellar es holgado para
   un sitio estático, pero conviene confirmar cuál se contrató, sobre todo por
   la disponibilidad de SSH.
9. **Discrepancia menor en `AGENTES.md`:** la tabla del §1 dice 8 agentes Sonnet
   y 4 Haiku, pero las etiquetas por agente de los §3 y §4 suman 9 Sonnet y 3
   Haiku. Se implementaron las etiquetas por agente, que son más específicas.
   Confirmar cuál es la intención.

---

## DESCARTADO

Con su motivo. **Sin el motivo, la misma idea vuelve cada tres sesiones.**

- **Newsletter en la fase 1** (decisión del estudio, 2026-08-05). Se retoma
  cuando haya entidad legal definida y ganas de mantener una lista.
  *Consecuencia asumida:* `DEPLOY.md` §11 la marca como prioridad número uno de
  la fase, con el argumento de que una lista propia es el único canal que no
  depende del algoritmo de nadie. Los visitantes de la beta que pasen por el
  sitio en este periodo no dejan forma de contacto y no vuelven solos. Si se
  reabre, la opción con menos coste técnico es Buttondown: es la única de las
  tres evaluadas que permite un formulario HTML puro, sin JavaScript, sin
  cookies y por tanto sin banner de consentimiento.
- **Analítica en la fase 1** (decisión del estudio, 2026-08-05).
  *Consecuencia asumida:* se lanza a ciegas — no se sabrá si la prensa entra al
  presskit ni si alguien pulsa el CTA de wishlist. A favor: CSP más estricta y
  cero JavaScript de terceros. Si se reabre, Cloudflare Web Analytics es
  gratuita, sin cookies y no exige mover los nameservers; basta el beacon.
- **Autoalojar Umami.** Exigiría un proceso vivo en el hosting compartido, que
  contradice el ADR-001. Si algún día se quiere Umami, es Umami Cloud.

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

### 2026-08-05 — Sesión 3: arranque de la fase 1

Decisiones del estudio: **sin newsletter y sin analítica** en esta fase; entidad
legal aún sin decidir, así que **no se publican legales**. Existen Steam y
Discord, pero las URLs todavía no están en el repositorio.

Construido y **publicado en producción** (PR #1, desplegado el 2026-08-06):

- `src/site.ts` como fuente única de enlaces externos. Un enlace vacío es una
  ausencia declarada, no un placeholder: el CTA no se renderiza en vez de
  apuntar a ninguna parte.
- Componente `CtaLink`, con objetivo táctil de 44 px y sin JavaScript.
- Landing reestructurada con hero y fila de CTA condicionada a `site.ts`.
- Imagen OG por defecto generada desde los tokens del sistema de diseño
  (`scripts/generate-og.mjs`), y `Seo.astro` la aplica a toda página que no
  traiga la suya. Cierra el requisito de `DEPLOY.md` §13.

**Corrección de contenido, importante.** La copia de la fase 0 contenía
afirmaciones que **inventé yo**, no el estudio: en concreto *"un juego de cartas
coleccionables donde cada héroe cambia las reglas del mazo"*, que describe una
mecánica concreta. En fase 0 era texto de relleno en un sitio que nadie visitaba;
desde ayer está **público**. Sustituida por la afirmación mínima defendible —
nombre, género y estado— hasta que el estudio confirme qué se puede decir.
Regla que lo cubría y que no se aplicó a tiempo: *cada afirmación sobre el juego
debe rastrearse a `src/data/` o a una decisión registrada*.

### 2026-08-06 — `main` protegida y fase 1 en producción

- **`main` protegida** con un ruleset versionado en `.github/rulesets/main.json`:
  obliga a PR, exige el check `Gates` en verde y la rama al día, y bloquea
  borrado y `push --force`. **Verificado empíricamente**, no solo activado: un
  push directo a `main` fue rechazado con "Changes must be made through a pull
  request" y "Required status check *Gates* is expected".
- Se guarda como JSON importable porque la interfaz de GitHub no deja
  seleccionar un check hasta que lo ha visto correr alguna vez — en un
  repositorio nuevo, `Gates` simplemente no aparece y parece que falta el
  workflow. La importación escribe el nombre directamente y esquiva el problema.
  **Si la protección se cambia desde la interfaz, hay que exportarla y
  actualizar ese archivo en el mismo PR:** un JSON que ya no describe la
  realidad es peor que no tenerlo.
- PR #1 fusionado y desplegado. Verificado en vivo: copia corregida en los dos
  idiomas, imagen OG sirviéndose (38 KB), rutas en 200, **7 de 7 cabeceras de
  seguridad**, ningún archivo de código accesible, 404 propio.
- El primer despliegue de fase 1 volvió a tropezar con lo mismo que el
  incidente anterior, y merece quedar escrito: al pulsar *Deploy* justo después
  del merge, la rama `deploy` **todavía no existía reconstruida** — el workflow
  tarda unos 2m 40s. Regla práctica: **espera a ver la ejecución en verde en
  Actions antes de tocar cPanel**, y solo entonces *Update from Remote* y
  *Deploy*.

### 2026-08-06 — Kit de prensa (rama `feat/landing-presskit`)

Montado el kit en formato `presskit()` con los datos vacíos y validados por
esquema, para que rellenarlo sea una lista de tareas y no un folio en blanco.

- `src/press.ts` — datos y esquema Zod. **No vive en `src/data/`**: esa carpeta
  es canon del juego, con dueño propio; esto es material de marketing que
  escribe el estudio y cambia por otros motivos.
- `missingPressKitFields()` devuelve, por cada campo obligatorio que falta, el
  motivo por el que hace falta. La página los muestra en una tabla.
- **Publicación automática por completitud:** mientras falte algo obligatorio la
  página se genera pero va con `noindex`, fuera del sitemap y sin enlace en el
  menú. Cuando no falte nada, se publica sola. Nadie tiene que acordarse de
  activarla, que es justo lo que se olvida.
- Rutas localizadas resueltas en `src/pages/[lang]/[section].astro`, con los
  slugs sacados de la tabla `routes`: `/es/prensa/` y `/en/presskit/`, y el
  selector de idioma salta de una a la otra sin volver a la home.
- El tráiler y el zip **no** son obligatorios: un periodista puede escribir la
  nota sin ellos, y no puede sin descripción, plataformas ni capturas.
- Mínimo de tres capturas. Con una sola, todas las notas publicadas se ven
  iguales.

Correcciones de paso: el pie decía "fase 0" —jerga interna que envejece sin que
nadie lo note— y el `<header>` dentro del `<article>` duplicaba un landmark de
banner para los lectores de pantalla.

**Faltan los 11 campos obligatorios.** La página los lista con su motivo; se
rellenan en `src/press.ts`.

### 2026-10-31 — Sesión 4: contenido real de la fase 1

Sesión abierta desde el proyecto del juego a petición del dueño. Producción
seguía en `acace91` (6 de agosto); la rama `deploy` ya tenía el kit de prensa
(`985445b`) sin publicar en cPanel.

Construido en `feat/landing-game-heroes`, fusionado como PR #4 (`a976434`) y
publicado por el dueño en cPanel el mismo día (build `b5f720e`):

- Portada nueva y páginas **El juego**, **Cómo se juega** y **Héroes**, en
  español e inglés. Los textos largos viven en `src/i18n/pages/` con paridad
  forzada por TypeScript y por `tests/pages.test.ts`.
- Héroes importados del juego (versión 0.6.0, ADR-005). Emblemas geométricos
  en SVG en lugar de retratos.
- Esqueleto del devlog (`/es/devlog/`, `/en/devlog/`), oculto hasta la primera
  entrada.
- Borradores de **Política de privacidad** y **Términos de uso** en
  `src/content/legal/`, redactados a partir de un inventario de lo que el juego
  hace de verdad (código y documentos del repositorio del juego), con aviso
  visible de borrador y de que no son asesoramiento legal.
- Sistema visual Forja Oscura, imagen OG nueva y menú que entra en dos líneas
  en un teléfono de 375 px.

Estado medido: 18 páginas, **0 KB de JavaScript**, 6.8 KB de CSS comprimido,
28 tests en verde, sin desbordamiento horizontal a 375 px.

**Hallazgos del inventario de datos que bloquean publicar los legales** (son
trabajo del juego, no de la web; los dos primeros y el tercero ya figuran en
su `CHECKLIST_Beta.md` o en su roadmap, el resto no):

- El cliente concede el consentimiento de Analytics sin preguntar
  (`GameAnalytics.cs`); la analítica solo está apagada en el panel de Unity.
- No hay borrado de cuenta ni exportación de datos.
- Datos de partida antiguos en la clase Default de Cloud Save son legibles por
  cualquier jugador hasta aplicar el `Deny Read`.
- El cliente recibe el PlayerId del rival en cada vista de partida.
- Los nombres visibles no tienen filtro ni moderación.
- La tienda no avisa en pantalla de que las compras son de prueba.

**El repositorio es público.** Hacer push de una rama publica en GitHub los
borradores y los textos. El dueño aprobó los textos de esta sesión antes del
push.

Antes, el dueño publicó por error la build anterior (`985445b`, kit de prensa)
al pulsar *Deploy* con el PR todavía abierto: la rama `deploy` solo cambia
cuando algo entra en `main`. Sin daño, porque esa build también estaba
pendiente, pero confirma la regla: **mirar el SHA del HEAD en cPanel antes de
pulsar Deploy**.

Verificado en vivo tras el despliegue: todas las rutas en 200 en los dos
idiomas, `noindex` en devlog, legales y prensa, sitemap con las 8 páginas
públicas y la raíz, Cinzel servida como `font/woff2`, las 7 cabeceras de
seguridad y las redirecciones de `http` y `www`.

---

## Cierre de sesión — 2026-10-31

### Estado al cerrar

| | |
|---|---|
| Sitio en producción | <https://heroduelccg.com> — verificado |
| Última versión desplegada | `b5f720e` (build de `a976434`, PR #4) |
| `main` | Protegida; sin PR abiertos salvo este de memoria |
| Ramas fusionadas sin borrar | `feat/landing-phase-1`, `feat/landing-presskit`, `feat/landing-game-heroes` |
| Rama obsoleta | `docs/memoria-fase-1-desplegada` (su PR #2 ya está cerrado) |

### Lo primero al retomar

1. Rellenar los `[PENDIENTE]` de los legales con los datos del dueño (razón
   social, dirección, correos, edad mínima, ley aplicable, plazos).
2. Cuando el juego tenga el consentimiento de Analytics y la vía de borrado de
   cuenta, revisión legal y paso a `published` en `src/legal.ts`.
3. URLs de Steam y Discord en `src/site.ts` cuando existan.
4. Contenido del kit de prensa (11 campos en `src/press.ts`).

---

## Cierre de sesión — 2026-08-06 (histórico)

### Estado al cerrar

| | |
|---|---|
| Sitio en producción | <https://heroduelccg.com> — verificado |
| Última versión desplegada | `acace91` (build de `e460d2b`) |
| `main` | Protegida y comprobada |
| PR abierto sin fusionar | `feat/landing-presskit` — contiene también la memoria |
| PR obsoleto | `docs/memoria-fase-1-desplegada` (#2) — su contenido ya viaja en el anterior; **cerrar** |
| Rama fusionada sin borrar | `feat/landing-phase-1` |

Producción **no** contiene todavía el kit de prensa: falta fusionar y desplegar.

### Lo primero al retomar

1. Fusionar `feat/landing-presskit`.
2. Esperar a **"Publicar rama deploy"** en verde (unos 2m 40s).
3. cPanel → *Update from Remote* → *Deploy HEAD Commit*.
4. Verificar `/es/prensa/`: debe responder pero con `noindex`, fuera del
   sitemap y sin enlace en el menú, listando los 11 campos que faltan.

### VIGILAR — incidencia sin diagnosticar

**El check `Gates` del PR #2 se colgó y GitHub lo canceló a los 15 minutos**,
que es exactamente el `timeout-minutes` del workflow. El mismo workflow tardó
**43 segundos** en el PR #1 y "Publicar rama deploy" tarda 2m 40s sobre el mismo
código, así que un PR que solo toca un `.md` no tiene motivo para tardar quince
minutos.

No se pudo diagnosticar: `gh` no está autenticado en la máquina de trabajo y no
hay acceso a los registros de Actions desde la sesión.

**Si se repite,** hay que mirar en qué paso se detiene:

| Paso donde se cuelga | Interpretación |
|---|---|
| `npm ci` | Red del runner; reintentar |
| `Índice de búsqueda` (pagefind) | Problema nuestro |
| `Publicar artefacto de preview` | Problema nuestro; es el único paso que no comparte con el workflow de despliegue |

Mientras no se repita, se trata como incidencia puntual de infraestructura. **No
se sube el `timeout-minutes` para "arreglarlo":** eso convertiría un cuelgue
visible en una espera larga y silenciosa.

### Recordatorio operativo que ya falló dos veces

`Deploy HEAD Commit` publica **lo que el servidor ya tiene**. Sin *Update from
Remote* antes, se republica la versión anterior. La señal es que cambia la hora
del último despliegue pero **no el SHA**.

### Lo que bloquea la fase 1, y no es técnico

Su criterio de salida es "la prensa puede citar el juego". Falta contenido que
solo puede aportar el estudio: las URLs de Steam y Discord, la descripción corta
y larga, el factsheet y las capturas. Detalle en ABIERTO, puntos 5 y 6.
