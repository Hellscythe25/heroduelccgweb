# DEPLOY.md — Sitio web del videojuego

> Documento operativo de despliegue. Fuente de verdad para infraestructura, entornos y publicación.
> Todo agente de Claude Code que toque infraestructura debe leer este archivo primero.

| Campo | Valor |
|---|---|
| Proyecto | Web pública del videojuego (beta) |
| Hosting | Namecheap Shared Hosting (cPanel) |
| Dominio | Namecheap (registrar + DNS) |
| Stack decidido | Astro 7 → salida estática (`output: 'static'`) |
| Runtime en producción | **Ninguno** (solo archivos estáticos servidos por Apache/LiteSpeed) |
| Build | GitHub Actions (Node 22 LTS) |
| Publicación | `rsync` sobre SSH → `public_html` (fallback: FTPS) |
| Última revisión | 2026-08-04 |

---

## 1. Decisión de arquitectura (ADR-001)

**Estado: DECIDIDO** — Sitio estático generado con Astro, sin backend propio en el hosting.

### Por qué no Laravel / Node en el shared hosting

El shared hosting de Namecheap sí soporta PHP y sí tiene *Setup Node.js App* (Passenger), pero ambos caminos pagan un costo que este proyecto no necesita:

| Criterio | Astro estático | Laravel en cPanel | Node/Passenger en cPanel |
|---|---|---|---|
| Procesos en el servidor | 0 | PHP-FPM compartido | Passenger, se duerme y reinicia |
| Límite de "entry processes" | No aplica | Cuello de botella real | Cuello de botella real |
| Riesgo en pico de tráfico (lanzamiento, cobertura de prensa) | Nulo, es I/O de disco | Alto | Alto |
| Superficie de ataque | Casi nula | `.env`, DB, dependencias | Dependencias, runtime |
| Inodes consumidos | ~1.5k archivos | ~30k con `vendor/` | ~60k con `node_modules/` |
| Rollback | Copiar carpeta | Migraciones inversas | Reinstalar + restart |
| Costo de mantenimiento | Bajo | Medio-alto | Alto |

El plan tiene **límite de 300 000 archivos (inodes)**. Subir `node_modules/` al servidor quema entre el 15 % y el 25 % de esa cuota de un solo golpe, sin ningún beneficio: por eso **el build se hace en CI y al servidor solo llega `dist/`**.

### Lo que realmente necesita backend

Nada, en la v1. El desglose:

| Funcionalidad | ¿Backend? | Solución estática |
|---|---|---|
| Landing / presskit | No | HTML generado |
| Blog y noticias | No | Markdown/MDX en el repo → Content Collections |
| Fichas de héroes (pasivas/activas) | No | JSON validado en build |
| Catálogo de cartas | No | JSON validado + índice de búsqueda |
| Buscador de cartas | No | Pagefind o índice JSON precomputado |
| **Deckbuilder** | No | Estado en cliente + `deck code` en la URL + `localStorage` |
| Compartir mazos | No | El mazo *va codificado en la URL* (ver §7) |
| Newsletter | No | Servicio externo (Buttondown / Kit / MailerLite) |
| Comentarios | No | Giscus (GitHub Discussions) |
| Formulario de prensa | Marginal | Formspree, o un único `.php` de 30 líneas |

### Cuándo reabrir esta decisión

Migrar a Laravel (que ya conoces) o a un servicio externo solo si aparece **al menos una** de estas necesidades:

- Galería pública de mazos con votos, comentarios o ranking.
- Cuentas de usuario / vinculación con la cuenta del juego.
- Estadísticas de meta en vivo alimentadas por telemetría del juego.
- Editor de contenido con roles para los 5 socios que no tolere flujo de Git.

En ese escenario la recomendación **no** es meter Laravel en el shared hosting, sino: mantener el sitio estático y agregar una API aparte (VPS chico, o Supabase / Cloudflare Workers en free tier). El sitio estático sobrevive intacto aunque la API se caiga.

---

## 2. Restricciones reales del entorno

Verificado sobre la oferta actual de Namecheap Shared Hosting (planes Stellar / Stellar Plus / Stellar Business):

