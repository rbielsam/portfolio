# Tareas — Formulario de contacto (Spec 004)

> Enfoque: tests primero, luego código. Backend: PHPUnit (`php artisan test`). Frontend: `node --test`.

## Fase 1: Base de datos

### T1.1: Crear migración y modelo `ContactMessage` ✅
Tabla `contact_messages` con `name`, `email`, `message`, `is_read`, timestamps. Modelo `ContactMessage`.

**Criterios de aceptación**:
- La migración crea la tabla `contact_messages` sin tocar la tabla `contact` existente.
- El modelo `ContactMessage` existe con los campos rellenables correctos.
- `is_read` es booleano con valor por defecto `false`.

---

### T1.2: Configurar `.env` ✅
Añadir `ADMIN_EMAIL` y `CONTACT_MESSAGE_MAX` al `.env`.

**Criterios de aceptación**:
- `ADMIN_EMAIL=<ADMIN_EMAIL>` está en `.env`.
- `CONTACT_MESSAGE_MAX=5000` está en `.env`.
- Las claves no aparecen en ningún fichero de código.

---

## Fase 2: Endpoint público

### T2.1: Tests del endpoint público ✅
Tests de envío: válido, validaciones, honeypot, rate limit.

**Criterios de aceptación**:
- Test de envío válido guarda el mensaje.
- Test de campos vacíos devuelve 422.
- Test de email inválido devuelve 422.
- Test de mensaje largo (más de `CONTACT_MESSAGE_MAX`) devuelve 422.
- Test de honeypot relleno no guarda nada.
- Test de rate limit devuelve 429 tras superar el límite.

---

### T2.2: Implementar `POST /api/contact/messages` ✅
Controlador público con validación, honeypot y rate limit.

**Criterios de aceptación**:
- Guarda nombre, email, mensaje y fecha.
- Aplica las reglas de validación de la spec.
- Descarta en silencio si el honeypot está relleno (200 sin guardar).
- Aplica el límite de 3 envíos por IP cada 5 minutos.

---

## Fase 3: Email de aviso

### T3.1: Crear Mailable y vista blade ✅
`ContactMessageMail` con los datos del mensaje y el email del administrador como destinatario.

**Criterios de aceptación**:
- El Mailable existe y recibe el mensaje.
- El destinatario sale de `ADMIN_EMAIL`.
- La vista blade existe y muestra los datos.

---

### T3.2: Enviar email sin romper el envío del visitante ✅
Enviar el aviso tras guardar, capturando el fallo de envío.

**Criterios de aceptación**:
- Si el email se envía correctamente, el visitante recibe confirmación.
- Si el email falla, el mensaje sigue guardado y el visitante no ve error.
- El fallo de email queda registrado en el log.

---

## Fase 4: Endpoints de administración

### T4.1: Tests de los endpoints de administración ✅
Tests de listar, marcar leído y eliminar mensajes, con y sin autenticación.

**Criterios de aceptación**:
- Sin autenticación, los endpoints devuelven 401.
- Con autenticación, listar devuelve los mensajes con nombre, email, contenido y fecha.
- Marcar como atendido cambia el estado.
- Eliminar retira el mensaje.

---

### T4.2: Implementar endpoints de administración ✅
Controlador protegido con listar, marcar leído y eliminar.

**Criterios de aceptación**:
- `GET /api/admin/messages` devuelve los mensajes.
- `PUT /api/admin/messages/{id}/read` marca el mensaje como atendido.
- `DELETE /api/admin/messages/{id}` elimina el mensaje.
- Todos requieren autenticación.

---

## Fase 5: Frontend

### T5.1: Tests del frontend ✅
Tests del formulario y del hook de envío.

**Criterios de aceptación**:
- El componente tiene los campos nombre, email y mensaje.
- El componente incluye el campo trampa (honeypot).
- El componente muestra confirmación tras el envío.
- El componente muestra error cuando el envío falla.

---

### T5.2: Crear `useContact` y componente `Contacto` ✅
Hook de envío y formulario con estados de envío, éxito y error.

**Criterios de aceptación**:
- El hook envía a `/api/contact/messages`.
- El formulario valida campos antes de enviar.
- Tras el envío correcto, muestra confirmación y limpia el formulario.
- Ante error, muestra un mensaje claro y permite reintentar.
- El honeypot está oculto visualmente.

---

### T5.3: Integrar la sección de contacto ✅
Añadir "Contacto" a la navegación y al mapeo de secciones.

**Criterios de aceptación**:
- El botón "Contacto" aparece en la navegación.
- La sección se muestra al seleccionarla.
- No se muestra para el administrador autenticado.

---

### T5.4: Sección de mensajes en el área de administración ✅
Vista para listar, marcar como atendido y eliminar mensajes.

**Criterios de aceptación**:
- La vista lista los mensajes con sus datos y fecha.
- Permite marcar como atendido y eliminar.
- Muestra un estado vacío cuando no hay mensajes.

---

### T5.5: Estilos del formulario y de los mensajes ✅
Estilos del formulario público y de la vista de administración.

**Criterios de aceptación**:
- El formulario es usable en escritorio y móvil.
- Los estados de éxito y error son visibles.

---

## Fase 6: Validación

### T6.1: Verificar flujo completo ✅
Comprobar envío, almacenamiento, email y gestión.

**Criterios de aceptación**:
- Un envío válido queda en la base de datos.
- El aviso por email se envía al `ADMIN_EMAIL`.
- El mensaje aparece en el panel y se puede marcar y eliminar.
- El rate limit bloquea el exceso de envíos.
- El honeypot descarta los envíos automatizados.

---

### T6.2: Tests finales y build ✅
Ejecutar toda la suite y el build.

**Criterios de aceptación**:
- `php artisan test` pasa.
- `node --test` pasa.
- `npm run build` no falla.

---

## Criterios de finalización

- Todas las tareas completadas.
- El formulario público funciona con validación y antispam.
- Los mensajes se guardan y se notifican por email.
- El administrador puede leer y gestionar los mensajes.
- Ningún dato personal se expone públicamente.
- Tests y build correctos.
