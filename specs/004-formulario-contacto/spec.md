# Spec — Formulario de contacto

## Contexto y objetivo

El portfolio permite contactar con el autor únicamente a través de formulario. El objetivo es recoger esos mensajes de forma fiable y segura, sin exponer los datos de contacto del administrador en el sitio público.

Los mensajes se guardan en la base de datos como fuente de verdad (para no perder ninguno) y, además, se envía un aviso por email al administrador. El administrador podrá leer y gestionar los mensajes desde el área de administración, ya existente.

## Usuarios

- **Visitante**: persona que rellena y envía el formulario de contacto.
- **Administrador**: persona autenticada que lee, responde y gestiona los mensajes recibidos.

## Requisitos funcionales

### RF-1: Formulario de contacto público

**QUÉ**: El portfolio debe ofrecer un formulario de contacto accesible sin autenticación.
**POR QUÉ**: Es el único canal de contacto, ya que los datos de contacto del administrador no se exponen públicamente.

**Criterios de aceptación (EARS)**:
- **Cuando** el visitante abra la sección de contacto, **el sistema deberá** mostrar un formulario con los campos nombre, email y mensaje.
- **Cuando** el visitante envíe el formulario con los campos correctamente rellenados, **el sistema deberá** registrar el mensaje y confirmar el envío en la propia sección.
- **Cuando** el mensaje se haya enviado correctamente, **el sistema deberá** limpiar el formulario para permitir un nuevo envío.
- **Cuando** el visitante esté autenticado como administrador, **el sistema no deberá** mostrar el formulario de contacto.

---

### RF-2: Validación de los datos del formulario

**QUÉ**: El sistema debe validar los datos introducidos antes de registrar el mensaje.
**POR QUÉ**: Evitar mensajes incompletos o inservibles.

**Criterios de aceptación (EARS)**:
- **Cuando** el visitante envíe el formulario con nombre, email o mensaje vacíos, **el sistema deberá** indicar qué campos son obligatorios.
- **Cuando** el visitante introduzca un email con formato inválido, **el sistema deberá** indicar que el email no es válido.
- **Cuando** el visitante introduzca un email válido, **el sistema deberá** tratarlo como válido.
- **Si** algún dato no cumple las reglas, **el sistema no deberá** registrar el mensaje.

---

### RF-3: Protección antispam

**QUÉ**: El formulario debe protegerse frente a envíos automatizados sin perjudicar a las personas.
**POR QUÉ**: Evitar que el buzón y la base de datos se llenen de spam.

**Criterios de aceptación (EARS)**:
- **Cuando** se muestre el formulario, **el sistema deberá** incluir un campo trampa invisible que una persona no rellena.
- **Cuando** el sistema detecte que el campo trampa ha sido rellenado, **el sistema deberá** descartar el envío sin registrar el mensaje ni mostrar un error al visitante.
- **Cuando** una misma dirección IP haya enviado más de 3 mensajes en 5 minutos, **el sistema deberá** rechazar el envío siguiente.
- **Cuando** el visitante supere el límite de envíos, **el sistema deberá** informar de que debe esperar antes de reintentar.

---

### RF-4: Registro del mensaje

**QUÉ**: Cada mensaje válido debe quedar registrado de forma permanente.
**POR QUÉ**: La base de datos es la fuente de verdad; ningún mensaje debe perderse aunque el email falle.

**Criterios de aceptación (EARS)**:
- **Cuando** el sistema acepte un envío, **el sistema deberá** registrar el nombre, el email y el mensaje junto con la fecha de recepción.
- **Cuando** el sistema registre un mensaje, **el sistema no deberá** exponerlo públicamente.
- **Cuando** el visitante consulte el contenido del sitio público, **el sistema no deberá** mostrar los mensajes recibidos ni los emails enviados.

---

### RF-5: Aviso por email al administrador

**QUÉ**: Al registrar un mensaje, el sistema debe avisar al administrador por email.
**POR QUÉ**: Permite enterarse del contacto sin tener que entrar al panel.

**Criterios de aceptación (EARS)**:
- **Cuando** el sistema registre un mensaje, **el sistema deberá** enviar un aviso por email al administrador.
- **Cuando** el email no pueda enviarse por un fallo del servicio de email, **el sistema no deberá** perder el mensaje ya registrado.
- **Cuando** el email se envíe correctamente, **el sistema no deberá** mostrar datos del administrador al visitante.
- **Cuando** el visitante haya enviado el formulario, **el sistema no deberá** mostrar la dirección de email del administrador como resultado del envío.

---

### RF-6: Lectura y gestión de mensajes en el área de administración

**QUÉ**: El administrador autenticado debe poder leer y gestionar los mensajes recibidos.
**POR QUÉ**: Sin esto, los mensajes guardados quedarían inaccesibles.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador abra la sección de mensajes del área de administración, **el sistema deberá** mostrar los mensajes recibidos.
- **Cuando** el sistema muestre los mensajes, **el sistema deberá** mostrar nombre, email, contenido y fecha de cada uno.
- **Cuando** el administrador marque un mensaje como atendido, **el sistema deberá** reflejar ese estado.
- **Cuando** el administrador elimine un mensaje, **el sistema deberá** retirarlo de la lista.
- **Cuando** un visitante no autenticado intente acceder a los mensajes, **el sistema deberá** denegar el acceso.

---

## Requisitos no funcionales

- **Privacidad**: los datos de contacto del administrador no deben exponerse públicamente en ningún caso.
- **Privacidad de los visitantes**: los datos de quien escribe no deben mostrarse a otros visitantes, solo al administrador.
- **Confiabilidad**: un mensaje enviado debe quedar registrado aunque el envío de email falle.
- **Usabilidad**: el formulario debe ser fácil de usar también en móviles y accesible por teclado.
- **Seguridad**: el endpoint de envío no debe quedar disponible sin validación ni límite de peticiones.

## Casos límite

- **Email caído**: el mensaje se guarda y el aviso no se envía; el visitante no debe ver un error.
- **Envíos masivos desde la misma IP**: se bloquea temporalmente sin bloquear a otros visitantes legítimos.
- **Mensaje muy largo**: el sistema debe rechazarlo con un aviso claro, no truncarlo en silencio.
- **Mensajes con caracteres especiales o saltos de línea**: deben conservarse sin romper la visualización.
- **Administrador con muchos mensajes**: la lista debe seguir siendo usable.
- **Doble clic en enviar**: no debe crear dos mensajes idénticos.

## Fuera de alcance

- Respuestas al visitante desde el sistema (se responde por email).
- Adjuntos o subida de ficheros.
- Confirmación de lectura por parte del visitante (leer/gestionar).
- Captcha de terceros (reCAPTCHA, hCaptcha).
- Exportación de mensajes, respuestas automáticas yAntiabuso avanzado por IP.

## Criterios de finalización

- El formulario de contacto es accesible públicamente y no aparece para el administrador.
- Los mensajes se registran en la base de datos con nombre, email, contenido y fecha.
- La validación de campos funciona y muestra mensajes claros.
- La protección antispam filtra bots y limita el exceso de envíos.
- Se envía aviso por email y el fallo de email no pierde el mensaje.
- El administrador puede ver, marcar como atendido y eliminar mensajes.
- Ningún dato del administrador ni de los visitantes se expone públicamente.
- Las pruebas definidas pasan.

## Dudas resueltas

- **Email destino de los avisos**: `<ADMIN_EMAIL>`, configurado en `.env` (nunca en código).
- **Longitud máxima del mensaje**: 5000 caracteres.
- **Varios administradores**: fuera de esta spec; el aviso va a una única dirección configurable.
