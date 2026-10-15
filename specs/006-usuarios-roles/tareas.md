# Tareas — Gestión de usuarios y roles (Spec 006)

> Enfoque: tests primero, luego código. Backend: PHPUnit (`php artisan test`). Frontend: `node --test`.

## Fase 1: Base de datos y autorización

### T1.1: Migración del campo `role` ✅
Añadir columna `role` a la tabla `users` (string, default `reader`).

**Criterios de aceptación**:
- La migración añade `role` sin romper usuarios existentes.
- Los usuarios actuales quedan con el rol por defecto `reader`.
- Se puede revertir (`migrate:rollback`).

---

### T1.2: Tests del middleware `CheckRole` ✅
Tests del middleware de autorización por rol.

**Criterios de aceptación**:
- Un usuario `admin` pasa a rutas que requieren `admin`.
- Un usuario `editor` pasa a rutas que requieren `editor` pero no a las de `admin`.
- Un usuario `reader` no pasa a rutas de escritura.
- Un usuario sin rol no pasa a ninguna ruta protegida por rol.

---

### T1.3: Implementar middleware `CheckRole` ✅
Middleware que comprueba el rol del usuario autenticado.

**Criterios de aceptación**:
- El middleware se registra con el alias `role` en `AppServiceProvider`.
- Acepta una lista de roles permitidos (`role:admin,editor`).
- Devuelve 403 si el rol no está permitido.

---

### T1.4: Modelo User actualizado ✅
Añadir `role` a `$fillable` en el modelo `User`.

**Criterios de aceptación**:
- El campo `role` se puede asignar masivamente.
- El rol por defecto es `reader` si no se especifica.

---

## Fase 2: Endpoints de administración

### T2.1: Tests de los endpoints de usuarios ✅
Tests de crear, listar, editar y eliminar usuarios.

**Criterios de aceptación**:
- Sin autenticación, todos los endpoints devuelven 401.
- Sin rol `admin`, todos devuelven 403.
- `GET /api/admin/users` devuelve la lista con nombre, email y rol.
- `POST` con datos válidos crea el usuario (contraseña hasheada).
- `POST` con email duplicado devuelve 422.
- `POST` con contraseña sin confirmar devuelve 422.
- `POST` con rol inválido devuelve 422.
- `PUT` actualiza nombre, email, rol y contraseña (si se proporciona).
- `DELETE` elimina el usuario.
- `DELETE` del propio admin se rechaza.

---

### T2.2: Crear `UserController` ✅
Controlador con `index`, `store`, `update` y `destroy`.

**Criterios de aceptación**:
- Los cuatro métodos implementados.
- Validación de datos según el plan.
- Contraseña hasheada con `Hash::make()`.
- No se puede eliminar al propio admin.
- No se puede degradar el rol del propio admin.

---

### T2.3: Rutas y middleware en los endpoints existentes ✅
Proteger los endpoints de contenido según el rol.

**Criterios de aceptación**:
- Endpoints de contenido (education, experience, projects, contact, profile) requieren `admin` o `editor`.
- Endpoints de mensajes requieren `admin` o `editor`.
- Endpoints de usuarios requieren `admin`.
- Los endpoints públicos (lectura) siguen sin requerir rol.

---

## Fase 3: Frontend — permisos y gestión

### T3.1: Tests del hook `usePermissions` ✅
Tests del hook de permisos.

**Criterios de aceptación**:
- El hook devuelve el rol del usuario autenticado.
- El hook permite comprobar si el usuario tiene un permiso.
- El hook devuelve `false` si no hay usuario.

---

### T3.2: Crear hook `usePermissions` ✅
Hook que lee el rol desde el contexto de autenticación.

**Criterios de aceptación**:
- Devuelve `{ role, can }` donde `can(permission)` comprueba el rol.
- Se integra con el `AuthProvider` existente.
- Maneja los tres roles (admin, editor, reader).

---

### T3.3: Tests del componente `UserManager` ✅
Tests del componente de gestión de usuarios.

**Criterios de aceptación**:
- El componente muestra la lista de usuarios.
- El componente permite crear un usuario con formulario.
- El componente permite editar un usuario.
- El componente permite eliminar un usuario.
- Muestra el rol de cada usuario.
- Muestra error si el servidor rechaza.

---

### T3.4: Crear componente `UserManager` ✅
Componente con lista, formulario de creación y edición, y eliminación.

**Criterios de aceptación**:
- Lista usuarios con nombre, email y rol.
- Formulario de creación con nombre, email, rol y contraseña (con confirmación).
- Formulario de edición (contraseña opcional).
- Botón de eliminar con confirmación.
- Muestra estados de carga y error.

---

### T3.5: Integrar en el panel de administración ✅
Vista `AdminUsuarios` y entrada en el menú del panel.

**Criterios de aceptación**:
- La vista `AdminUsuarios` existe y usa `UserManager`.
- El menú del panel incluye la entrada "Usuarios" (solo visible para `admin`).
- La entrada no aparece para roles sin permiso de gestión.

---

### T3.6: Permisos en los botones de contenido ✅
Ocultar acciones según el rol.

**Criterios de aceptación**:
- Un `editor` no ve la entrada "Usuarios" en el menú.
- Un `reader` no ve botones de editar/crear/borrar en las secciones.
- Un `admin` ve todo.
- Los botones ocultos no son accesibles por teclado ni por clic.

---

## Fase 4: Validación

### T4.1: Verificar el flujo completo ✅
Comprobar creación, login y permisos de un usuario nuevo.

**Criterios de aceptación**:
- El admin crea un usuario editor.
- El editor puede iniciar sesión.
- El editor puede gestionar contenido pero no usuarios.
- El admin elimina al editor y su acceso se revoca.

---

### T4.2: Suite final y build ✅
Ejecutar todas las pruebas y el build.

**Criterios de aceptación**:
- `php artisan test` pasa.
- `node --test` pasa.
- `npm run build` no falla.

---

## Criterios de finalización

- Todas las tareas completadas.
- El administrador puede crear usuarios con rol y contraseña.
- Los usuarios creados pueden iniciar sesión.
- Los tres roles funcionan según la tabla de permisos.
- El administrador puede editar y eliminar usuarios.
- No hay registro público.
- Las contraseñas se almacenan hasheadas.
- Las pruebas definidas pasan.
