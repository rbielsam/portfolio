# Spec — Backend base (Laravel + MySQL)

## Contexto y objetivo

El portfolio necesita un backend que almacene y sirva el contenido de las secciones (Formación, Experiencia, Proyectos), el perfil de la persona y los datos de contacto. Actualmente el frontend muestra contenido estático o "en creación"; el backend permitirá centralizar los datos y servirlos mediante una API.

El objetivo de esta versión es montar el backend completo en Laravel con base de datos MySQL, una API de lectura pública y una API de escritura protegida para el administrador, con autenticación mediante Sanctum.

## Usuarios

- **Visitantes**: personas que acceden al portfolio y consumen los datos públicos (lectura).
- **Administrador**: persona autenticada que gestiona el contenido (escritura/CRUD).

## Requisitos funcionales

### RF-1: Proyecto Laravel en la carpeta Laravel/

**QUÉ**: El proyecto Laravel debe instalarse y funcionar dentro de la carpeta `Laravel/` de la raíz del proyecto.
**POR QUÉ**: Mantener separados el frontend (React) y el backend (Laravel) en carpetas independientes.

**Criterios de aceptación (EARS)**:
- **Cuando** se acceda a la carpeta `Laravel/`, **el sistema deberá** contener un proyecto Laravel funcional.
- **Cuando** se ejecute el servidor de desarrollo, **el sistema deberá** responder correctamente.

---

### RF-2: Conexión a base de datos MySQL

**QUÉ**: El backend debe conectarse a una base de datos MySQL.
**POR QUÉ**: Persistir los datos del portfolio de forma estructurada.

**Criterios de aceptación (EARS)**:
- **Cuando** el proyecto Laravel se inicie, **el sistema deberá** conectarse a la base de datos MySQL configurada.
- **Si** la conexión falla, **el sistema deberá** mostrar un error claro sin exponer credenciales.

---

### RF-3: Estructura de base de datos

**QUÉ**: La base de datos debe contener las entidades: Formación, Experiencia, Proyectos, Perfil y Contacto.
**POR QUÉ**: Almacenar todo el contenido del portfolio de forma organizada.

**Criterios de aceptación (EARS)**:
- **Cuando** se cree la base de datos, **el sistema deberá** contener tablas para `profile`, `education`, `experience`, `projects`, `contact` y `users`.
- **Cuando** se consulten los datos, **el sistema deberá** ordenarlos por fecha más reciente primero.

---

### RF-4: API de lectura pública

**QUÉ**: El backend debe exponer endpoints de lectura pública (GET) para que cualquier visitante pueda consultar los datos.
**POR QUÉ**: Permitir que el frontend muestre el contenido del portfolio a los visitantes.

**Criterios de aceptación (EARS)**:
- **Cuando** un visitante solicite los datos de una sección, **el sistema deberá** devolverlos en formato JSON.
- **Cuando** se soliciten datos que no existen, **el sistema deberá** devolver una respuesta adecuada (vacía o con error 404).

---

### RF-5: Autenticación con Sanctum

**QUÉ**: El backend debe implementar autenticación mediante Sanctum para el administrador.
**POR QUÉ**: Proteger el acceso de escritura y cumplir la constitución (el área de administración requiere autenticación).

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador envíe credenciales válidas, **el sistema deberá** emitir un token de acceso.
- **Cuando** el administrador envíe credenciales incorrectas, **el sistema deberá** rechazar el acceso sin revelar si el usuario existe.
- **Cuando** se solicite un endpoint protegido sin token válido, **el sistema deberá** devolver un error de no autenticado.

---

### RF-6: API de escritura protegida (CRUD para administrador)

**QUÉ**: El backend debe exponer endpoints de escritura (crear, editar, borrar) protegidos por autenticación, usando middleware `auth` y la fachada `Auth`.
**POR QUÉ**: Permitir al administrador gestionar el contenido de forma segura.

**Criterios de aceptación (EARS)**:
- **Cuando** un administrador autenticado solicite crear, editar o borrar contenido, **el sistema deberá** ejecutar la operación.
- **Cuando** un usuario no autenticado solicite una operación de escritura, **el sistema deberá** rechazarla.
- **Cuando** se intente una operación de escritura inválida, **el sistema deberá** devolver un error de validación.

---

### RF-7: Registro del primer administrador

**QUÉ**: El backend debe incluir un mecanismo (vía fichero PHP) para registrar el primer administrador, almacenando la contraseña hasheada.
**POR QUÉ**: Permite tener una cuenta inicial segura sin exponer credenciales en el código.

**Criterios de aceptación (EARS)**:
- **Cuando** se ejecute el registro del primer administrador, **el sistema deberá** crear el usuario con la contraseña hasheada.
- **Cuando** se almacene el administrador, **el sistema no deberá** guardar la contraseña en texto plano.
- **Cuando** ya exista un administrador, **el sistema deberá** evitar crear duplicados o avisar.

---

## Requisitos no funcionales

- **Seguridad**: contraseñas hasheadas; credenciales y secretos nunca en el código ni en archivos públicos.
- **Protección de datos**: los datos de contacto no deben exponerse públicamente en los endpoints de lectura.
- **Separación de responsabilidades**: mantener separadas la interfaz, la lógica de negocio y el acceso a datos; el frontend no accede directamente a la base de datos.
- **Simplicidad**: evitar funcionalidades innecesarias (gestión de roles, formulario de contacto) en esta versión.

## Casos límite

- **Base de datos no disponible**: el sistema debe fallar de forma controlada y con un mensaje claro, sin filtrar credenciales.
- **Escritura sin autenticación**: debe rechazarse siempre.
- **Credenciales incorrectas**: debe rechazarse sin indicar si el usuario existe.
- **Datos inexistentes en lectura**: respuesta vacía o 404, nunca un error fatal.
- **Intento de registrar un segundo administrador inicial**: debe evitarse o avisar.

## Fuera de alcance

- Gestión de usuarios con permisos/roles (spec aparte).
- Formulario de contacto y envío de mensajes (spec aparte).
- Conexión del frontend React con esta API (spec aparte).
- Despliegue/hosting.
- Contenido real de las secciones (se definirá al poblar la base de datos).

## Criterios de finalización

- Proyecto Laravel funcional en `Laravel/`.
- Conexión MySQL configurada y funcionando.
- Estructura de base de datos creada (Formación, Experiencia, Proyectos, Perfil, Contacto).
- Endpoints de lectura pública responden en JSON.
- Login del administrador funciona con Sanctum.
- Endpoints de escritura protegidos con middleware `auth`.
- Primer administrador registrado con contraseña hasheada.
- Las pruebas definidas pasan.

## Dudas resueltas

- **Estructura de base de datos**: tablas en inglés (`profile`, `education`, `experience`, `projects`, `contact`, `users`), sin campo `order`; orden por fecha más reciente primero. Detalle de campos en el plan.
- **Registro del primer administrador**: fichero PHP interactivo (comando Artisan) que pide email y contraseña al ejecutarlo; contraseña hasheada.
