# Spec — Conexión frontend con API (React + Laravel)

## Contexto y objetivo

El frontend (React) y el backend (Laravel) están desarrollados de forma independiente. El frontend muestra contenido estático o "en creación", y el backend expone una API con los datos reales del perfil, formación, experiencia y proyectos.

El objetivo de esta spec es **conectar el frontend con la API** para que las secciones muestren los datos reales almacenados en la base de datos, y el login autentique contra el sistema real (Sanctum). Los datos se gestionarán manualmente desde el área de administración.

## Usuarios

- **Visitantes**: personas que acceden al portfolio y ven el contenido real (perfil, formación, experiencia, proyectos).
- **Administrador**: persona autenticada que gestiona el contenido desde el área de administración (CRUD).

## Requisitos funcionales

### RF-1: Configuración de comunicación frontend-backend

**QUÉ**: El frontend debe poder comunicarse con la API del backend, tanto en desarrollo como en producción.
**POR QUÉ**: Es la base para que el frontend obtenga los datos reales.

**Criterios de aceptación (EARS)**:
- **Cuando** el frontend se ejecute en desarrollo, **el sistema deberá** redirigir las peticiones `/api` al backend Laravel mediante proxy de Vite.
- **Cuando** el frontend se despliegue en producción (AWS), **el sistema deberá** servir el frontend y la API bajo el mismo origen (CloudFront: `/` → S3, `/api` → backend).
- **Cuando** el frontend realice una petición a la API, **el sistema deberá** incluir las cabeceras necesarias para la autenticación cuando exista token.

---

### RF-2: Sección Inicio con datos del perfil

**QUÉ**: La sección Inicio debe cargar y mostrar los datos reales del perfil desde la API.
**POR QUÉ**: Presentar al visitante con el nombre, cargo y biografía reales del autor.

**Criterios de aceptación (EARS)**:
- **Cuando** se muestre la sección Inicio, **el sistema deberá** obtener los datos del perfil desde la API.
- **Cuando** se carguen los datos del perfil, **el sistema deberá** mostrar la foto dentro del círculo.
- **Cuando** se carguen los datos del perfil, **el sistema deberá** mostrar el nombre, el título/cargo y la biografía en la página.
- **Si** la API devuelve un error o no hay datos, **el sistema deberá** mostrar el estado correspondiente (error o vacío).

---

### RF-3: Sección Formación con datos reales

**QUÉ**: La sección Formación debe cargar y mostrar la formación académica desde la API.
**POR QUÉ**: Mostrar la formación real del autor.

**Criterios de aceptación (EARS)**:
- **Cuando** se muestre la sección Formación, **el sistema deberá** obtener la lista de formación desde la API.
- **Cuando** se carguen los datos, **el sistema deberá** mostrarlos ordenados por fecha más reciente primero.
- **Si** la lista está vacía, **el sistema deberá** mostrar "No hay datos disponibles".
- **Si** la API devuelve un error, **el sistema deberá** mostrar el estado de error.

---

### RF-4: Sección Experiencia con datos reales

**QUÉ**: La sección Experiencia debe cargar y mostrar la experiencia laboral desde la API.
**POR QUÉ**: Mostrar la experiencia real del autor.

**Criterios de aceptación (EARS)**:
- **Cuando** se muestre la sección Experiencia, **el sistema deberá** obtener la lista de experiencia desde la API.
- **Cuando** se carguen los datos, **el sistema deberá** mostrarlos ordenados por fecha más reciente primero.
- **Si** la lista está vacía, **el sistema deberá** mostrar "No hay datos disponibles".
- **Si** la API devuelve un error, **el sistema deberá** mostrar el estado de error.

---

### RF-5: Sección Proyectos con datos reales

**QUÉ**: La sección Proyectos debe cargar y mostrar los proyectos desde la API.
**POR QUÉ**: Mostrar los proyectos reales del autor.

**Criterios de aceptación (EARS)**:
- **Cuando** se muestre la sección Proyectos, **el sistema deberá** obtener la lista de proyectos desde la API.
- **Cuando** se carguen los datos, **el sistema deberá** mostrarlos ordenados por fecha más reciente primero.
- **Si** la lista está vacía, **el sistema deberá** mostrar "No hay datos disponibles".
- **Si** la API devuelve un error, **el sistema deberá** mostrar el estado de error.

