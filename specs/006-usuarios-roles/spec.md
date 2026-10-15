# Spec — Gestión de usuarios y roles

## Contexto y objetivo

Actualmente existe un único administrador, creado con el comando `php artisan portfolio:setup-admin`, y no hay forma de dar acceso a otras personas.

El objetivo es permitir que el administrador **cree usuarios y les asigne un rol**, para que puedan iniciar sesión en el área de administración y trabajar según sus permisos. No hay registro público: solo el administrador puede crear cuentas.

## Usuarios

- **Administrador**: persona con todos los permisos, incluida la gestión de usuarios.
- **Editor**: persona que gestiona el contenido y los mensajes, pero no la administración.
- **Solo lectura**: persona que puede ver el contenido, pero no modificarlo.
- **Visitante**: persona sin cuenta que accede al portfolio público. No puede iniciar sesión.

## Requisitos funcionales

### RF-1: Creación de usuarios por el administrador

**QUÉ**: El administrador debe poder crear usuarios nuevos desde el área de administración.
**POR QUÉ**: Dar acceso a otras personas sin que exista registro público.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador acceda a la sección de usuarios, **el sistema deberá** mostrar la opción de crear un usuario.
- **Cuando** el administrador envíe el formulario con nombre, email, rol y contraseña válidos, **el sistema deberá** crear el usuario.
- **Cuando** el usuario creado intente iniciar sesión, **el sistema deberá** aceptar sus credenciales.
- **Si** el email ya existe, **el sistema deberá** rechazar la creación.
- **Cuando** un usuario sin permiso de gestión intente crear usuarios, **el sistema deberá** rechazarlo.
- **Cuando** el administrador cree un usuario, **el sistema no deberá** mostrar la contraseña en texto plano después.

---

### RF-2: Roles predefinidos

**QUÉ**: Cada usuario tiene un rol que determina sus permisos.
**POR QUÉ**: Limitar lo que cada persona puede hacer según su función.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador cree un usuario, **el sistema deberá** permitir elegir un rol entre Editor, Administrador y Solo lectura.
- **Cuando** el administrador edite un usuario, **el sistema deberá** permitir cambiar su rol.
- **Cuando** un usuario con rol Editor acceda al panel, **el sistema no deberá** mostrar la sección de usuarios.
- **Cuando** un usuario con rol Solo lectura acceda al panel, **el sistema deberá** mostrar el contenido en modo consulta, sin acciones de escritura.

---

### RF-3: Permisos por rol

**QUÉ**: Los permisos están definidos por rol, no de forma individual.
**POR QUÉ**: Simplificar la gestión y evitar configuraciones contradictorias.

**Criterios de aceptación (EARS)**:

| Permiso | Administrador | Editor | Solo lectura |
|---|---|---|---|
| Ver contenido del portfolio | ✅ | ✅ | ✅ |
| Editar perfil y foto | ✅ | ✅ | — |
| CRUD Formación / Experiencia / Proyectos | ✅ | ✅ | — |
| Gestionar mensajes de contacto | ✅ | ✅ | — |
| Gestionar usuarios | ✅ | — | — |

- **Cuando** un usuario intente una acción que su rol no permite, **el sistema deberá** rechazarla.
- **Cuando** el frontend detecte que la acción no está permitida, **el sistema no deberá** mostrar los controles correspondientes.

---

### RF-4: Edición y eliminación de usuarios por el administrador

**QUÉ**: El administrador debe poder editar y eliminar usuarios.
**POR QUÉ**: Corregir datos o revocar accesos.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador edite el nombre, email o rol de un usuario, **el sistema deberá** actualizarlo.
- **Cuando** el administrador elimine un usuario, **el sistema deberá** retirar su acceso.
- **Si** el administrador se elimina a sí mismo, **el sistema deberá** impedirlo (no puede quedarse sin administrador).
- **Cuando** un usuario sea eliminado, **el sistema no deberá** permitirle iniciar sesión.

---

### RF-5: Contraseñas asignadas por el administrador

**QUÉ**: El administrador asigna la contraseña al crear el usuario.
**POR QUÉ**: El usuario no puede cambiarla por sí mismo; el administrador es el único que toca credenciales.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador cree un usuario, **el sistema deberá** pedir contraseña y confirmación.
- **Cuando** las contraseñas no coincidan, **el sistema deberá** rechazar la creación.
- **Cuando** se almacene la contraseña, **el sistema deberá** guardarla hasheada.
- **Cuando** el usuario inicie sesión, **el sistema no deberá** ofrecer la opción de cambiar su contraseña.
- **Si** el administrador necesita cambiar la contraseña de un usuario, **el sistema deberá** permitirlo desde la edición.

---

### RF-6: Listado de usuarios para el administrador

**QUÉ**: El administrador debe poder ver la lista de usuarios.
**POR QUÉ**: Gestionar quién tiene acceso.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador abra la sección de usuarios, **el sistema deberá** mostrar nombre, email y rol de cada usuario.
- **Cuando** haya muchos usuarios, **el sistema deberá** seguir mostrándolos de forma legible.
- **Cuando** un usuario sin permiso acceda a la lista, **el sistema deberá** denegar el acceso.

---

## Requisitos no funcionales

- **Seguridad**: las contraseñas siempre hasheadas; nunca en texto plano ni en el código.
- **Autorización**: la comprobación de permisos se hace en el backend, no solo ocultando botones.
- **Simplicidad**: roles predefinidos, no permisos individuales.
- **Usabilidad**: la gestión de usuarios debe ser clara y directa.

## Casos límite

- **Email duplicado**: se rechaza la creación con un mensaje claro.
- **Contraseña débil**: se exige una longitud mínima.
- **Eliminar al último administrador**: se impide.
- **Editar el propio rol**: un administrador no debería poder quitarse su propio rol (se queda sin acceso).
- **Usuario sin rol asignado**: no debe poder acceder.
- **Muchos usuarios**: la lista debe seguir siendo usable.

## Fuera de alcance

- Registro público o invitaciones por email.
- Cambio de contraseña por el propio usuario.
- Permisos individuales fuera de los roles predefinidos.
- Auditoría de acciones (quién hizo qué y cuándo).
- Bloqueo de cuentas tras varios intentos fallidos.

## Criterios de finalización

- El administrador puede crear usuarios con rol y contraseña.
- Los usuarios creados pueden iniciar sesión.
- Los tres roles funcionan según la tabla de permisos.
- El administrador puede editar y eliminar usuarios.
- No hay registro público.
- Las contraseñas se almacenan hasheadas.
- Las pruebas definidas pasan.

## Dudas resueltas

- **Roles**: tres predefinidos (Editor, Administrador, Solo lectura).
- **Creación**: solo el administrador; no hay registro público.
- **Inicio de sesión**: los usuarios creados pueden entrar con sus permisos.
- **Contraseñas**: las asigna el administrador; no hay cambio propio.
