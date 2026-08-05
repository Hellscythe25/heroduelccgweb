# Runbook: configurar o rotar la clave SSH de despliegue

**Cuándo:** primera configuración del despliegue, sospecha de filtración, salida
de alguien del equipo, o rotación periódica (recomendada: cada 12 meses).
**Quién:** quien administre el hosting y el repositorio.
**Tiempo estimado:** 20 minutos.
**Riesgo:** medio. Si te equivocas, el despliegue automático deja de funcionar
hasta que lo corrijas. **La web pública no se cae** — sigue sirviendo lo último
desplegado.

---

## Si sospechas de una filtración, lee esto primero

Una clave que ha estado expuesta **se considera comprometida para siempre**, por
poco tiempo que haya sido. No se evalúa el riesgo: se rota. Rotar cuesta veinte
minutos; no rotar puede costar el servidor.

---

## Antes de empezar

- Acceso a cPanel del hosting.
- Permisos de administración en el repositorio de GitHub.
- Una terminal con `ssh-keygen` (viene con Git en Windows).

---

## 1. Generar una clave nueva, dedicada a CI

```bash
ssh-keygen -t ed25519 -C "github-actions-heroduel" -f ./deploy_key -N ""
```

Esto crea dos archivos en la carpeta actual:

- `deploy_key` — la clave **privada**. Nunca se comparte ni se sube al repo.
- `deploy_key.pub` — la clave **pública**. Esta sí va al servidor.

---

## 2. Autorizar la clave pública en el hosting

1. Entra en **cPanel → SSH Access → Manage SSH Keys**.
2. **Import Key**.
3. Pega el contenido de `deploy_key.pub` en el campo de clave pública. Deja
   vacío el de clave privada.
4. Guarda y pulsa **Manage → Authorize**.

Sin ese paso de autorización la clave existe pero no sirve.

---

## 3. Anotar el puerto SSH

En la misma pantalla de **SSH Access** aparece el puerto. **No es el 22**: en
Namecheap suele ser `21098`. Anótalo.

---

## 4. Probar la conexión antes de tocar GitHub

```bash
ssh -p PUERTO -i ./deploy_key USUARIO@HOST "echo conexion-ok"
```

Debe imprimir `conexion-ok`. **Si no funciona aquí, tampoco funcionará en CI.**
No sigas hasta que esta orden responda.

---

## 5. Cargar los secretos en GitHub

En **Settings → Secrets and variables → Actions**, pestaña **Secrets**:

| Secret | Valor |
|---|---|
| `SSH_HOST` | `serverXXX.web-hosting.com` |
| `SSH_PORT` | El puerto del paso 3 |
| `SSH_USER` | Tu usuario de cPanel |
| `SSH_PRIVATE_KEY` | Contenido **completo** de `deploy_key`, incluidas las líneas `BEGIN` y `END` |
| `DEPLOY_PATH_PROD` | `/home/USUARIO/public_html/` |
| `DEPLOY_PATH_STAGING` | `/home/USUARIO/staging/` |

Y en la pestaña **Variables**:

| Variable | Valor |
|---|---|
| `SITE_URL_PROD` | `https://tu-dominio.com` (sin barra final) |
| `SITE_URL_STAGING` | `https://staging.tu-dominio.com` (sin barra final) |

---

## 6. Borrar la clave privada de tu ordenador

```bash
rm ./deploy_key ./deploy_key.pub
```

Ya está guardada donde tiene que estar. Una copia en tu carpeta de Descargas es
una filtración esperando a ocurrir.

---

## 7. Revocar la clave anterior (solo si estás rotando)

En **cPanel → SSH Access → Manage SSH Keys**, localiza la clave antigua y pulsa
**Delete**.

**Hazlo solo después** de comprobar que un despliegue con la clave nueva
funciona. Si borras primero y la nueva falla, te quedas sin despliegue
automático.

---

## Cómo saber que funcionó

Lanza **Actions → Deploy staging → Run workflow**. Debe terminar en verde, y el
paso "Rsync a staging" debe listar archivos transferidos.

---

## Si algo sale mal

| Síntoma en el log de Actions | Causa | Solución |
|---|---|---|
| `Permission denied (publickey)` | La clave no está autorizada | Repite el paso 2, incluido *Authorize* |
| `Connection refused` | Puerto equivocado | Revisa `SSH_PORT` |
| `error in libcrypto` | La clave privada se pegó incompleta | Vuelve a copiarla con las líneas `BEGIN`/`END` |
| `rsync: command not found` | El shell enjaulado no trae `rsync` | Usa el workflow alternativo por FTPS |
