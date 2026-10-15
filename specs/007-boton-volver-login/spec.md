# Spec — Botón de volver en la pantalla de Login

## Contexto y objetivo

La sección de Login se muestra sin ningún menú de navegación visible: en escritorio no aparecen los botones de sección y en móvil tampoco aparece el botón flotante del menú. Quien entra en Login sin iniciar sesión, por tanto, no tiene forma de volver al inicio salvo recargando la página o usando los controles del navegador.

El objetivo es añadir un botón con forma de flecha hacia atrás en la esquina superior izquierda de la pantalla de Login que, al hacer clic, devuelva a la sección Inicio.

## Usuarios

- **Visitante**: persona que accede al portfolio y abre la sección Login sin haber iniciado sesión.

## Requisitos funcionales

### RF-1: Botón de volver en la esquina superior izquierda de Login

**QUÉ**: La pantalla de Login debe mostrar, en la esquina superior izquierda del área de contenido, un botón con un icono de flecha hacia atrás.
**POR QUÉ**: Dar salida clara a la sección Login, que hoy no tiene ninguna navegación visible.

**Criterios de aceptación (EARS)**:
- **Cuando** el visitante acceda a la sección Login, **el sistema deberá** mostrar un botón con un icono de flecha hacia atrás en la esquina superior izquierda.
- **Cuando** la pantalla sea de escritorio, **el sistema deberá** mostrar el botón igualmente.
- **Cuando** la pantalla sea pequeña (móvil o tablet), **el sistema deberá** mostrar el botón igualmente.
- **Cuando** se muestre la sección Login, **el botón no deberá** solaparse con el título "Iniciar sesión" ni con los campos del formulario.
- **Si** el visitante ya ha iniciado sesión, **el sistema no deberá** mostrar la pantalla de Login ni el botón de volver (se muestra el área de administración).

---

### RF-2: El clic devuelve a Inicio

**QUÉ**: Al hacer clic en el botón, la aplicación debe mostrar la sección Inicio.
**POR QUÉ**: El usuario espera que la flecha hacia atrás le lleve al punto de entrada del portfolio.

**Criterios de aceptación (EARS)**:
- **Cuando** el visitante haga clic en el botón de volver, **el sistema deberá** mostrar la sección Inicio.
- **Cuando** el visitante active el botón con el teclado, **el sistema deberá** mostrar la sección Inicio.
- **Cuando** el visitante haga clic en el botón teniendo el formulario relleno, **el sistema no deberá** enviar el formulario ni alterar la sesión.
- **Cuando** el visitante vuelva a entrar en Login, **el sistema deberá** mostrar el formulario de inicio de sesión vacío y en su estado inicial.

---

### RF-3: Accesibilidad del botón

**QUÉ**: El botón, aunque solo muestre un icono, debe ser comprensible y utilizable por todas las personas.
**POR QUÉ**: Un icono suelto sin nombre accesible es inutilizable con lector de pantalla y difícil de detectar para algunas personas.

**Criterios de aceptación (EARS)**:
- **Cuando** un lector de pantalla enfoque el botón, **el sistema deberá** anunciar su función (volver al inicio).
- **Cuando** el visitante navegue por teclado, **el sistema deberá** permitir alcanzar el botón y activarlo.
- **Cuando** el botón reciba el foco, **el sistema deberá** mostrar un indicador de foco visible.
- **Cuando** el botón esté enfocado, **el sistema no deberá** desactivar el desplazamiento ni ningún otro control.

---

### RF-4: Respuesta visual del botón

**QUÉ**: El botón debe integrarse en el estilo del portfolio y ofrecer feedback al interactuar con él.
**POR QUÉ**: Que se perciba como un control interactivo y no como parte decorativa del fondo.

**Criterios de aceptación (EARS)**:
- **Cuando** el visitante pase el ratón por encima del botón, **el sistema deberá** mostrar un cambio visual sutil (color o sombra) acorde a la paleta del sitio.
- **Cuando** el ratón salga del área del botón, **el sistema deberá** restaurar el estado original.
- **Cuando** el botón esté visible, **el icono deberá** tener contraste suficiente sobre el fondo azul marino.

---

## Requisitos no funcionales

- **Simplicidad**: el botón es un único control sin estados complejos; no debe añadir dependencias.
- **Consistencia**: usa la paleta y los efectos ya existentes del portfolio (azul marino y azules de acento).
- **Responsive**: la posición debe mantenerse en la esquina superior izquierda en cualquier tamaño de pantalla, sin provocar scroll horizontal.
- **Accesibilidad**: navegación por teclado, foco visible y nombre accesible.
- **Rendimiento**: el cambio a Inicio debe ser inmediato, sin parpadeos ni estados intermedios perceptibles.

## Casos límite

- **Visita directa a Login**: el botón debe estar visible también cuando se aterriza en Login sin haber pasado por otras secciones.
- **Clics repetidos rápidos**: el resultado final debe ser la sección Inicio, sin errores ni estados inconsistentes.
- **Sesión iniciada**: si la persona tiene sesión iniciada, no ve la pantalla de Login (ve el área de administración, que ya dispone de su propia salida "Ver portfolio"); el botón no aplica.
- **Pantalla muy pequeña**: el botón no debe pisar el título "Iniciar sesión" ni el primer campo del formulario.
- **Ratón deshabilitado / solo táctil**: el botón debe funcionar con clic y con toque.

## Fuera de alcance

- Modificar la navegación del área de administración (ya existe "Ver portfolio").
- Integración con el historial del navegador (el botón "atrás" del navegador no se toca; la navegación por secciones no usa direcciones URL).
- Añadir el menú de navegación completo a la pantalla de Login.
- Cambiar el comportamiento del login, la autenticación o los permisos.

## Criterios de finalización

- La pantalla de Login muestra el botón de flecha hacia atrás en la esquina superior izquierda en escritorio, tablet y móvil.
- El clic (y la tecla Enter con el botón enfocado) lleva a la sección Inicio.
- El botón tiene nombre accesible, foco visible y feedback al pasar el ratón.
- El formulario de Login no se envía ni se altera al usar el botón.
- Las secciones públicas y el área de administración quedan sin cambios.
- Las pruebas definidas en el plan pasan.

## Dudas resueltas

- **Ubicación**: solo en la pantalla de Login.
- **Pantallas**: visible en todas (escritorio, tablet y móvil).
- **Apariencia**: solo el icono de flecha, con nombre accesible "Volver al inicio".
- **Destino**: siempre la sección Inicio, no la sección anterior del historial.
