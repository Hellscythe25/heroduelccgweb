# ADR-003 — El dominio se inyecta por entorno, no se escribe en el repositorio

- **Estado:** DECIDIDO
- **Fecha:** 2026-08-04
- **Contexto de fase:** 0

## Contexto

Dos requisitos del proyecto chocan de frente en la fase 0:

1. `DEPLOY.md` §6 exige sustituir `TUDOMINIO.com` en `.htaccess` **antes del
   primer deploy**, y `AGENTES.md` prohíbe explícitamente que `ingeniero-despliegue`
   deje placeholders en `main`.
2. El dominio definitivo es una decisión `ABIERTA` (`DEPLOY.md` §16): todavía no
   se sabe si será el del estudio o uno propio del juego.

No se puede sustituir un valor que aún no existe, y dejar el placeholder está
prohibido. Además, el dominio aparece en más de un sitio: la redirección
canónica de `.htaccess`, el `Sitemap:` de `robots.txt` y el `site` de
`astro.config.mjs`. Tres copias del mismo dato es una copia que se desincroniza.

El riesgo no es teórico: un `TUDOMINIO.com` vivo en la regla de redirección
canónica manda **el sitio entero** a un dominio que no controlamos, con un 301
que los navegadores cachean.

## Opciones consideradas

| Opción | En contra |
|---|---|
| Dejar el placeholder hasta que se decida | Prohibido, y un despiste lo lleva a producción |
| Inventar un dominio provisional | Es un placeholder con otro nombre; el 301 sigue siendo real |
| Esperar a tener dominio para escribir el `.htaccess` | Bloquea toda la fase 0 por una decisión de negocio |
| **Inyectar el dominio en build desde una variable de entorno** | Añade un paso al build |

## Decisión

**Una sola fuente de verdad (`SITE_URL`), inyectada en el build, más un gate que
verifica que ningún token sobrevive.**

```
SITE_URL (GitHub Variables / .env local)
  ├── astro.config.mjs  → site, canónicas, sitemap
  └── scripts/postbuild.mjs
        ├── dist/.htaccess   → __SITE_DOMAIN__ → dominio real
        └── dist/robots.txt  → __SITE_DOMAIN__ → dominio real
```

- `public/.htaccess` se versiona con el token `__SITE_DOMAIN__`, nunca con un
  dominio literal.
- `scripts/postbuild.mjs` lo sustituye tras `astro build`. Si `SITE_URL` no está
  definida y `DEPLOY_ENV` no es `local`, **falla el build**: un despliegue sin
  dominio canónico produce redirecciones rotas.
- `scripts/check-placeholders.mjs` (`npm run placeholders`) recorre el código y
  `dist/` buscando `TUDOMINIO`, `lorem ipsum` y tokens sin sustituir. Es el
  primer gate de los tres workflows, antes incluso de validar datos.
- El mismo mecanismo endurece staging: con `DEPLOY_ENV=staging`, el postbuild
  añade `X-Robots-Tag: noindex` al `.htaccess` y reescribe `robots.txt` con
  `Disallow: /`. Un staging indexado canibaliza el SEO del dominio real.

## Consecuencias

**A favor**

- La fase 0 avanza sin esperar a una decisión de negocio.
- Cambiar de dominio es cambiar una variable en GitHub, no un `sed` por el repo.
- Producción y staging comparten `.htaccess` sin duplicarlo.
- El gate convierte la regla "sin placeholders" en algo que se verifica, no que
  se recuerda.

**En contra**

- `dist/.htaccess` no es idéntico a `public/.htaccess`. Quien depure la
  configuración del servidor debe saberlo; está anotado en la cabecera del
  propio archivo.
- Un paso más en el build, y por tanto un punto más donde puede fallar.
- `scripts/check-placeholders.mjs` se excluye a sí mismo del escaneo: contiene
  los patrones por definición. La exclusión está acotada a ese único archivo.

## Cuándo reabrir

Cuando el dominio esté decidido y estable, podría simplificarse escribiéndolo
literalmente. **No se recomienda:** el mecanismo también sostiene la diferencia
entre staging y producción, que no desaparece al fijar el dominio.
