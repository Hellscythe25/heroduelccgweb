---
description: Ejecuta qa-web, revisor-seguridad y escriba-changelog en secuencia antes de un release.
---

Secuencia previa a un release a producción. Se ejecuta sobre `develop`, ya
desplegado en staging.

## 1. Gates automáticos

```bash
npm run verify
npm run build && npm run budget
```

Si algo está en rojo, el release se detiene aquí.

## 2. `qa-web`

Accesibilidad (teclado de principio a fin), Core Web Vitals, enlaces rotos,
responsive en 320 / 768 / 1280, paridad ES/EN.

**Cualquier hallazgo crítico de accesibilidad bloquea el release.**

## 3. `revisor-seguridad`

Cabeceras, estado de la CSP, escaneo de secretos, `npm audit`, verificación de
que no hay `.map`, `.env` ni dotfiles servidos, staging protegido con auth
básica y `noindex`.

**Cualquier hallazgo crítico o alto bloquea el release.**

## 4. `escriba-changelog`

`docs/CHANGELOG.md` derivado de los commits desde el tag anterior, con las **dos
versiones** indicadas: la del sitio y la de datos del juego.

## 5. `escriba-documentacion`

Todo cambio de comportamiento tiene su documentación actualizada. Los runbooks
afectados, al día.

## 6. `ingeniero-despliegue`

Verificación final en staging: el sitio responde, el rollback está probado, los
inodes están dentro de cuota.

## Cierre

Un informe único con: qué está en verde, qué bloquea el release y quién debe
resolverlo. Si algo bloquea, **el release no sale** — no se documenta como
riesgo aceptado sin firma humana registrada en `docs/MEMORIA.md`.
