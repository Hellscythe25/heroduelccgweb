---
description: Verificación post-deploy contra el checklist de lanzamiento.
argument-hint: "[produccion|staging]"
---

Verificación posterior a un despliegue, contra `docs/DEPLOY.md` §13.

Entorno: $ARGUMENTS (por defecto: producción)

Ejecuta `ingeniero-despliegue`. Cada casilla se marca **solo tras comprobarla**;
un checklist rellenado de memoria es peor que no tener checklist.

## DNS y dominio

- [ ] `https://` responde sin advertencias de certificado
- [ ] `www` redirige al ápice en un solo salto (o al revés — una sola forma canónica)
- [ ] AutoSSL emitido y con renovación activa
- [ ] `/.well-known/` accesible (si está bloqueado, AutoSSL fallará en 90 días)

## Rutas

- [ ] `/` reparte a `/es/` y `/en/`
- [ ] `/es/` y `/en/` responden 200
- [ ] `/404.html` se sirve en una URL inexistente
- [ ] `/sitemap-index.xml` responde y lista las páginas reales
- [ ] `/robots.txt` correcto para el entorno

## Seguridad

- [ ] Cabeceras presentes: `X-Content-Type-Options`, `Referrer-Policy`,
      `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security`
- [ ] CSP presente (Report-Only o enforce, según fase)
- [ ] `/src/`, `*.map`, `/.env`, `/.git/` devuelven 403 o 404
- [ ] En staging: auth básica activa y `X-Robots-Tag: noindex`

## Datos

- [ ] `DATA_VERSION` coincide con la build pública del juego
- [ ] El deckbuilder aplica las reglas de construcción vigentes

## Operación

- [ ] Respaldo remoto `~/backups/prev` creado en este despliegue
- [ ] Inodes dentro de cuota: `find ~/public_html -type f | wc -l` < 300 000
- [ ] Monitoreo de uptime respondiendo

## Cierre

Reporta qué está verde, qué falló, y si procede un rollback (y por cuál de los
tres caminos de `docs/runbooks/rollback.md`).
