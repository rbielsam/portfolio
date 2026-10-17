# Spec — Puesta en línea del portfolio en AWS

## Contexto y objetivo

El portfolio funciona íntegro en local (React en `localhost:5173`, Laravel en `127.0.0.1:8000`, MySQL en la misma máquina), con contenido real: perfil, una formación, una experiencia, dos usuarios y un mensaje de contacto. **Nadie de fuera de esta máquina puede verlo.**

No existe nada de despliegue: sin Docker, sin integración continua, sin fichero de publicación, sin servidor. La decisión de dónde alojarlo lleva abierta desde hace semanas.

Se parte de una **cuenta gratuita de AWS** y se eligió la arquitectura **EC2 + RDS + S3**, con las fotos movidas a S3 y CloudFront **en una spec aparte (018)**: esta 017 solo pone el sitio en línea con las fotos en el disco del servidor, que es como funciona hoy.

**Objetivo**: que el portfolio esté publicado en internet bajo un dominio propio, con los datos reales, el panel de administración operativo y un procedimiento escrito para publicar futuras modificaciones.

### Observación que simplifica el despliegue

La aplicación importa React Router pero **no lo usa**: no hay `<Routes>`, ni `<Link>`, ni `useNavigate`; la navegación es por estado. Como no existen URLs internas de la aplicación, **no hace falta un enrutado de respaldo** para rutas profundas: basta con que `/` entregue la app.

## Usuarios

- **Visitante**: persona que accede al portfolio desde internet con el enlace público.
- **Persona administradora**: quien inicia sesión para gestionar el contenido.
- **Persona responsable del proyecto**: quien publica modificaciones y mantiene el servidor.

## Requisitos funcionales

### RF-1: El sitio es público y está cifrado

**QUÉ**: La web debe responder en internet bajo el dominio contratado, con conexión cifrada.
**POR QUÉ**: Hoy no es accesible desde fuera; sin HTTPS los navegadores advierten de «sitio no seguro» y el panel enviaría la sesión en claro.

**Criterios de aceptación (EARS)**:
- **Cuando** alguien acceda al dominio desde cualquier navegador, **el sistema deberá** mostrar la página pública.
- **Cuando** se cargue la página, **la conexión deberá** ser HTTPS sin ningún aviso de sitio inseguro.
- **Cuando** se acceda por HTTP, **el sistema deberá** redirigir a HTTPS.
- **Cuando** el certificado llegue a su fecha de caducidad, **el sistema deberá** renovarlo sin intervención manual.

---

### RF-2: La aplicación funciona completa en el dominio propio

**QUÉ**: Tanto la parte pública como el panel de administración deben funcionar en el dominio, sin ninguna referencia a `localhost`.
**POR QUÉ**: La sesión usa cookies de Sanctum. Si la aplicación y la API no comparten dominio, el login deja de funcionar; por eso el diseño es **un solo dominio para todo**.

**Criterios de aceptación (EARS)**:
- **Cuando** una persona administradora inicie sesión en el dominio público, **el sistema deberá** abrir el panel.
- **Cuando** se abra cualquiera de las seis vistas del panel, **el sistema deberá** mostrar sus datos.
- **Cuando** se cambie de idioma, **la preferencia deberá** persistir igual que hoy.
- **Cuando** se navegue con teclado, **el selector de idioma deberá** seguir comportándose como hoy.
- **Cuando** la sesión esté activa, **no deberá** caducar de forma inesperada.

---

### RF-3: Los datos existentes se conservan

**QUÉ**: El contenido real —perfil, formación, experiencia, usuarios y mensajes— debe estar en la base de datos del servidor, idéntico al de origen.
**POR QUÉ**: El portfolio se publica con contenido real. Reproceso a mano implica perder datos, y dejar fuera un registro rompe la web pública.

**Criterios de aceptación (EARS)**:
- **Cuando** termine la puesta en marcha, **el sistema deberá** mostrar el mismo contenido que hoy.
- **Cuando** se cuenten los registros, **deberán** coincidir con los de origen.
- **Cuando** la persona administradora use sus credenciales de origen, **el sistema deberá** aceptarlas.
- **Cuando** se migren los datos, **no deberá** incorporarse ningún registro de prueba (usuarios, mensajes o contenido inventados).

---

### RF-4: La foto de perfil se ve

**QUÉ**: La foto de perfil debe mostrarse tanto en la página pública como en el panel.
**POR QUÉ**: Es la identidad pública del sitio y ya está subida. Si no se migra, la web sale con la imagen rota desde el primer día.

