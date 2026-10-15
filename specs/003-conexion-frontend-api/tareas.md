# Tareas — Conexión frontend con API (Spec 003)

> Enfoque: tests primero, luego código. Tests con Vitest (frontend) y PHPUnit (backend, si aplica).

## Fase 1: Configuración

### T1.1: Configurar Vite proxy
Añadir proxy `/api` → `http://localhost:8000` en `vite.config.js`.

**Criterios de aceptación**:
- El proxy está configurado.
- Las peticiones `/api` desde el frontend se redirigen a Laravel.

---

### T1.2: Configurar Sanctum stateful (cookie httpOnly)
Ajustar `config/sanctum.php`, `config/cors.php` y `config/session.php`.

**Criterios de aceptación**:
- `sanctum.stateful` incluye el dominio del frontend.
- `cors.paths` incluye `api/*` y `sanctum/csrf-cookie`.
- `cors.supports_credentials` es `true`.
- `session.same_site` es `lax`.

---

## Fase 2: Cliente API y hooks

### T2.1: Crear cliente API (`src/api/client.js`)
Cliente fetch con `credentials: 'include'` para enviar cookies.

**Criterios de aceptación**:
- El cliente incluye `credentials: 'include'`.
- El cliente maneja respuestas JSON y errores.

---

### T2.2: Crear hook `useFetch`
Hook genérico para gestionar estados: carga, datos, error, vacío.

**Criterios de aceptación**:
- El hook devuelve `{ data, loading, error, isEmpty }`.
- El hook maneja peticiones GET a la API.

---

### T2.3: Crear hook `useAuth` ✅
Hook de autenticación: login, logout, user, CSRF.

**Criterios de aceptación**:
- El hook ejecuta `GET /sanctum/csrf-cookie` antes del login.
- El hook ejecuta `POST /api/login` con credenciales.
- El hook ejecuta `POST /api/logout`.
- El hook mantiene el estado del usuario autenticado.

---

## Fase 3: Componentes de estado

### T3.1: Crear componente `Loading` ✅
Animación "Cargando..." (o "Cargando" con los 3 puntos apareciendo uno a uno).

**Criterios de aceptación**:
- El componente muestra una animación o mensaje de carga.
- El componente es reutilizable.

---

### T3.2: Crear componente `ErrorMessage` ✅
Mensaje de error + botón "Recarga la página".

**Criterios de aceptación**:
- El componente muestra un mensaje de error.
- El componente incluye un botón que recarga la página.

---

### T3.3: Crear componente `EmptyData` ✅
Mensaje "No hay datos disponibles".

**Criterios de aceptación**:
- El componente muestra "No hay datos disponibles".
- El componente es reutilizable.

---

## Fase 4: Conectar secciones

### T4.1: Conectar sección Inicio (perfil) ✅
Cargar datos del perfil y mostrar foto, nombre, título y bio.

**Criterios de aceptación**:
- La sección carga el perfil desde la API.
- Se muestra la foto dentro del círculo.
- Se muestran nombre, título y biografía.

---

### T4.2: Conectar sección Formación ✅
Cargar lista de formación y mostrarla.

**Criterios de aceptación**:
- La sección carga la formación desde la API.
- Se muestra la lista ordenada por fecha más reciente.
- Se muestran los estados de carga, error y vacío.

---

### T4.3: Conectar sección Experiencia ✅
Cargar lista de experiencia y mostrarla.

**Criterios de aceptación**:
- La sección carga la experiencia desde la API.
- Se muestra la lista ordenada por fecha más reciente.
- Se muestran los estados de carga, error y vacío.

---

### T4.4: Conectar sección Proyectos ✅
Cargar lista de proyectos y mostrarla.

**Criterios de aceptación**:
- La sección carga los proyectos desde la API.
- Se muestra la lista ordenada por fecha más reciente.
- Se muestran los estados de carga, error y vacío.

---

## Fase 5: Login

### T5.1: Crear página Login ✅
Formulario de login con email y contraseña.

**Criterios de aceptación**:
- La página muestra un formulario de login.
- El login autentica contra `/api/login`.
- Se muestra un mensaje de error si las credenciales son incorrectas.

---

## Fase 6: Área de administración

### T6.1: Crear `AdminLayout` ✅
Layout con menú lateral y vistas separadas.

**Criterios de aceptación**:
- El layout incluye un menú lateral con enlaces a cada sección.
- El layout muestra el contenido de la sección activa.
- El layout incluye un botón de logout.

---

### T6.2: Crear vista AdminPerfil ✅
CRUD del perfil.

**Criterios de aceptación**:
- La vista muestra el formulario de perfil.
- La vista permite crear/editar el perfil.
- La vista muestra los estados de carga, error y vacío.

---

### T6.3: Crear vista AdminFormacion ✅
CRUD de formación.

**Criterios de aceptación**:
- La vista muestra la lista de formación.
- La vista permite crear, editar y borrar formación.
- La vista muestra los estados de carga, error y vacío.

---

### T6.4: Crear vista AdminExperiencia ✅
CRUD de experiencia.

**Criterios de aceptación**:
- La vista muestra la lista de experiencia.
- La vista permite crear, editar y borrar experiencia.
- La vista muestra los estados de carga, error y vacío.

---

### T6.5: Crear vista AdminProyectos ✅
CRUD de proyectos.

**Criterios de aceptación**:
- La vista muestra la lista de proyectos.
- La vista permite crear, editar y borrar proyectos.
- La vista muestra los estados de carga, error y vacío.

---

## Fase 7: Pruebas y validación

### T7.1: Tests del frontend ✅
Tests de los hooks y componentes.

**Criterios de aceptación**:
- Tests de `useFetch` (carga, datos, error, vacío).
- Tests de `useAuth` (login, logout).
- Tests de los componentes de estado.
- Tests de las secciones (mock de la API).

---

### T7.2: Probar flujo completo ✅
Verificar login, visualización de datos y gestión de contenido.

**Criterios de aceptación**:
- El login funciona con credenciales válidas.
- Las secciones muestran datos reales.
- El área de administración permite CRUD.

---

## Criterios de finalización

- Todas las tareas completadas.
- El frontend se comunica correctamente con la API.
- Las secciones muestran datos reales.
- El login funciona con cookie httpOnly.
- El área de administración permite CRUD de todas las secciones.
- Los estados de carga, error y vacío funcionan.
- Los tests pasan.
