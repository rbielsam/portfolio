# Plan — Conexión frontend con API (Spec 003)

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Backend**: Laravel 13 + PHP + MySQL + Sanctum (en `Laravel/`)
- **Autenticación**: Cookie `httpOnly` + `Secure` + `SameSite=Lax`
- **Desarrollo**: Vite proxy (`/api` → `localhost:8000`)
- **Producción**: CloudFront mismo origen (`/` → S3, `/api` → backend)

## Arquitectura

### Flujo de autenticación (cookie httpOnly)

```
1. Frontend → GET /sanctum/csrf-cookie → Laravel devuelve cookie XSRF-TOKEN
2. Frontend → POST /api/login (con credenciales) → Laravel valida y devuelve cookie httpOnly
3. Frontend → Peticiones /api/* (el navegador envía la cookie automáticamente)
4. Frontend → POST /api/logout → Laravel invalida la cookie
```

### Flujo de datos

```
1. Usuario hace clic en una sección (Inicio, Formación, Experiencia, Proyectos)
2. Frontend → GET /api/{sección} → Laravel devuelve JSON
3. Frontend muestra: carga → datos → (error | vacío)
```

## Estructura de ficheros (frontend)

```
React/
├── vite.config.js                    # Añadir proxy /api → localhost:8000
├── src/
│   ├── main.jsx                      # Configurar Sanctum CSRF
│   ├── App.jsx                       # Añadir login + área admin
│   ├── api/
│   │   └── client.js                    # Cliente fetch con credentials: 'include'
│   ├── hooks/
│   │   ├── useFetch.js               # Hook genérico de carga de datos
│   │   └── useAuth.js                # Hook de autenticación (login, logout, user)
│   ├── components/
│   │   ├── Loading.jsx               # Animación "Cargando..."
│   │   ├── ErrorMessage.jsx          # Error + botón "Recarga la página"
│   │   ├── EmptyData.jsx             # "No hay datos disponibles"
│   │   └── sections/
│   │       ├── Inicio.jsx           # Perfil: foto en círculo, nombre, título, bio
│   │       ├── Formacion.jsx         # Lista de formación
│   │       ├── Experiencia.jsx       # Lista de experiencia
│   │       └── Proyectos.jsx         # Lista de proyectos
│   ├── pages/
│   │   ├── Login.jsx                 # Formulario de login
│   │   └── admin/
│   │       ├── AdminLayout.jsx       # Layout con menú lateral
│   │       ├── AdminPerfil.jsx       # CRUD perfil
│   │       ├── AdminFormacion.jsx    # CRUD formación
│   │       ├── AdminExperiencia.jsx  # CRUD experiencia
│   │       └── AdminProyectos.jsx    # CRUD proyectos
│   └── styles/
│       ├── admin.css                 # Estilo neutro/funcional
│       └── states.css                # Estilos de loading, error, empty
```

## Configuración de Vite proxy

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

## Configuración de Sanctum (backend)

El backend ya tiene Sanctum instalado. Para cookie httpOnly:

1. `config/sanctum.php` — asegurar que `stateful` incluye el dominio del frontend.
2. `config/cors.php` — `paths: ['api/*', 'sanctum/csrf-cookie']`, `credentials: true`.
3. `config/session.php` — `same_site: 'lax'`.

## Endpoints de la API (ya existentes)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/profile` | Perfil del autor |
| PUT | `/api/profile` | Actualizar perfil |
| GET | `/api/education` | Lista formación |
| POST | `/api/education` | Crear formación |
| PUT | `/api/education/{id}` | Actualizar formación |
| DELETE | `/api/education/{id}` | Borrar formación |
| GET | `/api/experience` | Lista experiencia |
| POST | `/api/experience` | Crear experiencia |
| PUT | `/api/experience/{id}` | Actualizar experiencia |
| DELETE | `/api/experience/{id}` | Borrar experiencia |
| GET | `/api/projects` | Lista proyectos |
| POST | `/api/projects` | Crear proyecto |
| PUT | `/api/projects/{id}` | Actualizar proyecto |
| DELETE | `/api/projects/{id}` | Borrar proyecto |
| POST | `/api/login` | Login (emite cookie) |
| POST | `/api/logout` | Logout |

## Pasos de implementación

1. **Configurar Vite proxy** — `vite.config.js`
2. **Configurar Sanctum stateful** — `config/sanctum.php`, `config/cors.php`, `config/session.php`
3. **Crear cliente API** — `src/api/client.js` (fetch con `credentials: 'include'`)
4. **Crear hook useFetch** — gestión de estados (carga, datos, error, vacío)
5. **Crear hook useAuth** — login, logout, user, CSRF
6. **Crear componentes de estado** — `Loading`, `ErrorMessage`, `EmptyData`
7. **Conectar secciones** — Inicio, Formación, Experiencia, Proyectos
8. **Crear página Login** — formulario + autenticación
9. **Crear área de administración** — `AdminLayout` + vistas separadas
10. **Implementar CRUD admin** — perfil, formación, experiencia, proyectos
11. **Probar flujo completo** — login, ver datos, gestionar contenido
12. **Tests**

## Criterios de finalización del plan

- Vite proxy configurado y funcional.
- Sanctum cookie httpOnly configurado en backend.
- Frontend conectado con API (secciones muestran datos reales).
- Login funcional (login, logout, sesión persistente).
- Área de administración con CRUD de todas las secciones.
- Estados de carga, error y vacío funcionando.
- Los tests definidos pasan.
