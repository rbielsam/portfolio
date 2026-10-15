# Plan — Backend base (Spec 002)

## Stack confirmado

- **Backend**: Laravel (PHP)
- **Base de datos**: MySQL
- **Autenticación**: Laravel Sanctum
- **Ubicación**: carpeta `Laravel/` en la raíz del proyecto

## Estructura de base de datos

Tablas en inglés, sin campo `order`. Orden por fecha más reciente primero.

**`profile`** (1 fila, datos de la persona):
- `id`, `name`, `title` (cargo), `bio`, `photo` (ruta/URL), `created_at`, `updated_at`

**`education`**:
- `id`, `title`, `institution`, `start_date`, `end_date` (nullable), `description`, `created_at`, `updated_at`
- Orden: `start_date` descendente

**`experience`**:
- `id`, `position`, `company`, `start_date`, `end_date` (nullable), `description`, `is_current` (bool), `created_at`, `updated_at`
- Orden: `start_date` descendente

**`projects`**:
- `id`, `title`, `description`, `url`, `image` (nullable), `technologies`, `date` (nullable), `created_at`, `updated_at`
- Orden: `date` descendente (con `created_at` descendente como desempate)

**`contact`** (⚠️ interno, NO público):
- `id`, `type`, `value`, `created_at`, `updated_at`
- Orden: `id` (orden de inserción)

**`users`** (gestionado por Laravel + Sanctum):
- `id`, `name`, `email`, `password`, `created_at`, `updated_at`

## API

### Pública (lectura, GET)
- `GET /api/profile`
- `GET /api/education`
- `GET /api/experience`
- `GET /api/projects`
- (`contact` NO es público)

### Protegida (escritura, middleware `auth:sanctum` + fachada `Auth`)
- CRUD `education`, `experience`, `projects`
- CRUD `contact` (solo administrador)
- `GET`/`PUT` `profile` (lectura pública, escritura protegida)

### Autenticación
- `POST /api/login` (emite token Sanctum)
- `POST /api/logout`

## Registro del primer administrador

Comando Artisan interactivo (fichero PHP): `php artisan portfolio:setup-admin`
- Pide email y contraseña interactivamente (contraseña oculta al teclear).
- Hashea la contraseña con `Hash::make()`.
- Evita duplicados si ya existe un administrador.

## Estructura del proyecto (Laravel)

```
Laravel/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── ProfileController.php
│   │   ├── EducationController.php
│   │   ├── ExperienceController.php
│   │   ├── ProjectController.php
│   │   └── ContactController.php
│   ├── Models/
│   │   ├── Profile.php
│   │   ├── Education.php
│   │   ├── Experience.php
│   │   ├── Project.php
│   │   └── Contact.php
│   └── Console/Commands/
│       └── SetupAdmin.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php
│   └── web.php
├── .env (credenciales, excluido del repositorio)
└── ... (estructura estándar de Laravel)
```

## Pasos de implementación

1. Instalar Laravel en `Laravel/`
2. Configurar `.env` y conexión MySQL
3. Crear modelos y migraciones
4. Ejecutar migraciones
5. Instalar y configurar Sanctum
6. Crear rutas API públicas (lectura)
7. Crear controladores de lectura
8. Crear login/logout (Sanctum)
9. Crear rutas y controladores protegidos (CRUD)
10. Crear comando `setup-admin` interactivo
11. Probar API (lectura pública y escritura protegida)
12. Tests

## Criterios de finalización del plan

- Estructura de base de datos creada y migraciones ejecutadas.
- API pública responde en JSON.
- Sanctum funciona (login/logout).
- API de escritura protegida (rechaza peticiones sin token válido).
- Comando `setup-admin` crea el administrador con contraseña hasheada.
- Los tests definidos pasan.
