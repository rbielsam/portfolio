# Portfolio

Aplicación web que presenta mi perfil profesional —formación, experiencia, proyectos y contacto— con un panel de administración desde el que se gestiona todo el contenido.

**Sitio:** [rbielsam.es](https://rbielsam.es) *(en preparación)*

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18 · Vite · CSS3 |
| Backend | Laravel 13 · PHP 8.5 |
| Base de datos | MySQL |
| Autenticación | Laravel Sanctum (tokens) |
| Despliegue | AWS (EC2 + RDS + S3) |

## Qué incluye

**Portada pública**

- Formación, experiencia, proyectos y contacto, con navegación adaptada a móvil y escritorio.
- Tres idiomas: español, català y English.
- Formulario de contacto con protección antispam y límite de peticiones.

**Panel de administración**

- Perfil profesional y fotografía.
- Alta, edición y borrado de formación, experiencia y proyectos.
- Lectura y gestión de los mensajes recibidos.
- Usuarios con los roles `admin`, `editor` y `reader`.
- Indicador de sesión persistente.

## Estructura

```
.
├── Laravel/    API REST, autenticación y reglas de negocio
├── React/      Portada pública y panel de administración
├── specs/      Especificación, plan y tareas de cada funcionalidad
├── docs/       Documentación operativa
├── deploy/     Scripts de publicación y respaldo
└── AGENTS.md   Reglas y convenciones del proyecto
```

## Arranque local

**Backend**

```bash
cd Laravel
composer install
cp .env.example .env        # completar credenciales y ejecutar key:generate
php artisan migrate --seed
php artisan portfolio:setup-admin
php artisan serve           # http://127.0.0.1:8000
```

**Frontend**

```bash
cd React
npm install
npm run dev                 # http://localhost:5173
```

El proxy de Vite reenvía `/api` y `/sanctum` al backend en `http://localhost:8000`.

## Pruebas

```bash
cd Laravel && php artisan test     # 105 pruebas de backend
cd React && npm test               # 234 pruebas de frontend
```

## Metodología

Cada funcionalidad recorre el flujo **Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación**. Las especificaciones completas están en [`specs/`](specs/), y cada una incluye su plan y su lista de tareas.

## Despliegue

El procedimiento de publicación, respaldo y mantenimiento en AWS está documentado en [`docs/despliegue.md`](docs/despliegue.md), con los scripts correspondientes en [`deploy/`](deploy/).

## Licencia

Todos los derechos reservados.
