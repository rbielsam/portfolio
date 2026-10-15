# Plan — Formulario de contacto (Spec 004)

## Stack confirmado

- **Frontend**: React 18 + CSS3 puro (en `React/`)
- **Backend**: Laravel 13 + PHP + MySQL + Sanctum (en `Laravel/`)
- **Auth**: cookie httpOnly de sesión ya existente (no se toca)
- **Email**: Laravel Mail (Mailable), transporte `log` en local, SMTP/SES en producción

## Variables de entorno (`.env`)

```
ADMIN_EMAIL=<ADMIN_EMAIL>
CONTACT_MESSAGE_MAX=5000
```

Nunca en código. `.env` ya está en `.gitignore`.

## Estructura de base de datos

**`contact_messages`** (nueva):
- `id`
- `name` (string)
- `email` (string)
- `message` (text)
- `is_read` (boolean, default false)
- `created_at`, `updated_at`

> Nota: la tabla `contact` existente (datos internos de contacto del admin) **no se modifica**. Se crea una tabla nueva y separada para los mensajes recibidos.

## Endpoints de la API

### Público
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/contact/messages` | Enviar mensaje (público, con rate limit) |

### Protegidos (`auth:sanctum`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/messages` | Listar mensajes |
| PUT | `/api/admin/messages/{id}/read` | Marcar como atendido |
| DELETE | `/api/admin/messages/{id}` | Eliminar mensaje |

## Protección antispam

- **Honeypot**: campo `website` en el formulario, oculto con CSS. Si viene relleno → se descarta el envío en silencio (respuesta 200, sin guardar, sin error visible).
- **Rate limit**: `throttle` en la ruta pública — máximo 3 envíos por IP cada 5 minutos. Al superar → 429 con mensaje claro.

## Email (aviso)

- **Mailable** `ContactMessageNotification` → a `ADMIN_EMAIL`.
- El envío se hace **después** de guardar el mensaje.
- Si el envío falla: se captura la excepción, se registra en el log y el visitante **no** ve error (el mensaje ya está guardado).

## Estructura de ficheros

### Backend (`Laravel/`)
```
app/
├── Http/Controllers/Api/
│   ├── ContactMessageController.php   (store público)
│   └── Admin/MessageController.php     (listar, marcar, eliminar)
├── Mail/
│   └── ContactMessageMail.php          (Mailable)
├── Models/
│   └── ContactMessage.php
resources/views/emails/contact-message.blade.php
database/migrations/..._create_contact_messages_table.php
routes/api.php                          (añadir rutas)
```

### Frontend (`React/`)
```
src/
├── components/
│   └── sections/Contacto.jsx           (formulario)
├── hooks/
│   └── useContact.js                   (envío + estado)
└── styles/contact.css
```

## Pasos de implementación

1. **Tests primero** (backend): `php artisan test` para endpoint público, validaciones, honeypot, rate limit y endpoints admin.
2. **Migración** `contact_messages` + modelo `ContactMessage`.
3. **Endpoint público** `POST /api/contact/messages` con validación y honeypot.
4. **Rate limit** en la ruta.
5. **Mailable** + vista blade + try/catch para que el fallo de email no afecte al visitante.
6. **Endpoints admin** (listar / marcar leído / eliminar) con `auth:sanctum`.
7. **Tests** (frontend): formulario, estados de envío y error.
8. **Componente `Contacto`** + `useContact` + estilos.
9. **Integrar** la sección en la navegación.
10. **Configurar** `ADMIN_EMAIL` en `.env`.
11. **Validar** flujo completo (envío real, email, panel).

## Verificación

- `php artisan test` (backend) — todos pasan.
- `node --test` (frontend) — todos pasan.
- `npm run build` — sin errores.
- Prueba manual: enviar mensaje → aparece en BD → llega email → visible en admin → marcar leído → eliminar.

## Criterios de finalización del plan

- Tabla `contact_messages` creada.
- Endpoint público con validación y honeypot.
- Rate limit activo (3/5 min).
- Email de aviso funcionando sin romper el envío.
- Endpoints de administración protegidos.
- Formulario en el frontend con estados de éxito y error.
- Sección de mensajes en el panel de administración.
- Tests y build correctos.