**Criterios de aceptación (EARS)**:
- **Cuando** se cargue la página pública, **la foto deberá** mostrarse, sin aviso de imagen no disponible.
- **Cuando** se abra el panel, **la foto de perfil deberá** mostrarse.
- **Cuando** se produzca un error al servir la foto, **el sistema deberá** degradarse como hoy, sin romper la vista.

> **Nota de alcance**: en esta spec las fotos siguen en el disco del servidor. **Subirlas a S3 y servirlas desde CloudFront es la spec 018.**

---

### RF-5: El formulario de contacto llega de verdad

**QUÉ**: Un mensaje enviado por un visitante debe llegar al correo de la persona responsable, enviándose desde el dominio propio.
**POR QUÉ**: Hoy el remitente es `onboarding@resend.dev`, que solo llega a la propia cuenta de Resend. Sin verificar el dominio, el formulario no sirve para que nadie contacte — y es el objetivo principal de un portfolio.

**Criterios de aceptación (EARS)**:
- **Cuando** un visitante envíe el formulario, **la persona responsable deberá** recibir el correo.
- **Cuando** se envíe, **la dirección remitente deberá** pertenecer al dominio propio.
- **Cuando** se verifique el dominio, **el sistema deberá** superar la autenticación de correo (DKIM y SPF).
- **Cuando** el visitante envíe el formulario, **los mensajes de éxito y de error** deberán seguir siendo los ya traducidos.

---

### RF-6: Hay copias de seguridad automáticas

**QUÉ**: La base de datos debe respaldarse de forma automática y periódica, en un sitio distinto de la máquina donde corre la aplicación.
**POR QUÉ**: La base de datos contiene todo el contenido y los mensajes de contacto. Un fallo del servidor sin copia es pérdida definitiva, y guardar la copia en la misma máquina no protege de nada si esa máquina falla.

**Criterios de aceptación (EARS)**:
- **Cuando** esté en marcha, **deberá** existir una copia automática de la base de datos con periodicidad definida.
- **Cuando** se guarde una copia, **no deberá** quedarse en la máquina de la aplicación.
- **Cuando** se necesite, **una copia deberá** poder restaurarse siguiendo un procedimiento escrito.
- **Cuando** el espacio de copias se llene, **el sistema deberá** conservar las más recientes y descartar las antiguas.

---

### RF-7: Publicar una modificación es reproducible

**QUÉ**: Debe existir un procedimiento escrito para publicar una modificación en el servidor.
**POR QUÉ**: Si el despliegue solo existe en la cabeza de quien lo hizo, el proyecto queda inmantenible: nadie más podría actualizarlo, ni la misma persona dentro de unos meses.

**Criterios de aceptación (EARS)**:
- **Cuando** haya una modificación, **el procedimiento deberá** permitir publicarla siguiendo los pasos escritos.
- **Cuando** se publique, **no deberá** requerir herramientas que no estén descritas en el procedimiento.
- **Cuando** la modificación incluya cambios de base de datos, **el procedimiento deberá** indicar cómo aplicarlos.
- **Cuando** se publique, **el sitio no deberá** dejar de estar disponible más de lo previsto.

---

### RF-8: Los secretos no se exponen

**QUÉ**: Las credenciales y claves de producción no deben estar en el repositorio ni llegar al navegador.
**POR QUÉ**: La configuración actual usa `APP_DEBUG=true` y `APP_ENV=local`. En producción, el modo de depuración hace que un error muestre una traza con valores de entorno — base de datos, claves de API y todo lo que haya configurado. Es la vía de entrada más común.

**Criterios de aceptación (EARS)**:
- **Cuando** se publique el proyecto, **no deberá** contener claves ni contraseñas.
- **Cuando** el sitio esté en producción, **el modo de depuración deberá** estar desactivado.
- **Cuando** falle algo, **la respuesta no deberá** incluir trazas ni valores de entorno.
- **Cuando** el navegador cargue la web, **no deberá** recibir credenciales de servidor.
- **Cuando** la aplicación acceda a la base de datos, **los accesos deberán** limitarse a la máquina que lo necesita.

---

## Requisitos no funcionales

- **Simplicidad**: sin orquestación ni integración continua en esta fase. El despliegue es manual y documentado. Cualquier pieza que no sea imprescindible no se monta.
- **Seguridad**: HTTPS, panel únicamente con sesión válida, secretos fuera del repositorio, depuración desactivada, base de datos accesible solo desde donde procede.
- **Coste**: usar únicamente lo necesario y en la mínima medida. Quedará **documentado qué cuesta el despliegue cuando termine el periodo gratuito**, para que no haya sorpresas.
- **Rendimiento**: la web debe cargar con normalidad desde España; no se pide nada más.
- **Mantenibilidad**: todo el procedimiento queda escrito. No debe quedar ningún paso que solo exista en la conversación.
- **Disponibilidad**: razonable para un portfolio personal. **No** se pide alta disponibilidad ni redundancia, que costaría dinero sin justificación.

