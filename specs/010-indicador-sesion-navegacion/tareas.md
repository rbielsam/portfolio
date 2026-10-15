# Tareas — Indicador de sesión en la navegación pública y acceso directo al panel (Spec 010)

> Enfoque: tests primero, luego código. Frontend: `node --test tests/*.test.js`.
> **Restricción**: no se modifica ningún test existente. `t4.3` exige que el literal `"Login"` siga en `NavButtons.jsx`.

## Fase 1: Tests

### T1.1: Tests del indicador de sesión ✅
Crear `tests/t15.test.js` con las comprobaciones estáticas.

**Criterios de aceptación**:
- Comprueba que `src/components/Navigation/SessionChip.jsx` existe.
- Comprueba que `NavButtons.jsx` sigue conteniendo el literal `"Login"` (regresión de `t4.3`).
- Comprueba que `NavButtons.jsx` importa `useAuth` y renderiza `SessionChip`.
- Comprueba que `NavButtons.jsx` conserva los botones Inicio, Formación, Experiencia, Proyectos y Contacto.
- Comprueba que `SessionChip.jsx` usa `useAuth`, `useSection` y `useFetch('/profile')`.
- Comprueba que `SessionChip.jsx` usa `photoUrl` y `getInitials` (respaldo de iniciales, RF-2).
- Comprueba que `SessionChip.jsx` gestiona `onError` sobre la imagen (RF-2).
- Comprueba que `SessionChip.jsx` muestra `user.name` y que la imagen decorativa tiene `alt=""` (RF-5).
- Comprueba que el clic llama a `setActiveSection('Login')` (RF-3).
- Comprueba que `src/pages/Login.jsx` y `src/App.jsx` **ya no** contienen `onSuccess` (RF-4).
- Comprueba que `src/styles/navigation.css` define `.nav-session`, `.nav-session__photo` y `.nav-session__initials`.
- Los tests fallan antes de implementar. ✅ (8 de 10 fallaban; T15.2 y T15.4 son guardas de regresión)

---

## Fase 2: Implementación

### T2.1: Crear `src/components/Navigation/SessionChip.jsx` ✅
Componente nuevo con la foto, el respaldo de iniciales y la acción de abrir el panel.

**Criterios de aceptación**:
- Lee la sesión con `useAuth()` y el destino con `useSection()`.
- Carga el perfil con `useFetch('/profile')` y construye la URL con `photoUrl()`.
- Si `profile.photo` no existe, o si la imagen lanza `onError`, muestra `getInitials(user.name)` (RF-2).
- El texto visible es `user.name`, no el correo (RF-2).
- Si `user.name` viniera vacío, se muestra un respaldo legible (RF-2).
- El clic y la tecla abren el panel con `setActiveSection('Login')` (RF-3).
- El botón tiene `aria-label` que anuncia que abre el panel e incluye el nombre (RF-5).
- La imagen es decorativa (`alt=""`) para no duplicar el nombre al lector de pantalla.
- Usa la clase base `nav-buttons__button` para heredar hover y foco (RF-5).
- No importa ninguna dependencia nueva.

---

### T2.2: Condicionar el último elemento de `src/components/Navigation/NavButtons.jsx` ✅
Separar el array de botones y elegir entre chip y "Login" según la sesión.

**Criterios de aceptación**:
- El array de botones contiene Inicio, Formación, Experiencia, Proyectos y Contacto.
- **Sin sesión** se muestra el botón "Login" con el mismo aspecto y posición que hoy (RF-1).
- **Con sesión** se muestra `SessionChip` en esa misma posición (RF-1).
- El literal `"Login"` sigue presente en el fichero (requisito de `t4.3`).
- El botón anónimo sigue llamando a `setActiveSection('Login')`.
- `NavButtons` se sigue usando igual desde escritorio y desde `BottomSheet` en móvil (RF-1).
- No se modifica ningún test existente.

---

### T2.3: Quitar el redireccionamiento a Inicio en `src/pages/Login.jsx` y `src/App.jsx` ✅
Eliminar la prop `onSuccess` para que el login aterrice en el panel (RF-4).

**Criterios de aceptación**:
- `App.jsx` ya no pasa `onSuccess` a `<Login />`.
- `Login.jsx` ya no declara ni recibe la prop `onSuccess`, ni la invoca.
- No queda ningún código muerto relacionado con `onSuccess`.
- El mensaje de error de credenciales sigue funcionando igual (RF-4).
- El botón de volver del spec 007 sigue funcionando (no se toca).
- No se modifica `AuthProvider` ni ningún endpoint.

---

