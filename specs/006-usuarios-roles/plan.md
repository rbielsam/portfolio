# Plan — Gestión de usuarios y roles (Spec 006)

## Stack confirmado

- **Backend**: Laravel 13 + PHP 8.5
- **Frontend**: React 18 + Vite
- **Auth**: cookie httpOnly de sesión (Sanctum) — ya implementada
- **Base de datos**: MySQL 8.4

## Estructura de base de datos

**Tabla `users`** (ya existe):
- `id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`
- **Campo nuevo**: `role` (string, nullable, default `'reader'`)

**Migración nueva**: añadir columna `role` a `users`

No se crean tablas nuevas ni packages adicionales. Los tres roles son:
- `admin` — Administrador (todo)
- `editor` — Editor (contenido + mensajes)
- `reader` — Solo lectura (ver, no editar)

## Flujo de autorización

**Frontend**: Los botones de acciones (editar, borrar, crear) solo se muestran si el rol del usuario autenticado lo permite. Los permisos se obtienen desde `GET /api/user` (que ya devuelve el usuario con su rol).

**Backend**: Cada endpoint protegido comprueba el rol antes de ejecutar:
- `/api/profile` (PUT) → requiere `admin` o `editor`
- `/api/profile/photo` (POST/PUT/DELETE) → requiere `admin` o `editor`
- `/api/education` (POST/PUT/DELETE) → requiere `admin` o `editor`
- `/api/experience` (POST/PUT/DELETE) → requiere `admin` o `editor`
- `/api/projects` (POST/PUT/DELETE) → requiere `admin` o `editor`
- `/api/contact` (POST/PUT/DELETE) → requiere `admin` o `editor`
- `/api/admin/messages` (GET/PUT/DELETE) → requiere `admin` o `editor`
- `/api/admin/users` (GET/POST/PUT/DELETE) → requiere `admin` únicamente

**Implementación del middleware**: Se crea un middleware `CheckRole` que valida el rol del usuario autenticado contra los roles permitidos para cada endpoint.

```
Ejemplo: Route::middleware(['auth:sanctum', 'role:admin,editor'])->group(...)
```

## Estructura de ficheros

### Backend (`Laravel/`)
```
app/
├── Http/Controllers/Api/Admin/
│   ├── UserController.php           (listar, crear, editar, eliminar usuarios)
│   └── MessageController.php        (ya existe)
├── Http/Middleware/
│   └── CheckRole.php                (middleware de comprobación de rol)
├── Models/
│   └── User.php                     (añadir $fillable role)
├── Providers/
│   └── AppServiceProvider.php       (registrar CheckRole como alias 'role')
routes/
└── api.php                          (rutas de administración de usuarios)
tests/Feature/
└── AdminUserTest.php               (tests de gestión de usuarios)
```

### Frontend (`React/`)
```
src/
├── api/client.js                   (ya existe, añadir llamadas a /api/admin/users)
├── hooks/
│   └── usePermissions.js            (hook para comprobar permisos del rol)
├── components/admin/
│   └── UserManager.jsx              (gestión de usuarios: lista, crear, editar, eliminar)
├── pages/admin/
│   └── AdminUsuarios.jsx            (vista de gestión de usuarios)
├── pages/admin/AdminLayout.jsx     (añadir entrada "Usuarios" al menú)
└── styles/                         (estilos de UserManager si es necesario)
```

## Endpoints nuevos

| Método | Ruta | Rol requerido | Descripción |
|--------|------|---------------|-------------|
| GET | `/api/admin/users` | `admin` | Listar usuarios |
| POST | `/api/admin/users` | `admin` | Crear usuario |
| PUT | `/api/admin/users/{id}` | `admin` | Editar usuario (nombre, email, rol, contraseña) |
| DELETE | `/api/admin/users/{id}` | `admin` | Eliminar usuario |

## Validación de datos (UserController)

### Crear usuario
- `name`: required, string, max:255
- `email`: required, email, unique:users
- `role`: required, in:admin,editor,reader
- `password`: required, string, min:8, confirmed

### Editar usuario
- `name`: sometimes, string, max:255
- `email`: sometimes, email, unique:users,ignore:{id}
- `role`: sometimes, in:admin,editor,reader
- `password`: nullable, string, min:8, confirmed

## Restricciones especiales

1. **No eliminarse a sí mismo**: el admin no puede borrar su propia cuenta.
2. **No degradarse a sí mismo**: el admin no puede cambiar su propio rol (evitar quedarse sin admin).
3. **Contraseña opcional al editar**: si se deja en blanco, no se cambia.
4. **Contraseña obligatoria al crear**: siempre se requiere.

## Migración

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('role', 20)->default('reader')->after('email');
});
```

## Pasos de implementación

1. **Tests primero** — `AdminUserTest`: crear, listar, editar, eliminar usuarios; permisos por rol; restricciones especiales.
2. **Migración**: añadir columna `role` a `users`.
3. **Modelo User**: añadir `role` a `$fillable`.
4. **Middleware `CheckRole`**: comprobación de rol en el backend.
5. **Registrar middleware** como alias `role` en `AppServiceProvider`.
6. **Controlador `UserController`**: listar, crear, editar, eliminar.
7. **Rutas** de administración de usuarios bajo `auth:sanctum` + `role:admin`.
8. **Frontend**: hook `usePermissions` (lee el rol desde el contexto de auth).
9. **Componente `UserManager`**: lista, crear, editar, eliminar.
10. **Vista `AdminUsuarios`** y entrada en el menú del panel.
11. **Permisos en botones**: ocultar acciones según el rol (frontend).
12. **Verificación** del flujo completo y suite final.

## Criterios de finalización del plan

- La migración añade el campo `role` sin romper usuarios existentes.
- El middleware `CheckRole` rechaza peticiones sin el rol adecuado (403).
- El administrador puede crear usuarios con rol y contraseña.
- Los usuarios creados pueden iniciar sesión.
- El rol Editor puede gestionar contenido pero no usuarios.
- El rol Solo lectura no puede editar nada.
- No hay registro público.
- Las contraseñas se almacenan hasheadas.
- Las pruebas definidas pasan.