## Casos límite

- **Termina el periodo gratuito**: a los doce meses los servicios empiezan a facturarse. Debe quedar documentado el coste resultante y cómo se revisa.
- **El dominio todavía no está comprado**: el orden importa; hay un paso que depende de que el dominio exista, y otro (el correo) que depende de que esté verificado.
- **El correo llega a spam**: si la verificación de dominio no se hace, los mensajes se envían igual pero acaban en la carpeta de correo no deseado.
- **El contenido cambia durante la migración**: si alguien edita el panel local mientras se copian los datos, se pierde. La migración debe hacerse en un momento en que no haya ediciones, o repetirse.
- **La base de datos tiene más tablas de las visibles**: además de contenido, hay sesiones, caché, cola y trabajos fallidos; una migración incompleta dejaría a las personas administradoras sin sesión.
- **Una actualización incluye migraciones**: publicar código nuevo sin aplicar la migración correspondiente deja la aplicación rota.
- **Hay que restaurar una copia**: una copia que nunca se ha probado no es una copia; el procedimiento de restauración debe probarse.
- **El servidor deja de responder**: sin acceso gráfico, la recuperación pasa por los controles de la plataforma; conviene saberlo antes de necesitarlo.

## Fuera de alcance

- **Subir las fotos a S3 y servirlas desde CloudFront**: es la spec 018, con sus propios tests.
- Integración continua y despliegue automático: el despliegue de esta spec es manual.
- Alta disponibilidad, múltiples regiones o balanceadores.
- Sistema de monitorización y alertas.
- Cambios en el código de la aplicación, salvo los imprescindibles para publicarla.
- Retirar la dependencia de React Router, que no se usa: se anota como observación, no se toca.
- Alojar en otro proveedor distinto de AWS.

## Criterios de finalización

- El sitio responde en internet bajo el dominio propio y con HTTPS, sin avisos de inseguridad.
- El panel de administración permite iniciar sesión y gestionar las seis vistas.
- Los datos publicados coinciden con los de origen, sin registros de prueba.
- La foto de perfil se ve en la página pública y en el panel.
- Un mensaje enviado desde el formulario llega al correo de la persona responsable.
- Existe una copia automática de la base de datos **fuera** de la máquina, y se ha comprobado que puede restaurarse.
- El procedimiento de publicación está escrito y permite actualizar el sitio siguiéndolo.
- La depuración está desactivada y no hay secretos en el repositorio.
- El coste del despliegue, incluido el de después del periodo gratuito, queda documentado.

## Dudas resueltas

- **Plataforma**: AWS, aprovechando la cuenta gratuita existente (decisión de la persona usuaria).
- **Arquitectura**: EC2 + RDS + S3, descartada la opción de dejarlo todo en una sola máquina (decisión de la persona usuaria).
- **Papel de S3 en esta spec**: solo para copias de seguridad de la base de datos. Las fotos pasan a S3 con CloudFront en la spec 018 (decisión de la persona usuaria).
- **Estructura**: dos specs — primero ponerlo en línea, después las fotos — para que si la migración de fotos se retrasa el sitio siga funcionando (decisión de la persona usuaria).
- **Nada estaba contratado**: esta spec incluye contratar también el dominio (decisión de la persona usuaria).
- **Sistema operativo y servidor web**: Ubuntu con nginx (ampliado desde Apache, ver D0 abajo), que era la pregunta que planteó la persona usuaria.
- **Nombre del dominio**: **`rbielsam.com`**, con el criterio de ser lo más económico posible y sin publicidad (decisión de la persona usuaria). No existe un `.com` gratuito legítimo; las opciones reales son una promoción de primer año (más barato el año uno, más caro después) o un registrador al costo de unos 10 – 11 $/año. **Los precios concretos se comprueban al contratar**: no se fijan aquí porque cambian a menudo. Se recomienda registrar **fuera de AWS**, que es más barato y el registrador trae el DNS incluido, evitando pagar una zona de Route 53.

## Dudas abiertas

- **[NECESITA ACLARACIÓN] Quién verificará el dominio en el servicio de correo**: hace falta acceso a quien gestione los registros DNS del dominio. Si la persona usuaria registra el dominio ella misma, tiene ese acceso y el paso se resuelve solo; si lo registra otra persona, hay que pedirle que añada los registros que indique el servicio de correo.
