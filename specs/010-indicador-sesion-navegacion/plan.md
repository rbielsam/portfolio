# Plan — Indicador de sesión en la navegación pública y acceso directo al panel (Spec 010)

## Alcance

Funcionalidad **100% frontend**: sustituir el botón "Login" de la navegación por un chip con foto y nombre cuando hay sesión, y que el login lleve directamente al panel.

- **No toca backend**: sin endpoints, sin migraciones, sin cambios en `users` ni en `profile`.
- **No toca la autenticación**: el flujo de login/logout y las cookies de sesión quedan igual.
- **No toca los permisos**: `usePermissions()` y el filtrado de controles del panel siguen igual.
- **No toca el área de administración** (su barra lateral ya muestra el correo y "Cerrar sesión").
- **No toca la spec 009** (estética/responsive del panel), que sigue reservada.

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Sesión**: `useAuth()` (`useAuth.jsx` → `user`, `login`, `logout`)
- **Navegación entre secciones**: `SectionContext` (`useSection()` → `activeSection` / `setActiveSection`)
- **Datos del perfil**: `useFetch('/profile')` (el mismo hook que ya usa `sections/Inicio.jsx`)
- **Utilidades**: `getInitials()` y `photoUrl()` de `src/utils/initials.js`
- **Estilos**: tokens de `src/styles/variables.css`
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)

## Decisiones de implementación

### D1 — El chip vive en un componente nuevo `SessionChip.jsx`

Contiene la carga de la foto, el respaldo de iniciales y el estado de error de imagen: unos 40 líneas. Meterlo en `NavButtons.jsx` lo dejaría con dos responsabilidades y difícil de leer. Va en `src/components/Navigation/`, la carpeta que ya existe; no se crea ninguna carpeta base nueva.

### D2 — `NavButtons` decide entre chip y botón, conservando el literal `Login`

```jsx
const baseButtons = ['Inicio', 'Formación', 'Experiencia', 'Proyectos', 'Contacto']
...
{user ? <SessionChip /> : <button ...>Login</button>}
```

**Restricción resuelta**: `tests/t4.3.test.js` exige que el literal `"Login"` figure en `NavButtons.jsx`. Queda cumplido porque el literal aparece tanto en el `setActiveSection('Login')` del chip como en el botón del caso anónimo. **No se modifica ningún test existente.**

### D3 — La foto se pide con `useFetch('/profile')`

- `SessionChip` solo se renderiza cuando `user` existe, así que **los visitantes anónimos no pagan esa petición**.
- `NavButtons` permanece montado al cambiar de sección, así que es **una sola petición por sesión de navegación**, no una por cada clic.

### D4 — Respaldo de iniciales en dos situaciones

1. `profile.photo` ausente → `getInitials(user.name)`.
2. La imagen existe pero **falla su carga** → estado `imgFailed` activado por `onError` sobre el `<img>`, que pasa a mostrar iniciales (RF-2).

La imagen decorativa lleva `alt=""`; el nombre se lee por el texto y el `aria-label` del botón (RF-5).

### D5 — Acción del chip: `setActiveSection('Login')`

Es exactamente lo que ya hace el botón "Login". Como `user` existe, `AppContent` renderiza `AdminLayout`. Mismo destino, misma mecánica, cero lógica nueva.

### D6 — Quitar el redireccionamiento a Inicio: basta con eliminar `onSuccess`

Este es el punto que parece contraintuitivo, así que se documenta:

- El formulario de Login **solo se renderiza cuando `activeSection === 'Login'`** (ver `App.jsx`).
- Al autenticarse, `AuthProvider` hace `setUser(data.user)`. Con la sección ya en `'Login'` y `user` pasando a ser verdad, `AppContent` renderiza `AdminLayout` **por sí solo**.
- Por eso **no hace falta ningún `setActiveSection` nuevo**: basta con **eliminar** el `onSuccess` que hoy fuerza `'Inicio'`.

Cambios: quitar la prop `onSuccess` de `<Login />` en `App.jsx` y su declaración y llamada en `pages/Login.jsx`. No queda código muerto.