---

### RF-6: Login funcional contra la API

**QUÉ**: El botón Login debe autenticar contra la API real usando Sanctum.
**POR QUÉ**: Permitir al administrador acceder al área de gestión de contenido.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador envíe credenciales válidas, **el sistema deberá** almacenar el token de autenticación y mostrar el área de administración.
- **Cuando** el administrador envíe credenciales incorrectas, **el sistema deberá** mostrar un mensaje de error.
- **Cuando** el administrador cierre sesión, **el sistema deberá** eliminar el token y mostrar la vista pública.
- **Si** ya existe un token válido al cargar la página, **el sistema deberá** mantener la sesión activa.

---

### RF-7: Área de administración (CRUD)

**QUÉ**: El área de administración debe permitir gestionar el contenido (perfil, formación, experiencia, proyectos) mediante operaciones CRUD.
**POR QUÉ**: Permitir al administrador crear, editar y borrar el contenido sin tocar la base de datos directamente.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador acceda al área de administración, **el sistema deberá** mostrar las secciones gestionables.
- **Cuando** el administrador cree, edite o borre contenido, **el sistema deberá** enviar la operación a la API y actualizar la vista.
- **Cuando** se realice una operación de escritura, **el sistema deberá** enviar el token de autenticación.
- **Si** la operación falla, **el sistema deberá** mostrar un mensaje de error.

---

### RF-8: Estados de la interfaz (carga, error, vacío)

**QUÉ**: La interfaz debe mostrar estados claros mientras carga, si hay error o si no hay datos.
**POR QUÉ**: Mejorar la experiencia del usuario durante la carga de datos.

**Criterios de aceptación (EARS)**:
- **Mientras** se cargan los datos de una sección, **el sistema deberá** mostrar una animación "Cargando..." (o "Cargando" con los 3 puntos apareciendo uno a uno).
- **Cuando** la API devuelva un error, **el sistema deberá** mostrar un mensaje de error y un botón "Recarga la página".
- **Cuando** la API devuelva una lista vacía, **el sistema deberá** mostrar "No hay datos disponibles".

---

## Requisitos no funcionales

- **Rendimiento**: las peticiones a la API deben ser eficientes, sin recargas innecesarias.
- **Manejo de errores**: la interfaz debe fallar de forma controlada, nunca con errores en blanco.
- **Seguridad**: el token de autenticación debe almacenarse de forma segura y enviarse solo en peticiones autenticadas.
- **Responsive**: los estados de carga, error y vacío deben adaptarse a distintos tamaños de pantalla.

## Casos límite

- **Red caída durante la carga**: la interfaz debe mostrar el estado de error con opción de recargar.
- **Token caducado o inválido**: la interfaz debe manejar el error de autenticación y permitir iniciar sesión de nuevo.
- **Datos parciales del perfil**: si faltan campos opcionales (título, bio, foto), la interfaz debe no romperse.
- **Lista con un solo elemento**: los estados de carga/error/vacío deben funcionar igual con un elemento que con muchos.

## Fuera de alcance

- Gestión de usuarios con permisos/roles (spec aparte).
- Formulario de contacto (spec aparte).
- Despliegue en AWS (spec aparte).
- Migración de datos desde el frontend antiguo.
- Paginación de listas (si en el futuro hay muchos elementos).

## Criterios de finalización

- El frontend se comunica correctamente con la API (desarrollo y producción).
- Las secciones Inicio, Formación, Experiencia y Proyectos muestran datos reales de la API.
- El login autentica contra la API real (Sanctum) y mantiene la sesión.
- El área de administración permite CRUD de perfil, formación, experiencia y proyectos.
- Los estados de carga, error y vacío funcionan correctamente.
- Los tests definidos pasan.

## Dudas abiertas

- [NECESITA ACLARACIÓN] Formato exacto de cómo se almacena el token en el frontend (localStorage, cookies httpOnly, etc.).
- [NECESITA ACLARACIÓN] Si el área de administración debe tener una vista única con todas las secciones o vistas separadas.
- [NECESITA ACLARACIÓN] Diseño visual del área de administración (puede definirse en el plan).
