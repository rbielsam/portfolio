# Spec — Indicador de sesión en la navegación pública y acceso directo al panel

## Contexto y objetivo

Hoy, una vez autenticado, la navegación pública sigue mostrando el botón "Login" exactamente igual que cuando no hay sesión. No hay ninguna señal visible de que la persona esté dentro: para comprobarlo tiene que pulsar "Login" y comprobar que aparece el área de administración.

Además, al iniciar sesión correctamente el formulario redirige a la sección Inicio (`App.jsx`, `onSuccess` → `setActiveSection('Inicio')`), de modo que la persona se autentica y aterriza en la portada pública pareciendo que no haya hecho nada.

El objetivo es doble:

1. Sustituir el botón "Login" de la navegación por el **nombre del usuario acompañado de su imagen de perfil** cuando haya sesión iniciada, de forma que se vea claramente que se está autenticado.
2. Que **al iniciar sesión se acceda directamente al panel de administración**, sin pasar por Inicio.

## Usuarios

- **Visitante autenticado**: persona con sesión iniciada que navega por las secciones públicas del portfolio.
- **Visitante anónimo**: persona sin sesión; su experiencia no debe cambiar.

## Requisitos funcionales

### RF-1: El botón "Login" se sustituye por el identificador de sesión

**QUÉ**: Cuando exista sesión iniciada, la navegación pública debe mostrar en la posición del botón "Login" un control con el nombre del usuario y su imagen, en lugar de la etiqueta "Login".
**POR QUÉ**: Con sesión iniciada no hay hoy ninguna señal de autenticación en la navegación; el visitante parece estar siempre deslogueado.

**Criterios de aceptación (EARS)**:
- **Cuando** haya sesión iniciada, **el sistema deberá** mostrar el nombre del usuario en la navegación en lugar de la etiqueta "Login".
- **Cuando** haya sesión iniciada, **el sistema deberá** mostrar la imagen de perfil junto al nombre dentro de ese mismo control.
- **Cuando** no haya sesión iniciada, **el sistema deberá** mostrar la etiqueta "Login" exactamente como hasta ahora.
- **Cuando** la persona recargue la página con la sesión viva, **el sistema deberá** mostrar el identificador sin necesidad de ninguna interacción previa.
- **Cuando** se muestre la navegación en escritorio, **el sistema deberá** mostrar el identificador en la última posición de la navegación (donde hoy está "Login").
- **Cuando** la pantalla sea móvil, **el sistema deberá** mostrar el identificador también dentro del menú desplegable, con el mismo aspecto y el mismo texto.

---

### RF-2: Imagen de perfil con respaldo de iniciales

**QUÉ**: El control debe mostrar la foto del perfil (`profile.photo`) cuando exista; si no existe o no puede cargarse, debe mostrar las iniciales del nombre. El texto del control será siempre `user.name`.
**POR QUÉ**: No existe un campo de foto por usuario en `users`; la única imagen del proyecto es la del perfil público. El control no puede quedar vacío ni con un icono roto.

**Criterios de aceptación (EARS)**:
- **Cuando** el perfil tenga una foto, **el sistema deberá** mostrar esa imagen.
- **Cuando** el perfil no tenga foto, **el sistema deberá** mostrar las iniciales de `user.name`.
- **Cuando** la imagen exista pero falle su carga, **el sistema deberá** mostrar las iniciales en lugar de una imagen rota.
- **Cuando** haya sesión iniciada, **el texto del control deberá** ser `user.name` y no el correo electrónico.
- **Si** `user.name` viniera vacío, **el sistema deberá** mostrar un respaldo legible en lugar de un control vacío.

---

### RF-3: El clic en el identificador lleva al panel de administración

**QUÉ**: Al activar el control con sesión iniciada, la aplicación debe mostrar el área de administración.
**POR QUÉ**: El botón "Login" ya cumplía esa función; el cambio es de apariencia, no de destino.

**Criterios de aceptación (EARS)**:
- **Cuando** la persona haga clic en el identificador con sesión iniciada, **el sistema deberá** mostrar el panel de administración.
- **Cuando** la persona active el control con el teclado (Enter o Espacio), **el sistema deberá** mostrar el panel de administración.
- **Cuando** no haya sesión y se pulse la navegación, **el sistema deberá** mostrar la pantalla de Login, como hasta ahora.
- **Cuando** se active el control, **el sistema no deberá** cerrar la sesión ni modificar ningún dato.
- **Cuando** la persona salga del panel con "Ver portfolio", **el sistema deberá** mostrar la sección Inicio con el identificador de sesión visible.

---

### RF-4: Al iniciar sesión se accede directamente al panel

**QUÉ**: Tras autenticarse con éxito desde el formulario, la aplicación debe mostrar el panel de administración en lugar de la sección Inicio.
**POR QUÉ**: Es el cambio solicitado; hoy queda en Inicio y no se percibe que el acceso haya tenido éxito.