### D7 — Estilos reutilizando la base existente

El chip lleva `className="nav-buttons__button nav-session"`, con lo que hereda padding, radio, sombra, hover y foco del resto de botones (misma paleta → contraste cumplido, RF-5). Solo se añade el modificador `.nav-session` para el flex interno, `.nav-session__photo` (círculo de 28 px) y `.nav-session__initials` (círculo equivalente con las iniciales).

`.nav-buttons` ya tiene `flex-wrap: wrap`, así que un nombre largo **no provoca scroll horizontal** (caso límite de la spec).

## Estructura de ficheros

### Frontend (`React/`) — 6 ficheros (4 modificados, 2 nuevos)

```
src/
├── App.jsx                              (quitar prop onSuccess de <Login />)
├── pages/Login.jsx                      (quitar prop onSuccess y su llamada)
├── components/Navigation/NavButtons.jsx (split condicional: chip vs Login)
├── components/Navigation/SessionChip.jsx(NUEVO: foto + iniciales + clic)
└── styles/navigation.css                (añadir .nav-session*)
tests/
└── t15.test.js                          (nuevo: tests de la spec 010)
```

> `navigation.css` ya está importado en `App.jsx`; no hay que tocar los imports.

## Pasos de implementación

1. **Tests primero**: crear `tests/t15.test.js` con las comprobaciones estáticas (chip presente, literal `Login` conservado, `onSuccess` eliminado, respaldo de iniciales, `onError`, estilos). Deben fallar todavía.
2. **`SessionChip.jsx`**: componente nuevo con `useAuth`, `useSection`, `useFetch('/profile')`, `photoUrl` y `getInitials`.
3. **`NavButtons.jsx`**: separar el array de botones y renderizar chip o "Login" según `user`.
4. **`Login.jsx` + `App.jsx`**: eliminar `onSuccess`.
5. **`navigation.css`**: estilos del chip con los tokens existentes.
6. **Suite y build**: `npm test` y `npm run build` en verde.
7. **Validación manual** en navegador (escritorio y móvil).

## Verificación

- `npm test` → pasan los 141 existentes + los nuevos de `t15`. **Ningún test previo se modifica.**
- `npm run build` → sin errores.
- Prueba manual en navegador:

**Sin sesión (no debe cambiar nada):**
  - Escritorio 1280px: la navegación sigue mostrando "Login" con el mismo aspecto.
  - Clic en "Login" → pantalla de inicio de sesión.

**Con sesión:**
  - Login correcto → **se aterriza directamente en el panel**, sin pasar por Inicio ni parpadear.
  - Login incorrecto → se permanece en el formulario con "Credenciales incorrectas".
  - "Ver portfolio" → Inicio, y la navegación muestra **nombre + foto** donde decía "Login".
  - Clic en el chip → panel de administración.
  - Móvil 375px: botón flotante → desplegable → el chip aparece con el mismo texto y aspecto.
  - Teclado: Tab recorre hasta el chip, foco visible, Enter abre el panel.
  - Nombre largo / pantalla estrecha: sin scroll horizontal.
  - Usuario con rol `reader`: ve el chip y entra al panel, que sigue ocultando los controles de edición.

- **Respaldo de iniciales**: comprobación estática (código) + observación del parpadeo inicial antes de que `/profile` responda. *No se modificará `profile.photo` en la base de datos para probarlo* (los datos reales no se tocan).

## Criterios de finalización del plan

- Con sesión, la navegación pública muestra nombre y foto (o iniciales) en escritorio y móvil.
- Sin sesión, la navegación es idéntica a la actual.
- Pulsar el chip abre el panel; el anónimo sigue abriendo el formulario.
- Tras autenticarse se entra directamente al panel, sin pasar por Inicio.
- Un login fallido no cambia de sección y sigue mostrando el error.
- Nombre accesible, foco visible y contraste heredado de los botones existentes.
- Secciones públicas, panel y permisos sin cambios de comportamiento.
- Ningún test existente se modifica; `npm test` y `npm run build` en verde.
