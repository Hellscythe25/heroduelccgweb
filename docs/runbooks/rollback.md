# Runbook: revertir un despliegue

**Cuándo:** la web pública está rota, muestra datos incorrectos, o el último
despliegue introdujo un problema serio.
**Quién:** quien tenga acceso a GitHub y a cPanel.
**Tiempo estimado:** 3 a 6 minutos por la vía activa.
**Riesgo:** bajo. Nada de esto borra historia.

---

## Antes de empezar

**La vía activa de despliegue es la rama `deploy` + cPanel** (ADR-004). Eso
significa que **no existe el respaldo remoto `~/backups/prev`**: ese lo creaba
el pipeline de rsync, que hoy está inactivo. No lo busques.

Responde primero una pregunta: **¿el problema es del código o del contenido?**
No cambia el procedimiento, pero sí lo que hay que arreglar después.

---

## Camino 1 — Revertir el commit (el correcto, y casi siempre el único)

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

Eso dispara **Actions → Publicar rama deploy**, que reconstruye el sitio en el
estado bueno y actualiza la rama `deploy`.

Espera a que termine en verde. Después, en **cPanel → Git Version Control →
Manage → Pull or Deploy**:

1. **Update from Remote**
2. **Deploy HEAD Commit**

`git revert` no borra el commit malo: crea uno nuevo que lo deshace. El
historial queda legible y se ve qué se revirtió y cuándo.

**Nunca uses `git push --force` sobre `main`.** Reescribir el historial de la
rama de producción rompe el repositorio de todos los demás y hace imposible
saber qué estaba publicado en cada momento.

---

## Camino 2 — Volver a un commit anterior de la rama `deploy` (urgencia)

Úsalo solo si GitHub Actions no está disponible y necesitas el sitio en pie ya.
Requiere SSH al hosting.

```bash
ssh -p PUERTO USUARIO@HOST
```

```bash
cd ~/repositories/heroduel && git log --oneline -5
```

Localiza el commit bueno y despliégalo:

```bash
git checkout <SHA-bueno> && rsync -a --delete --exclude '.git/' --exclude '.cpanel.yml' --exclude 'cgi-bin/' --exclude '.well-known/' ./ ~/public_html/
```

**Deja el repositorio en un estado que cPanel no espera** (`HEAD` separado).
En cuanto pase la urgencia, arréglalo con el camino 1 y después:

```bash
cd ~/repositories/heroduel && git checkout deploy && git pull
```

---

## Camino 3 — Re-ejecutar el workflow desde un commit anterior

**Actions → Publicar rama deploy → Run workflow**, eligiendo la referencia
buena. Reconstruye desde cero y actualiza `deploy`. Después, los dos botones de
cPanel.

Más limpio que el camino 2, pero no sirve si el problema es que Actions falla.

---

## Cómo saber que funcionó

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' https://heroduelccg.com/
```

Debe responder `200`. Después abre el sitio con la caché desactivada
(`Ctrl + Shift + R`) y confirma que el problema desapareció. Si hay Cloudflare
por delante, purga su caché.

---

## Si algo sale mal

| Síntoma | Causa | Solución |
|---|---|---|
| El workflow falla al reconstruir | El commit al que volviste también rompía un gate | Retrocede otro commit más |
| `Update from Remote` da conflicto | La rama `deploy` se editó a mano | Borra el repositorio en cPanel y vuelve a clonarlo |
| El sitio sigue roto tras desplegar | Caché de navegador o de CDN | `Ctrl + Shift + R`; purga Cloudflare |
| No hay commit bueno al que volver | El fallo venía de antes | Arréglalo hacia delante: es más rápido que buscar |

---

## Cuando exista SSH: la vía rápida

Con los secretos SSH cargados, el pipeline de rsync (`deploy-prod.yml`) vuelve a
activarse y aparece un camino de **segundos**, porque guarda el despliegue
anterior antes de tocar nada:

```bash
ssh -p PUERTO USUARIO@HOST "rsync -a --delete ~/backups/prev/ ~/public_html/"
```

Hoy ese respaldo **no existe**. Ver ADR-004.

---

## Después

Registra en `docs/MEMORIA.md` qué falló, por qué llegó a producción y qué gate
debería haberlo detectado. **Un rollback sin esa nota se repite.**