**Criterios de aceptación (EARS)**:
- **Cuando** el inicio de sesión sea correcto, **el sistema deberá** mostrar el panel de administración directamente.
- **Cuando** el inicio de sesión falle, **el sistema deberá** permanecer en el formulario mostrando el mensaje de error, sin cambiar de sección.
- **Cuando** se muestre el panel tras el acceso, **el sistema no deberá** pasar por la sección Inicio de forma intermedia ni parpadear el contenido público.
- **Cuando** la persona cierre la sesión desde el panel, **el sistema deberá** mostrar la navegación pública con la etiqueta "Login".
- **Cuando** haya sesión iniciada y la persona acceda a una sección pública, **el sistema deberá** mostrar el identificador del RF-1.

---

### RF-5: Accesibilidad y respuesta visual del identificador

**QUÉ**: El control debe ser comprensible y utilizable con teclado y lector de pantalla, y debe integrarse en la paleta existente.
**POR QUÉ**: Sustituye a un botón de navegación; no puede ser un simple texto decorativo.

**Criterios de aceptación (EARS)**:
- **Cuando** un lector de pantalla enfoque el control, **el sistema deberá** anunciar que abre el panel de administración e incluir el nombre de la persona.
- **Cuando** la persona navegue por teclado, **el sistema deberá** permitir alcanzar el control y activarlo en el mismo orden que el resto de botones.
- **Cuando** el control reciba el foco, **el sistema deberá** mostrar un indicador de foco visible.
- **Cuando** se pase el ratón por encima, **el sistema deberá** mostrar un cambio visual sutil acorde a la paleta del sitio.
- **Cuando** el control esté visible, **el nombre y la imagen deberán** tener contraste suficiente sobre el fondo de la navegación.

## Requisitos no funcionales

- **Simplicidad**: sin dependencias nuevas ni componentes de terceros; se reutiliza el componente de navegación existente.
- **Consistencia**: se usan la paleta, la tipografía y los estados de foco ya presentes en la navegación.
- **Responsive**: el control aparece en escritorio y en el menú desplegable móvil con el mismo contenido.
- **Accesibilidad**: nombre accesible, foco visible, orden de tabulación conservado.
- **Rendimiento**: el control no debe provocar parpadeos al cambiar de sección ni peticiones redundantes por cada navegación.
- **Separación de responsabilidades**: la navegación sigue leyendo el estado de sesión del contexto de autenticación; no accede a datos por su cuenta.

## Casos límite

- **Sesión iniciada sin foto de perfil**: se muestran las iniciales.
- **Foto borrada mientras la sesión está abierta**: se muestra el respaldo de iniciales, sin dejar un hueco.
- **Sesión caducada**: al recargar, la comprobación de sesión devuelve que no hay usuario y la navegación vuelve a mostrar "Login".
- **Carga inicial**: mientras la aplicación comprueba la sesión se muestra el indicador de carga existente; no se debe mostrar un instante la etiqueta "Login" con sesión iniciada.
- **Clics repetidos rápidos**: el resultado final es el panel de administración, sin estados inconsistentes.
- **Usuario con permisos de lectura**: ve el identificador y puede entrar al panel; el panel ya oculta los controles que no le corresponden.
- **Nombre con caracteres especiales o muy largo**: el texto no debe romper la navegación ni provocar scroll horizontal.
- **Fallo de red al cargar la foto**: se recurre a las iniciales.

## Fuera de alcance

- Estética, paleta y comportamiento responsive del área de administración (spec **009**, reservada).
- Añadir un menú desplegable con "Cerrar sesión" o "Perfil" desde la navegación pública.
- Crear un campo de foto por usuario en la tabla `users` (cambio de estructura de datos).
- Cambiar el correo que muestra el panel lateral por el nombre.
- Integración con el historial del navegador o con direcciones URL: la navegación por secciones no usa rutas.
- Modificar la autenticación, los roles o los permisos.
- Modificar la pantalla de Login más allá del destino del envío con éxito.

## Criterios de finalización

- Con sesión iniciada, la navegación pública muestra el nombre del usuario y su foto (o iniciales) donde antes decía "Login", en escritorio y en móvil.
- Sin sesión, la navegación sigue mostrando "Login" con el mismo aspecto que ahora.
- Pulsar el identificador abre el panel de administración.
- Tras iniciar sesión correctamente se aterriza directamente en el panel, sin pasar por Inicio.
- Un fallo de autenticación sigue mostrando el error en el formulario sin cambiar de sección.
- El control tiene nombre accesible, foco visible y contraste suficiente.
- Las secciones públicas, el área de administración y los permisos quedan sin cambios de comportamiento.
- Las pruebas definidas en el plan pasan.

## Dudas resueltas

- **Número de spec**: es la **010**; la 009 queda reservada para estética y responsive del panel de administración.
- **Imagen**: se usa `profile.photo` con las iniciales de `user.name` como respaldo. No se crea campo de foto por usuario.
- **Texto**: `user.name`, no `user.email`.
- **Al hacer clic**: lleva al panel de administración. No se añade menú desplegable.
- **Destino tras el login**: el panel de administración, no la sección Inicio.