**Disponible**
- cPanel con *Git Version Control*, *File Manager*, *Cron Jobs*, *Setup Node.js App*.
- **SSH enjaulado (jailed)** en todos los planes Stellar → habilita `rsync` y `ssh`.
- SSL gratuito automático (AutoSSL / Let's Encrypt) con renovación automática.
- Apache o LiteSpeed según servidor; `.htaccess` funciona en ambos.
- MySQL/MariaDB, PHP seleccionable (5.x–8.x), subdominios.

**No disponible / no confiable**
- Sin root, sin Docker, sin `systemd`, sin daemons ni workers persistentes.
- Sin control sobre versiones de Node/PHP del sistema fuera de las herramientas de cPanel.
- El proceso de Passenger (Node) se duerme por inactividad y reinicia sin aviso.
- Cron mínimo razonable: 5 minutos (no usar para nada crítico).
- Backups del host: **no son un plan de recuperación**. Git es la fuente de verdad.

**Números a vigilar**
- Inodes: 300 000. Auditar con `find ~/public_html -type f | wc -l` después de cada deploy grande.
- Storage: 20 GB en Stellar, ilimitado (con fair use) en Plus/Business.
- El puerto SSH **no es el 22**. Namecheap usa un puerto alternativo (habitualmente `21098`). Confírmalo en **cPanel → SSH Access** antes de configurar CI.

---

## 3. Estructura del repositorio

```
repo/
├── .claude/
│   ├── agents/              # 15 subagentes (ver AGENTES.md)
│   └── commands/            # /deploy, /nueva-carta, /publicar-post
├── .github/workflows/
│   ├── deploy-prod.yml
│   ├── deploy-staging.yml
│   └── pr-checks.yml
├── docs/
│   ├── DEPLOY.md            # este archivo
│   ├── AGENTES.md
│   ├── MEMORIA.md           # continuidad entre sesiones (escriba-memoria)
│   ├── CHANGELOG.md
│   ├── adr/                 # ADR-001..N
│   └── runbooks/
├── public/
│   ├── .htaccess            # ← versionado, se despliega con el sitio
│   ├── robots.txt
│   └── favicon/
├── src/
│   ├── content/
│   │   ├── blog/            # .md — devlog, comunidad
│   │   ├── noticias/        # .md — parches, prensa
│   │   └── config.ts        # esquemas Zod de las colecciones
│   ├── data/
│   │   ├── cartas.json      # artefacto importado del repo del juego
│   │   ├── heroes.json      # idem
│   │   ├── esquemas.ts      # Zod: valida en build, rompe el build si falla
│   │   └── VERSION_DATOS    # ej. "0.8.3" — parche del juego
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── lib/
│       └── deckcode/        # codec + tests (la pieza más delicada)
├── tests/
├── astro.config.mjs
├── CLAUDE.md                # reglas globales del proyecto
└── package.json
```

---

## 4. Mapa de rutas

```
/                              Landing (beta, tráiler, CTA a wishlist/Discord)
/es/ | /en/                    i18n desde el día 1
/noticias/                     Índice de noticias (parches, prensa)
/noticias/[slug]/
/blog/                         Devlog / comunidad
/blog/[slug]/
/heroes/                       Índice de héroes
/heroes/[slug]/                Ficha: pasiva, activas, sinergias, cartas asociadas
/cartas/                       Catálogo filtrable + buscador
/cartas/[id]/                  Ficha individual (OG image propia)
/deckbuilder/                  Constructor de mazos
/deckbuilder/?d=<deckcode>     Mazo compartido, sin backend
/presskit/                     Kit de prensa (ver §11)
/rss.xml  /sitemap-index.xml  /404
```

`build.format: 'directory'` + `trailingSlash: 'always'` para URLs estables y sin duplicados en el índice de Google.

---

## 5. Fuente de verdad de los datos del juego

**Regla dura: la web no inventa ni edita números de balance.**

Cartas y héroes son **canon del juego**, no contenido de marketing. Si la web y el build divergen, la comunidad pierde confianza en el deckbuilder y en la wiki al mismo tiempo.

### Flujo recomendado

```
Repo del juego (Unity)
   └── exporta → cartas.json + heroes.json  (tarea de build del juego)
        └── publicado como GitHub Release con tag = parche  (game-data-v0.8.3)
             └── CI de la web descarga el artefacto pinneado
                  └── valida contra esquema Zod
                       └── si falla → BUILD ROTO (no se despliega nada)
```

`src/data/VERSION_DATOS` contiene el tag. Actualizarlo es un commit deliberado, revisable en PR. Nunca se apunta a `latest`.

### Por qué importa

- El deckbuilder puede mostrar "Mazo creado en el parche 0.8.2 — hay 3 cartas modificadas desde entonces".
- Al publicar notas de parche, el diff de `cartas.json` **genera** la tabla de cambios: el agente `curador-datos-juego` la produce, no se escribe a mano.
- Si aún no existe pipeline de exportación en Unity, el interino aceptable es un JSON mantenido a mano en el repo de la web **con un `TODO` de fecha límite**. La deuda es real y crece rápido.

---

## 6. Configuración del servidor: `.htaccess`

Va en `public/.htaccess` para que Astro lo copie a `dist/` y quede versionado. Así `rsync --delete` es seguro y el archivo no se pierde nunca.

```apache
# ---------------------------------------------------------------
#  Sitio estático (Astro). Namecheap / cPanel — Apache 2.4 o LiteSpeed
# ---------------------------------------------------------------

Options -Indexes +FollowSymLinks
DirectoryIndex index.html
DirectorySlash On
ErrorDocument 404 /404.html

AddDefaultCharset UTF-8

# --- 1. HTTPS + host canónico en un solo salto ---
RewriteEngine On

# No tocar el reto ACME de AutoSSL
RewriteCond %{REQUEST_URI} !^/\.well-known/

RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://TUDOMINIO.com%{REQUEST_URI} [L,R=301]

# --- 2. Cabeceras de seguridad ---
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS

  # CSP: arrancar en Report-Only, endurecer después de medir.
  # Astro 7 puede generar hashes/nonces; ver §14.
  Header always set Content-Security-Policy-Report-Only "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'"
</IfModule>

# --- 3. Caché ---
<IfModule mod_headers.c>
  # Assets con hash de contenido → inmutables un año
  <FilesMatch "\.[0-9a-zA-Z_-]{8}\.(js|css|woff2|avif|webp|png|jpe?g|svg|gif)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # Assets sin hash (favicon, OG, arte en /public) → una semana
  <FilesMatch "\.(woff2|avif|webp|png|jpe?g|svg|gif|ico)$">
    Header setifempty Cache-Control "public, max-age=604800"
  </FilesMatch>

  # HTML y feeds → siempre revalidar
  <FilesMatch "\.(html|xml|json)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>

# --- 4. Compresión ---
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml \
    application/javascript application/json application/xml image/svg+xml
</IfModule>

# --- 5. Bloqueos ---
# OJO: no bloquear .json (lo consumen el catálogo y el deckbuilder)
<FilesMatch "(^\.(?!well-known)|\.(map|md|mdx|yml|yaml|log|bak|sql|env|ts)$)">
  Require all denied
</FilesMatch>
```

Sustituir `TUDOMINIO.com` antes del primer deploy. El agente `ingeniero-despliegue` no debe dejar placeholders en `main`.

---

## 7. Deckbuilder sin backend

La única pieza con complejidad algorítmica real. Especificación:

### Deck code

Un mazo entero cabe en la URL. Formato propuesto (`v1`):

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

- Delta-encoding sobre ids ordenados: un mazo de 30 cartas cabe en ~40–60 caracteres.
- El byte de versión permite cambiar el formato sin romper los mazos ya compartidos.
- La versión de datos permite avisar: *"este mazo es del parche 0.8.2; 3 cartas cambiaron"*.

**Requisito no negociable: tests de round-trip con property-based testing.** Codificar → decodificar → comparar, sobre mazos generados aleatoriamente. Un bug aquí rompe cada enlace que la comunidad haya compartido, de forma permanente. Es la razón por la que `dev-deckbuilder` corre en Opus y tiene tests propios en el gate de CI.

### Estado y persistencia

- Mazo activo → `localStorage` (autoguardado, con nombre y fecha).
- Mazo compartido → parámetro `?d=` (la URL *es* el mazo; nada que almacenar).
- Import/export → JSON legible, además del deck code.
- Botón "copiar deck code" pensado para pegar en Discord.

### Reglas de validación

Las reglas de construcción (tamaño de mazo, copias máximas por rareza, restricción por héroe, coste) viven en `cartas.json`/`heroes.json`, **no** hardcodeadas en el componente. Si el balance cambia las reglas, el deckbuilder las hereda sin tocar código.

### Accesibilidad

Navegación completa por teclado, filtros como `<fieldset>` reales, anuncios ARIA al añadir/quitar cartas. Un deckbuilder que solo funciona con drag & drop excluye a parte de tu audiencia y se rompe en móvil.

---

## 8. Entornos

| Entorno | Rama | URL | Ruta en el servidor |
|---|---|---|---|
| Producción | `main` | `https://TUDOMINIO.com` | `~/public_html/` |
| Staging | `develop` | `https://staging.TUDOMINIO.com` | `~/staging/` |
| Preview | PR | artefacto de CI | — |

**Staging debe estar bloqueado a indexación**: subdominio protegido con *Directory Privacy* de cPanel (auth básica) **y** `X-Robots-Tag: noindex` desde su propio `.htaccess`. Un staging indexado canibaliza el SEO del dominio real.

---

## 9. Pipeline de despliegue (principal)

### Preparación única

1. **cPanel → SSH Access → Manage SSH Keys**: generar par o importar una clave pública dedicada a CI. Autorizarla. Anotar el puerto.
2. **Crear el subdominio de staging** apuntando a `~/staging`.
3. **GitHub → Settings → Secrets and variables → Actions**, crear:

   | Secret | Ejemplo |
   |---|---|
   | `SSH_HOST` | `serverXXX.web-hosting.com` |
   | `SSH_PORT` | `21098` |
   | `SSH_USER` | `usuariocpanel` |
   | `SSH_PRIVATE_KEY` | clave privada completa, incluidas las líneas BEGIN/END |
   | `DEPLOY_PATH_PROD` | `/home/usuariocpanel/public_html/` |
   | `DEPLOY_PATH_STAGING` | `/home/usuariocpanel/staging/` |

4. Proteger `main`: PR obligatorio, checks en verde, sin push directo.

### `.github/workflows/deploy-prod.yml`

```yaml
name: Deploy producción

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-prod
  cancel-in-progress: false

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22          # Astro 7 exige Node >= 22
          cache: npm

      - run: npm ci

      # ---- Gates: si algo falla, no se despliega nada ----
      - name: Validar datos del juego contra esquema
        run: npm run datos:validar

      - name: Typecheck
        run: npm run check          # astro check + tsc --noEmit

      - name: Tests (codec de mazos, validadores, utilidades)
        run: npm test

      - name: Build
        run: npm run build

      - name: Índice de búsqueda
        run: npx pagefind --site dist

      - name: Presupuesto de rendimiento
        run: npm run budget         # falla si el peso supera los límites de §12

      # ---- Publicación ----
      - name: Configurar SSH
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -p "${{ secrets.SSH_PORT }}" "${{ secrets.SSH_HOST }}" >> ~/.ssh/known_hosts

      - name: Respaldo remoto del despliegue anterior
        run: |
          ssh -p "${{ secrets.SSH_PORT }}" -i ~/.ssh/id_ed25519 \
            "${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}" \
            "rm -rf ~/backups/prev && mkdir -p ~/backups && \
             cp -a ${{ secrets.DEPLOY_PATH_PROD }} ~/backups/prev"

      - name: Rsync a public_html
        run: |
          rsync -az --delete --delay-updates --human-readable \
            -e "ssh -p ${{ secrets.SSH_PORT }} -i ~/.ssh/id_ed25519" \
            --exclude 'cgi-bin/' \
            --exclude '.well-known/' \
            dist/ "${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:${{ secrets.DEPLOY_PATH_PROD }}"

      - name: Verificación post-deploy
        run: |
          sleep 5
          curl -fsS -o /dev/null -w '%{http_code}\n' https://TUDOMINIO.com/
          curl -fsS -o /dev/null -w '%{http_code}\n' https://TUDOMINIO.com/deckbuilder/
          curl -fsS -o /dev/null -w '%{http_code}\n' https://TUDOMINIO.com/sitemap-index.xml
```

Notas importantes:

- `--delete` es seguro **porque `.htaccess` viaja dentro de `dist/`**. Si algún día se edita `.htaccess` directamente en el servidor, el siguiente deploy lo borra. Nunca editarlo por File Manager.
- `--delay-updates` aplica los cambios casi de golpe al final, reduciendo la ventana en la que el sitio queda mezclando versiones.
- `--exclude '.well-known/'` protege la renovación de AutoSSL.
- Si el shell enjaulado no trae `rsync`, cae al workflow FTPS.

### Fallback: FTPS

```yaml
      - name: Deploy vía FTPS
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          local-dir: ./dist/
          server-dir: /public_html/
          exclude: |
            **/.well-known/**
            **/cgi-bin/**
```

Más lento y sin garantías atómicas, pero funciona sin SSH. **Nunca FTP plano.**

### Alternativa: *Git Version Control* de cPanel

> **NOTA (2026-08-04): esta alternativa es la vía ACTIVA, no el pipeline de
> rsync de arriba.** Los secretos SSH todavía no existen, así que se implementó
> el patrón que describe esta sección: CI construye y publica los artefactos en
> una rama `deploy`, y cPanel clona *esa* rama. Ver
> `docs/adr/ADR-004-despliegue-por-rama-de-artefactos.md` y el runbook
> `docs/runbooks/desplegar-cpanel.md`.
>
> Los workflows de rsync se conservan escritos, pero solo se lanzan a mano.
> Volver a ellos cuando existan las credenciales es cambiar un disparador.

Sirve si prefieres no depender de GitHub Actions, pero tiene un límite serio: **cPanel no construye el sitio**. Habría que commitear `dist/` al repositorio, lo que ensucia el historial y multiplica el tamaño del repo.

Patrón viable si se elige: CI construye y hace push de `dist/` a una rama `deploy` que solo contiene artefactos; cPanel clona *esa* rama y despliega con `.cpanel.yml`.

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/USUARIO/public_html/
    - /bin/cp -R ./* $DEPLOYPATH
    - /bin/cp ./.htaccess $DEPLOYPATH
```

Advertencia: si una tarea de `.cpanel.yml` falla a mitad, cPanel se detiene y **no revierte** las anteriores. Las tareas deben ser cortas e idempotentes. Por eso el pipeline principal es rsync.

---

## 10. Rollback

Orden de preferencia, de más rápido a más lento:

1. **Restaurar el respaldo remoto** (segundos):
   ```bash
   ssh -p PUERTO usuario@host "rsync -a --delete ~/backups/prev/ ~/public_html/"
   ```
2. **Re-ejecutar el workflow desde el commit anterior**: Actions → `Deploy producción` → *Run workflow* sobre el SHA bueno (2–4 min).
3. **`git revert` + push a `main`** (deja rastro limpio en el historial; es la opción correcta si el fallo es de contenido y no de infraestructura).

Nunca `git push --force` sobre `main`.

---

## 11. Qué más recomiendo incluir

Ordenado por retorno sobre esfuerzo para un juego en beta.

### Alta prioridad — impacto directo en la beta

1. **Captura de correos antes que cualquier otra cosa.** Una lista propia es el único canal que no depende del algoritmo de nadie. Ponla en el hero de la landing, no en el pie.
2. **Presskit siguiendo el formato `presskit()`** (descripción corta y larga, factsheet, logos en SVG y PNG, capturas a resolución completa, GIFs, tráiler embebido, contacto). La prensa y los creadores de contenido buscan exactamente esa estructura; si no está, no cubren el juego. Zip descargable con todos los assets.
3. **Enlaces a tienda / wishlist arriba del pliegue** (Steam, itch.io) + invitación a Discord. Toda la web existe para empujar a esas tres acciones.
4. **Separar Devlog de Noticias.** Devlog es para la comunidad (proceso, decisiones de diseño, arte). Noticias es para parches y prensa. Feeds RSS distintos.
5. **i18n ES/EN desde el commit 1.** Retrofitear i18n cuesta 5–10× más que arrancar con él. Tu mercado natural es LATAM + global anglófono.

### Media prioridad — calidad y descubrimiento

6. **JSON-LD**: `VideoGame` en la landing, `Article` + `BreadcrumbList` en cada post. Es lo que hace que Google muestre el juego como entidad y no como página suelta.
7. **Imágenes OG generadas en build por carta y por héroe.** Cuando alguien pega el enlace de una carta en Discord o X, aparece la carta. Es distribución gratis; Astro las genera en el build sin costo en runtime.
8. **Buscador estático con Pagefind**, que indexa el sitio en build y funciona sin servidor.
9. **Analítica sin cookies**: Cloudflare Web Analytics o Umami. Cumple RGPD y la Ley 29733 peruana sin banner de cookies, que además destruye la conversión.
10. **Cloudflare gratis por delante del dominio.** Cambias los nameservers en Namecheap. Ganas caché global (tu servidor está en EE. UU., tu audiencia no), protección DDoS y absorción de picos de tráfico el día del lanzamiento. Usa SSL en modo *Full (strict)* y deja el dominio en modo DNS-only durante la emisión inicial de AutoSSL.
11. **Monitoreo de uptime** (UptimeRobot free, chequeo cada 5 min) sobre `/` y `/deckbuilder/`.
12. **Página 404 con personalidad** — una carta perdida, un héroe encogiéndose de hombros. Cuesta una hora y la gente la comparte.

### Base indispensable

13. **Legales**: política de privacidad, términos, y aviso de tratamiento de datos si capturas correos. Define **qué entidad** figura como responsable del tratamiento — con estructura SAC + C-Corp, esa elección tiene consecuencias reales y conviene resolverla antes del primer suscriptor, no después.
14. **`robots.txt` + `sitemap-index.xml`**, con staging explícitamente excluido.
15. **Auditoría de inodes** después de cada carga masiva de arte de cartas.

### Explícitamente fuera de alcance en la v1

- Cuentas de usuario, login, perfiles.
- Galería pública de mazos con votos.
- Estadísticas de meta en vivo.
- Wiki editable por la comunidad.
- Tienda / pasarela de pago propia.

Cada uno exige backend, moderación y mantenimiento sostenido. Reevaluar tras el lanzamiento 1.0, y cuando llegue el momento, como servicio aparte del sitio estático.

---

## 12. Presupuesto de rendimiento

Verificado en CI; el build falla si se excede.

| Métrica | Límite |
|---|---|
| JS enviado en la landing | ≤ 30 KB comprimido |
| JS en `/deckbuilder/` | ≤ 120 KB comprimido |
| CSS total | ≤ 40 KB comprimido |
| Peso de la página inicial | ≤ 500 KB |
| LCP (móvil, 4G simulado) | ≤ 2.0 s |
| CLS | ≤ 0.05 |
| Lighthouse (Rendimiento / A11y / SEO) | ≥ 95 / 100 / 100 |

Cómo mantenerlo:

- Cero JS por defecto: hidratar solo el deckbuilder y los filtros (`client:visible` / `client:idle`).
- Arte de cartas vía `astro:assets` → AVIF + WebP, dos tamaños, `loading="lazy"` fuera del pliegue.
- Miniaturas del catálogo bajo 20 KB. El arte a resolución completa solo en la ficha individual.
- Iconos de rareza/facción como sprite SVG, no como archivos sueltos (protege también la cuota de inodes).
- Fuentes: `woff2`, subconjunto latino, `font-display: swap`, autoalojadas (no Google Fonts).
- Tráiler: `youtube-nocookie` con carga diferida por fachada; nunca autoplay de un `<video>` pesado.

---

## 13. Checklist de lanzamiento

**DNS y dominio**
- [ ] Registros A/CNAME apuntando al hosting
- [ ] `www` redirige al ápice (o al revés) — una sola forma canónica
- [ ] AutoSSL emitido y renovando; probar `https://` sin advertencias
- [ ] Registros de correo (SPF, DKIM, DMARC) si usas correo del dominio

**Seguridad**
- [ ] HSTS activo
- [ ] CSP pasada de Report-Only a modo enforce
- [ ] Sin `.map`, `.env`, `.md` ni dotfiles accesibles públicamente
- [ ] Staging con auth básica y `noindex`
- [ ] Clave SSH de CI dedicada, con acceso solo a la ruta de deploy

**Contenido**
- [ ] Presskit completo y zip descargable
- [ ] Legales publicados y enlazados en el pie
- [ ] Paridad ES/EN en todas las páginas publicadas
- [ ] Sin lorem ipsum, sin placeholders, sin enlaces rotos (verificado en CI)

**Datos**
- [ ] `VERSION_DATOS` coincide con la build pública del juego
- [ ] Todas las cartas y héroes validan contra el esquema
- [ ] El deckbuilder aplica las reglas de construcción vigentes
- [ ] Tests de round-trip del deck code en verde

**Operación**
- [ ] Deploy de producción ejecutado y verificado
- [ ] Rollback probado al menos una vez (en staging)
- [ ] Monitoreo de uptime configurado
- [ ] Analítica recibiendo eventos
- [ ] Sitemap enviado a Google Search Console

---

## 14. Runbooks

Ubicados en `docs/runbooks/`. Escritos para que cualquiera de los 5 socios pueda ejecutarlos sin ayuda.

| Runbook | Contenido |
|---|---|
| `publicar-noticia.md` | Crear `.md`, frontmatter requerido, imagen OG, previsualizar, PR, merge |
| `actualizar-datos-juego.md` | Bump de `VERSION_DATOS`, validación, generación de tabla de cambios |
| `agregar-carta.md` | Arte, nomenclatura, campos obligatorios, verificación en el deckbuilder |
| `rollback.md` | Los tres caminos de §10, con comandos exactos |
| `rotar-claves.md` | Rotar clave SSH de CI y secretos de GitHub |
| `renovar-ssl.md` | Diagnóstico si AutoSSL falla (casi siempre es `.well-known` bloqueado) |
| `onboarding.md` | Poner a un socio nuevo a publicar contenido en menos de 30 minutos |

Sobre CSP: subir a modo enforce **después** de tener una semana de reportes de Report-Only. Los culpables típicos son los embeds de YouTube, el script de analítica y los estilos inline. Astro 7 puede emitir hashes/nonces automáticamente; ajustar la cabecera en consecuencia.

---

## 15. Fases

| Fase | Alcance | Criterio de salida |
|---|---|---|
| **0 — Base** | Repo, CI, deploy a staging, `.htaccess`, SSL, sistema de diseño | Un "hola mundo" llega a staging automáticamente |
| **1 — Landing** | Home, presskit, newsletter, legales, i18n, analítica | Producción en vivo, prensa puede citar el juego |
| **2 — Contenido** | Blog, noticias, RSS, buscador, comentarios | Los socios publican sin ayuda técnica |
| **3 — Compendio** | Héroes, cartas, filtros, OG por carta, JSON-LD | 100 % del catálogo publicado y validado |
| **4 — Deckbuilder** | Codec, validación, compartir, import/export, a11y | Round-trip verificado; mazos compartibles en Discord |
| **5 — Pulido** | Presupuesto de rendimiento, a11y, endurecer CSP, 404 | Todos los gates de §13 en verde |

No adelantar fases. La fase 3 sin datos exportables del juego produce una wiki que se desincroniza en dos parches.

---

## 16. Estado de decisiones

Etiquetas de estado epistémico, mantenidas por `escriba-memoria` en `docs/MEMORIA.md`.

**DECIDIDO**
- Astro 7, salida estática, sin backend en el hosting compartido.
- Build en GitHub Actions; el servidor solo recibe `dist/`.
- `rsync` sobre SSH como método principal; FTPS como fallback.
- `.htaccess` versionado dentro de `public/`.
- Cartas y héroes son canon del juego; la web los consume, no los edita.
- Deckbuilder sin backend; el mazo viaja en la URL.
- i18n ES/EN desde el inicio.

**PROPUESTO**
- Cloudflare gratis por delante (pendiente de decidir si mueves los nameservers).
- Pagefind para búsqueda estática (alternativa: índice JSON propio si el catálogo se queda bajo ~300 cartas).
- Giscus para comentarios (requiere que la audiencia tenga cuenta de GitHub; puede no encajar).
- Decap CMS o TinaCMS si el flujo de Git resulta ser fricción real para los socios no técnicos.

**ABIERTO**
- ¿Existe ya pipeline de exportación de datos desde Unity, o hay que construirlo?
- ¿Qué entidad legal figura en los legales y como responsable del tratamiento de datos?
- ¿Quién asume el rol de editor de contenido dentro del estudio?
- ¿El dominio es el mismo del estudio o uno propio del juego? Afecta a la estructura de subdominios.
- ¿Plan de hosting concreto? El límite de 20 GB de Stellar es holgado para un sitio estático, pero conviene confirmarlo.

**DESCARTADO**
- Laravel o Node en el shared hosting → §1.
- WordPress → superficie de ataque y mantenimiento desproporcionados para 3 tipos de contenido.
- Commitear `node_modules/` o `dist/` a `main`.
- Editar archivos directamente por File Manager en producción.

---

*Documento vivo. Cualquier cambio en infraestructura se refleja aquí en el mismo PR que lo introduce, no después.*
