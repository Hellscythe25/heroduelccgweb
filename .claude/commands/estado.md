---
description: Resume el estado del proyecto, la fase actual y los bloqueos abiertos.
---

Invoca al subagente `escriba-memoria` para que lea `docs/MEMORIA.md`,
`docs/DEPLOY.md` §15 y los ADRs de `docs/adr/`, y devuelva un resumen de
apertura de sesión.

El resumen debe caber en quince líneas y responder, en este orden:

1. **Fase actual** y su criterio de salida.
2. **Qué se hizo** en la sesión anterior.
3. **Bloqueos `ABIERTO`**, y qué impide cada uno concretamente.
4. **Qué toca ahora**, con el agente que debería hacerlo.

Después del resumen, ejecuta `npm run verify` y reporta si los gates están en
verde. Un estado que dice "todo bien" sin haber corrido los gates no vale nada.

No modifiques nada. Este comando solo lee.