### T2.4: Estilos del chip en `src/styles/navigation.css` ✅
Añadir `.nav-session*` con los tokens existentes.

**Criterios de aceptación**:
- `.nav-session` alinea foto e imagen en horizontal con el espaciado del sitio.
- `.nav-session__photo` es circular y recorta la imagen (`object-fit: cover`).
- `.nav-session__initials` ocupa el mismo espacio que la foto, con las iniciales centradas.
- El nombre no se corta de forma que rompa la navegación y **no provoca scroll horizontal**.
- El contraste se hereda de `.nav-buttons__button` (texto blanco sobre azul marino).
- Sin dependencias nuevas ni fuentes externas.

---

### T2.5: Proxy de `/storage` en `React/vite.config.js` ✅
**Cambio acordado con el usuario durante la validación** (fuera del plan original; afectaba también al avatar de Inicio del spec 005).

**Motivo**: `photoUrl()` genera rutas `/storage/...`, pero el proxy de Vite solo cubría `/api` y `/sanctum`. En desarrollo `GET /storage/fichero` devolvía el `index.html` (`200 text/html`, 632 B) en lugar del fichero, de modo que **ninguna foto podía renderizarse**: el `<img>` fallaba y `onError` llevaba siempre a las iniciales.

**Criterios de aceptación**:
- `vite.config.js` incluye `/storage` con destino `http://localhost:8000`.
- `GET http://localhost:5173/storage/.gitignore` devuelve el fichero real (14 B), no el HTML.
- El servidor de desarrollo sigue respondiendo y la app carga sin errores.
- No cambia el comportamiento en producción (origen compartido).

---

## Fase 3: Validación

### T3.1: Prueba manual en navegador ✅
Comprobar el comportamiento real con y sin sesión.

**Criterios de aceptación**:
- **Sin sesión**, escritorio (1280px): la navegación muestra "Login" con el mismo aspecto actual; el clic abre el formulario. ✅
- **Sin sesión**, móvil (375px): el desplegable muestra "Login" igual que ahora. ✅
- **Con sesión**: tras autenticarse se aterriza **directamente en el panel**, sin pasar por Inicio ni parpadear. ✅
- **Login incorrecto**: se permanece en el formulario con "Credenciales incorrectas", sin cambiar de sección. ✅
- **Con sesión**: "Ver portfolio" lleva a Inicio y la navegación muestra nombre + foto donde decía "Login". ✅ (nombre + iniciales; el perfil no tiene foto)
- **Con sesión**: el clic sobre el chip abre el panel. ✅
- **Móvil con sesión** (375px): el chip aparece dentro del desplegable con el mismo texto y aspecto. ✅
- **Teclado**: Tab alcanza el chip, el foco es visible y Enter abre el panel. ✅
- **Sin scroll horizontal** con nombre largo o pantalla estrecha. ✅ (`scrollWidth == clientWidth == 1280`)
- **Rol `reader`**: ve el chip, entra al panel y los controles de edición siguen ocultos. ✅ (usuario temporal creado y eliminado)
- Comprobación adicional: **cerrar sesión** devuelve el botón "Login". ✅
- Comprobación adicional: la consola no muestra errores nuevos. ✅
- Comprobación adicional (D3): el chip **no vuelve a pedir `/profile`** al cambiar de sección pública; las peticiones adicionales son las de cada sección (`/education`, `/experience`, `/projects`). ✅

> **No verificado visualmente**: la rama de *foto con archivo*, porque `profile.photo` es `null` y el usuario ha decidido no subir una foto de prueba. Se cubre estáticamente (T15.6) y la infraestructura `/storage` queda verificada en T2.5.

---

### T3.2: Tests finales y build ✅
Ejecutar toda la suite y el build.

**Criterios de aceptación**:
- `npm test` pasa (los 141 existentes + los nuevos de `t15`), sin haber tocado ningún test previo. ✅ **151/151**
- `npm run build` no falla. ✅

---

## Criterios de finalización

- Todas las tareas completadas. ✅
- Con sesión, la navegación pública muestra el nombre del usuario y su foto (o iniciales) en escritorio y en el menú móvil. ✅
- Sin sesión, la navegación es indistinguible de la actual. ✅
- El chip abre el panel y el botón anónimo sigue abriendo el formulario. ✅
- Al iniciar sesión se entra directamente al panel, sin pasar por Inicio. ✅
- Un login fallido no cambia de sección y sigue mostrando el error. ✅
- Nombre accesible, foco visible y contraste heredado de los botones existentes. ✅
- Secciones públicas, área de administración y permisos sin cambios de comportamiento. ✅
- Tests y build correctos, sin modificar ningún test existente. ✅
