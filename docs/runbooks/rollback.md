# Runbook: revertir un despliegue

**Cuándo:** la web pública está rota, muestra datos incorrectos, o el último
despliegue introdujo un problema serio.
**Quién:** quien tenga acceso SSH al hosting o permisos en GitHub Actions.
**Tiempo estimado:** 30 segundos a 4 minutos, según el camino.
**Riesgo:** el camino 1 sobrescribe lo que hay ahora en producción. Eso es
exactamente lo que quieres, pero asegúrate de que el problema es del despliegue.

---

## Antes de empezar

Respira y responde una pregunta: **¿el problema es del despliegue o del
contenido?**

- **Del despliegue** (el sitio no carga, faltan estilos, error 500) → camino 1 o 2.
- **Del contenido** (un dato mal, un texto que no debía publicarse) → camino 3.

Elegir mal no es grave, pero el camino 3 deja el historial limpio y los otros no.

---

## Camino 1 — Restaurar el respaldo remoto (segundos)

Cada despliegue a producción guarda el anterior en `~/backups/prev` **antes** de
tocar nada. Restaurarlo es lo más rápido que hay.

```bash
ssh -p PUERTO USUARIO@HOST "rsync -a --delete ~/backups/prev/ ~/public_html/"
```

Sustituye `PUERTO`, `USUARIO` y `HOST` por los valores de cPanel → SSH Access.
**El puerto no es el 22**; en Namecheap suele ser `21098`.

**Aviso:** solo hay un nivel de respaldo. Si despliegas dos veces seguidas con
el fallo dentro, `~/backups/prev` ya contiene la versión rota. En ese caso, ve al
camino 2.

---

## Camino 2 — Re-ejecutar el despliegue desde el commit bueno (2–4 minutos)

1. En GitHub, abre **Actions → Deploy producción**.
2. Pulsa **Run workflow**.
3. Elige el commit (SHA) que sabes que estaba bien.
4. Ejecuta y espera a que termine en verde.

Reconstruye el sitio desde cero y lo publica. Más lento que el camino 1, pero no
depende de que el respaldo remoto esté sano.

---

## Camino 3 — `git revert` (el correcto si el fallo es de contenido)

```bash
git checkout main
```

```bash
git pull
```

```bash
git revert <SHA-del-commit-problemático>
```

```bash
git push origin main
```

El push a `main` dispara un despliegue automático. Deja rastro limpio en el
historial: se ve qué se revirtió y cuándo.

**Nunca uses `git push --force` sobre `main`.** Reescribir el historial de la
rama de producción rompe el repositorio de todos los demás y hace imposible
saber qué estaba publicado en cada momento.

---

## Cómo saber que funcionó

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' https://TU-DOMINIO/
```

Debe responder `200`. Después, abre el sitio en el navegador **con la caché
desactivada** (`Ctrl + Shift + R`) y confirma que el problema desapareció.

---

## Si algo sale mal

| Síntoma | Causa | Solución |
|---|---|---|
| `~/backups/prev` no existe | Es el primer despliegue, o falló el paso de respaldo | Camino 2 |
| El respaldo también está roto | Se desplegó dos veces con el fallo | Camino 2 con un SHA anterior |
| `ssh: connect to host ... port 22` | Puerto equivocado | Usa `-p` con el puerto real de cPanel |
| El sitio sigue roto tras revertir | Caché de CDN o del navegador | Purga la caché de Cloudflare si está activo |

---

## Después

Registra en `docs/MEMORIA.md` qué falló, por qué llegó a producción y qué gate
debería haberlo detectado. **Un rollback sin esa nota se repite.**
