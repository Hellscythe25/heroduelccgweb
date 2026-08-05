# Runbook: diagnosticar un fallo de AutoSSL

**Cuándo:** el navegador avisa de certificado no válido o caducado, o cPanel
informa de que AutoSSL falló.
**Quién:** quien administre el hosting.
**Tiempo estimado:** 15 minutos, más hasta 24 horas de espera a que AutoSSL
vuelva a pasar.
**Riesgo:** bajo. El diagnóstico no rompe nada.

---

## Lo primero que debes saber

**En nueve de cada diez casos, la causa es que `/.well-known/` está bloqueado o
se ha borrado.** Let's Encrypt valida el dominio depositando un archivo en
`http://tu-dominio/.well-known/acme-challenge/`. Si esa ruta no es accesible, la
renovación falla en silencio hasta que el certificado caduca.

Nuestro `.htaccess` y nuestros `rsync` ya la protegen:

- `.htaccess` excluye `/.well-known/` de la redirección a HTTPS.
- El patrón que bloquea dotfiles lleva `(?!well-known)` para no alcanzarla.
- Todos los `rsync` usan `--exclude '.well-known/'`.

Si alguien tocó cualquiera de esas tres cosas, ahí está el problema.

---

## 1. Comprobar si la ruta de validación responde

```bash
curl -I http://TU-DOMINIO/.well-known/acme-challenge/test
```

Debe responder `404`. Un `403` significa que está **bloqueada**: ese es el fallo.

Un `301` hacia HTTPS tampoco es correcto: la validación de Let's Encrypt debe
poder hacerse por HTTP plano.

---

## 2. Ver qué dice cPanel

**cPanel → SSL/TLS Status.** Busca el dominio y pulsa **Run AutoSSL**. La salida
indica el motivo exacto del rechazo.

---

## 3. Causas frecuentes y su solución

| Mensaje | Causa | Solución |
|---|---|---|
| `DCV check failed` / 403 en la ruta | `.well-known` bloqueado | Revisa la regla `FilesMatch` de `public/.htaccess`; debe llevar `(?!well-known)` |
| La ruta redirige a HTTPS | La condición de exclusión se perdió | Restaura `RewriteCond %{REQUEST_URI} !^/\.well-known/` |
| El dominio no resuelve al servidor | DNS mal apuntado, o Cloudflare en modo proxy | Ver paso 4 |
| El archivo de validación desaparece | Un `rsync --delete` sin la exclusión | Añade `--exclude '.well-known/'` al workflow |

---

## 4. Si hay Cloudflare por delante

Durante la **emisión inicial** de AutoSSL, pon el registro DNS del dominio en
modo **DNS only** (la nube gris, no la naranja). Con el proxy activo, Let's
Encrypt valida contra Cloudflare y no contra tu servidor, y falla.

Una vez emitido el certificado, vuelve a activar el proxy y usa modo
**Full (strict)**.

---

## 5. Después de corregir

Vuelve a lanzar **Run AutoSSL** en cPanel. Puede tardar unos minutos. Si sigue
fallando, espera al pase automático (diario) antes de escalar a soporte.

---

## Cómo saber que funcionó

```bash
curl -vI https://TU-DOMINIO/ 2>&1 | grep -i "expire\|subject\|issuer"
```

La fecha de expiración debe estar a unos 90 días vista. Además, el navegador
debe mostrar el candado sin advertencias.

---

## Prevención

- No edites `.htaccess` desde el File Manager: el siguiente despliegue lo
  sobrescribe y el arreglo se pierde justo cuando creías que estaba resuelto.
- No quites `--exclude '.well-known/'` de ningún `rsync`.
- Configura un aviso de caducidad de certificado en el monitoreo de uptime: es
  la diferencia entre enterarte tú o que te lo diga un jugador.
