# Tareas — Backend base (Spec 002)

> Enfoque: tests primero, luego código. Herramienta de tests: PHPUnit de Laravel (`php artisan test`).

## Fase 1: Instalación y configuración

### T1.1: Instalar Laravel en Laravel/ ✅
Instalar el proyecto Laravel dentro de la carpeta `Laravel/` de la raíz.

**Criterios de aceptación**:
- El proyecto Laravel existe en `Laravel/`.
- El servidor de desarrollo arranca (`php artisan serve`).

---

### T1.2: Configurar `.env` y conexión MySQL ✅
Configurar las variables de entorno y la conexión a MySQL.

**Criterios de aceptación**:
- `.env` contiene la configuración de MySQL.
- La conexión a la base de datos funciona.
- Las credenciales están en `.env` (excluido del repositorio).

---

### T1.3: Instalar y configurar Sanctum ✅
Instalar Laravel Sanctum y publicar su configuración/migraciones.

**Criterios de aceptación**:
- Sanctum está instalado.
- La migración de `personal_access_tokens` se ejecuta.
- El middleware de Sanctum está configurado.

---

## Fase 2: Base de datos

### T2.1: Crear modelos y migraciones ✅
Crear los modelos y migraciones para `profile`, `education`, `experience`, `projects` y `contact` (sin campo `order`).

**Criterios de aceptación**:
- Existen modelos: Profile, Education, Experience, Project, Contact.
- Las migraciones crean las tablas con los campos definidos en el plan.
- `projects` tiene campo `date` (nullable).

---

### T2.2: Ejecutar migraciones ✅
Ejecutar las migraciones para crear las tablas.

**Criterios de aceptación**:
- Las tablas existen en la base de datos.
- `users` (de Laravel) y `personal_access_tokens` (Sanctum) están creadas.

---

## Fase 3: API pública (lectura)

### T3.1: Crear rutas API públicas (GET) ✅
Definir rutas GET públicas para profile, education, experience y projects.

**Criterios de aceptación**:
- `GET /api/profile` existe.
- `GET /api/education` existe.
- `GET /api/experience` existe.
- `GET /api/projects` existe.
- `contact` NO tiene ruta pública.

---

### T3.2: Crear controladores de lectura ✅
Crear los controladores que devuelven los datos en JSON.

**Criterios de aceptación**:
- Los endpoints devuelven JSON.
- Si no hay datos, devuelven respuesta vacía adecuada (no error fatal).

---

### T3.3: Implementar ordenación por fecha más reciente ✅
Ordenar los resultados por fecha más reciente primero.

**Criterios de aceptación**:
- `education` ordena por `start_date` descendente.
- `experience` ordena por `start_date` descendente.
- `projects` ordena por `date` descendente (con `created_at` como desempate).

---

## Fase 4: Autenticación (Sanctum)

### T4.1: Crear AuthController (login/logout) ✅
Crear el controlador de autenticación con Sanctum.

**Criterios de aceptación**:
- `POST /api/login` emite un token con credenciales válidas.
- `POST /api/login` rechaza credenciales incorrectas sin revelar si el usuario existe.
- `POST /api/logout` revoca el token.

---

## Fase 5: API protegida (escritura)

### T5.1: Crear rutas protegidas (middleware `auth:sanctum`) ✅
Definir rutas de escritura protegidas por autenticación.

**Criterios de aceptación**:
- CRUD de `education`, `experience`, `projects` requiere token válido.
- CRUD de `contact` requiere token válido.
- `PUT /api/profile` requiere token válido.

---

### T5.2: Crear controladores CRUD ✅
Crear los controladores de crear, editar y borrar.

**Criterios de aceptación**:
- Un administrador autenticado puede crear, editar y borrar.
- Un usuario no autenticado no puede escribir.
- Se usa la fachada `Auth` para identificar al usuario.

---

### T5.3: Aplicar validación ✅
Validar los datos de entrada en las operaciones de escritura.

**Criterios de aceptación**:
- Datos inválidos devuelven error de validación.
- Datos válidos se procesan correctamente.

---

## Fase 6: Registro del primer administrador

### T6.1: Crear comando `setup-admin` interactivo ✅
Crear el comando Artisan `php artisan portfolio:setup-admin` que pide email y contraseña interactivamente.

**Criterios de aceptación**:
- El comando pide email y contraseña (contraseña oculta).
- El comando crea el usuario administrador.

---

### T6.2: Hashear contraseña y evitar duplicados ✅
Hashear la contraseña y evitar crear un segundo administrador.

**Criterios de aceptación**:
- La contraseña se guarda hasheada (`Hash::make`), nunca en texto plano.
- Si ya existe un administrador, el comando avisa y no crea duplicados.

---

## Fase 7: Pruebas y validación

### T7.1: Probar API de lectura pública ✅
Verificar que los endpoints públicos responden correctamente.

**Criterios de aceptación**:
- Los endpoints GET públicos devuelven los datos en JSON.
- `contact` no es accesible públicamente.

---

### T7.2: Probar API de escritura protegida ✅
Verificar que la escritura requiere autenticación.

**Criterios de aceptación**:
- Sin token, las operaciones de escritura se rechazan.
- Con token, las operaciones funcionan.

---

### T7.3: Tests ✅
Escribir y ejecutar tests (PHPUnit) para los casos principales.

**Criterios de aceptación**:
- Los tests pasan (`php artisan test`).
- Se cubren: lectura pública, login/logout, escritura protegida, setup-admin.

---

## Criterios de finalización

- Todas las tareas completadas.
- API pública funciona.
- Sanctum funciona (login/logout).
- API de escritura protegida funciona.
- Comando `setup-admin` crea admin con contraseña hasheada.
- Los tests pasan.
- El código sigue las convenciones de Laravel.
