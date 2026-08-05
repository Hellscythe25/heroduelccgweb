# Runbook: poner a alguien a publicar contenido en 30 minutos

**Cuándo:** entra un socio o colaborador nuevo al proyecto.
**Quién:** cualquiera con acceso al repositorio.
**Tiempo estimado:** 30 minutos.
**Riesgo:** ninguno. Nada de lo que hay aquí toca producción.

---

## Antes de empezar

Necesitas:

- Una cuenta de GitHub, con acceso al repositorio `heroduelccgweb`.
- Node 22 o superior instalado. Compruébalo:

  ```bash
  node --version
  ```

  Si dice algo menor que `v22.12.0`, instala Node 22 LTS desde
  <https://nodejs.org> antes de seguir.
- Git instalado.

---

## 1. Traer el proyecto a tu ordenador

```bash
git clone https://github.com/Hellscythe25/heroduelccgweb.git
```

```bash
cd heroduelccgweb
```

```bash
npm install
```

La última orden tarda un minuto aproximadamente y termina con una línea del
estilo `added 314 packages`.

---

## 2. Ver el sitio en tu navegador

```bash
npm run dev
```

Verás una línea con una dirección, normalmente `http://localhost:4321`. Ábrela.
Deberías ver la portada del sitio.

Mientras `npm run dev` esté corriendo, cualquier cambio que guardes se refleja
en el navegador solo. Para pararlo: `Ctrl + C` en esa terminal.

---

## 3. Entender dónde vive cada cosa

| Quieres cambiar… | Está en… |
|---|---|
| Un devlog | `src/content/blog/` |
| Una noticia o nota de parche | `src/content/news/` |
| Un texto de la interfaz (menú, pie, botones) | `src/i18n/ui.ts` |
| Colores y tipografía | `src/styles/tokens.css` |
| Datos de cartas y héroes | `src/data/` — **no se editan a mano** |

Lo único que necesitas tocar para publicar contenido son las dos primeras
carpetas.

---

## 4. Publicar tu primer post

Sigue `publicar-noticia.md`, en esta misma carpeta. Está escrito paso a paso.

---

## 5. Antes de proponer cualquier cambio

```bash
npm run verify
```

Esta orden comprueba cuatro cosas: que no queden textos de relleno, que los
datos del juego sean válidos, que no haya errores de tipos y que los tests
pasen. Si termina sin mensajes de error en rojo, puedes abrir tu propuesta.

Si algo sale en rojo, **no lo ignores y no lo fuerces**: copia el mensaje
completo y pregunta. Los gates existen para atrapar problemas antes de que
lleguen a la web pública, y saltárselos convierte un problema pequeño en uno
grande.

---

## Cómo saber que funcionó

Puedes ver el sitio en `http://localhost:4321`, y `npm run verify` termina sin
errores.

---

## Si algo sale mal

| Síntoma | Causa habitual | Solución |
|---|---|---|
| `npm install` falla | Versión de Node antigua | Instala Node 22 LTS |
| `npm run dev` dice que el puerto está ocupado | Ya lo tienes abierto en otra terminal | Ciérrala, o usa la dirección que te ofrezca |
| `npm run verify` falla nada más clonar | Instalación incompleta | Borra `node_modules/` y repite `npm install` |

---

## Lo que nunca debes hacer

- Editar `src/data/` a mano. Son datos del juego: si la web y el juego dicen
  cosas distintas, la comunidad deja de fiarse del compendio y del deckbuilder
  a la vez.
- Subir cambios directamente a `main`. Todo pasa por una propuesta (PR).
- Editar archivos desde el panel del hosting. El siguiente despliegue los borra
  sin avisar.
