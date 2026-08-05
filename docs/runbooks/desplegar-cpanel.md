# Runbook: configurar y usar el despliegue de cPanel

**Cuándo:** primera configuración del despliegue, o cada vez que quieras
publicar cambios en la web.
**Quién:** quien tenga acceso a cPanel.
**Tiempo estimado:** 15 minutos la primera vez; 1 minuto las siguientes.
**Riesgo:** medio la primera vez (se toca `public_html`). Bajo después.

---

## Lo que tienes que entender antes de empezar

**cPanel no construye el sitio.** El HTML que ve el visitante no existe en el
código: lo genera `npm run build`. Por eso cPanel **no clona `main`**, sino una
rama llamada `deploy` que GitHub Actions rellena con el sitio ya construido.

```
Tú haces push a main
  └── GitHub Actions corre los gates y construye el sitio
        └── publica el resultado en la rama `deploy`
              └── tú entras a cPanel y pulsas dos botones
```

**Si apuntas cPanel a `main` publicarás el código fuente y ninguna página.**
Esa es la parte que hay que hacer bien una sola vez.

---

## Parte 1 — Configuración (solo la primera vez)

### 1. Comprobar que la rama `deploy` existe

Entra en el repositorio de GitHub y mira el selector de ramas. Debe aparecer
`deploy`, con archivos como `index.html`, `es/`, `en/` y `_astro/` — **no**
`src/` ni `package.json`.

Si no aparece: ve a **Actions → Publicar rama deploy → Run workflow** y espera a
que termine en verde.

### 2. Crear el repositorio en cPanel

1. **cPanel → Git Version Control → Create**.
2. Activa **Clone a Repository**.
3. **Clone URL:** `https://github.com/Hellscythe25/heroduelccgweb.git`
4. **Repository Path:** `/home/TU_USUARIO/repositories/heroduel`
   (fuera de `public_html`; si lo pones dentro, el repositorio quedaría
   públicamente accesible en internet).
5. **Repository Name:** `heroduel`
6. Crea.

> Si el repositorio de GitHub es **privado**, cPanel no podrá clonarlo por
> HTTPS. Tendrás que generar una clave SSH en cPanel y añadirla como *Deploy
> key* en GitHub (Settings → Deploy keys, solo lectura), y usar la URL SSH
> `git@github.com:Hellscythe25/heroduelccgweb.git`.

### 3. Apuntar a la rama `deploy`

Esto es **lo más importante de todo el runbook.**

1. **Manage** sobre el repositorio recién creado.
2. Pestaña **Pull or Deploy**.
3. En **Checked-Out Branch**, selecciona **`deploy`**.

Si ahí pone `main`, cámbialo antes de desplegar nada.

### 4. Primer despliegue

En la misma pestaña:

1. **Update from Remote** — trae los últimos artefactos.
2. **Deploy HEAD Commit** — los copia a `public_html`.

### 5. Comprobar que la ruta se resolvió bien

El `.cpanel.yml` usa `$HOME/public_html/`. Si por lo que sea esa variable no se
expandiera, se habría creado una carpeta con el nombre literal en vez de
publicarse el sitio. Compruébalo una sola vez, en **File Manager**:

- `public_html/` contiene `index.html`, `es/`, `en/`, `_astro/`.
- **No** existe ninguna carpeta llamada `$HOME` en tu directorio personal.

Si aparece esa carpeta: bórrala, y en `deploy/cpanel.yml` sustituye
`$HOME/public_html/` por la ruta completa `/home/TU_USUARIO/public_html/`.
Es un cambio de una línea que pasa por PR como cualquier otro.

---

## Parte 2 — Publicar cambios (uso diario)

1. Haz push a `main` (o fusiona un PR).
2. Espera a que **Actions → Publicar rama deploy** termine en verde. Si sale en
   rojo, **no despliegues**: el sitio publicado sigue intacto y eso es lo
   correcto. Lee el error.
3. **cPanel → Git Version Control → Manage → Pull or Deploy**.
4. **Update from Remote**, luego **Deploy HEAD Commit**.

---

## Cómo saber que funcionó

Abre <https://heroduelccg.com/> con la caché desactivada (`Ctrl + Shift + R`).

**Si ves un listado de archivos ("Index of /") en vez del sitio, el despliegue
ha fallado**, aunque los archivos aparezcan ahí. Significa que el servidor no
puede leer el `.htaccess`. Ver la tabla de fallos más abajo.

Comprueba también:

- <https://heroduelccg.com/es/> responde.
- <https://heroduelccg.com/en/> responde.
- Una URL inventada muestra la página 404 del sitio, no la de Apache.
- <https://heroduelccg.com/sitemap-index.xml> devuelve XML.

---

## Si algo sale mal

| Síntoma | Causa | Solución |
|---|---|---|
| **`/` muestra "Index of /" y todo lo demás da 404** | **Permisos.** `rsync` heredó el umask restrictivo del clon de git y LiteSpeed no puede leer los archivos ni el `.htaccess` | Ya resuelto con `--chmod=D755,F644` en `deploy/cpanel.yml`. Si reaparece, comprueba en File Manager que `index.html` sea `0644` y las carpetas `0755` |
| `A valid .cpanel.yml file exists` | cPanel está en la rama `main` | Cambia a `deploy` en Pull or Deploy |
| Se publicó `src/`, `package.json`… | Igual que arriba | Cambia a `deploy` y vuelve a desplegar; borra a mano lo que quedó en `public_html` |
| `rsync: command not found` | El shell enjaulado no trae rsync en el PATH | Cambia la tarea de `deploy/cpanel.yml` por `/bin/cp -R ./* $DEPLOYPATH` **y** `/bin/cp ./.htaccess $DEPLOYPATH`. Perderás el borrado de archivos viejos: audita inodes con más frecuencia |
| `Update from Remote` falla por conflicto | Alguien editó la rama `deploy` a mano | Borra el repositorio en cPanel y vuelve a clonarlo. La rama la escribe solo CI |
| Los cambios no se ven | Caché del navegador o de Cloudflare | `Ctrl + Shift + R`; purga Cloudflare si está activo |
| `Deploy` no aparece como opción | Falta `.cpanel.yml` en la rama activa | Confirma que estás en `deploy` y que el workflow terminó en verde |

---

## Lo que nunca debes hacer

- **Editar archivos en `public_html` desde el File Manager.** El siguiente
  despliegue los borra sin avisar, y el arreglo se pierde justo cuando alguien
  confía en que está aplicado.
- **Editar la rama `deploy` a mano.** La escribe solo GitHub Actions. Tocarla
  deja el sitio publicado distinto del código que lo generó.
- **Desplegar con el workflow en rojo.** Los gates existen para que un error no
  llegue a la web pública.
