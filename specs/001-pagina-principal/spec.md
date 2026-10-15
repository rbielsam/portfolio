# Spec — Página principal

## Contexto y objetivo

El portfolio necesita una página principal que sirva como punto de entrada al sitio. Esta página debe presentar el perfil profesional de forma visual y permitir la navegación hacia las distintas secciones del portfolio (Formación, Experiencia, Proyectos, Login).

El objetivo de esta versión es establecer la estructura visual y el comportamiento de navegación de la página principal, con un diseño moderno y responsive. La carga real de datos desde la base de datos queda fuera de esta versión.

## Usuarios

- **Visitantes**: personas que acceden al portfolio para conocer el perfil profesional, formación, experiencia y proyectos del autor.

## Requisitos funcionales

### RF-1: Fondo con degradado azul marino

**QUÉ**: La página principal debe tener un fondo azul marino con degradado.
**POR QUÉ**: Establecer la identidad visual del portfolio desde el primer momento.

**Criterios de aceptación (EARS)**:
- **Cuando** se cargue la página principal, **el sistema deberá** mostrar un fondo azul marino con degradado en toda el área visible.
- **Mientras** el usuario interactúe con la página, **el sistema deberá** mantener el degradado de fondo sin cambios.

---

### RF-2: Título principal

**QUÉ**: La página debe mostrar el título "Portfolio" en la parte superior y, en la parte inferior, el año actual como pie de página.
**POR QUÉ**: Enmarcar el contenido arriba y cerrar la página abajo con la referencia temporal.

**Criterios de aceptación (EARS)**:
- **Cuando** se cargue la página principal, **el sistema deberá** mostrar un título con el texto "Portfolio" en la parte superior de la página.
- **Cuando** se cargue la página principal, **el sistema deberá** mostrar el año actual en la parte inferior de la página.
- **Si** el contenido de la página cambia, **el sistema deberá** mantener ambos títulos visibles.

> **Cambio aprobado:** inicialmente ambos títulos mostraban "Portfolio". Se acepta que el pie muestre el año.

---

### RF-3: Botones de navegación con efecto hover

**QUÉ**: La página debe mostrar cinco botones rectangulares en horizontal: Inicio, Formación, Experiencia, Proyectos, Login. Cada botón debe tener un efecto visual moderno al pasar el ratón por encima.
**POR QUÉ**: Proporcionar navegación clara y atractiva hacia las secciones del portfolio.

**Criterios de aceptación (EARS)**:
- **Cuando** se cargue la página principal, **el sistema deberá** mostrar cinco botones con los textos: "Inicio", "Formación", "Experiencia", "Proyectos", "Login".
- **Cuando** el usuario pase el ratón por encima de un botón, **el sistema deberá** aplicar un cambio de color o sombra acorde al color del botón, de forma limpia y suave.
- **Cuando** el ratón salga del área del botón, **el sistema deberá** restaurar el estado original del botón.

---

### RF-4: Zona de contenido dinámica

**QUÉ**: Al hacer clic en un botón, la zona de contenido debe actualizarse para mostrar la sección correspondiente, sustituyendo el contenido actual.
**POR QUÉ**: Permitir al usuario navegar entre secciones sin cambiar de página.

**Criterios de aceptación (EARS)**:
- **Cuando** el usuario haga clic en un botón de navegación, **el sistema deberá** actualizar la zona de contenido con la sección correspondiente.
- **Si** el contenido de una sección no está disponible, **el sistema deberá** mostrar un mensaje que indique el nombre de la sección y que está "en creación".
- **Cuando** se cargue la página por primera vez, **el sistema deberá** mostrar la sección "Inicio" por defecto.

---

### RF-5: Contenido de la sección Inicio

**QUÉ**: La sección Inicio debe mostrar un título con el texto "Portfolio" y un círculo que servirá como marco para una imagen de la persona del portfolio.
**POR QUÉ**: Presentar el portfolio de forma visual y preparar el espacio para la foto de perfil.

**Criterios de aceptación (EARS)**:
- **Cuando** se muestre la sección Inicio, **el sistema deberá** mostrar un título con el texto "Portfolio".
- **Cuando** se muestre la sección Inicio, **el sistema deberá** mostrar un círculo como marco de imagen.
- **Si** la imagen de perfil no está disponible, **el sistema deberá** mostrar el círculo vacío o con un placeholder.

---

### RF-6: Navegación responsive con botón flotante y panel deslizable

**QUÉ**: En pantallas pequeñas, la navegación debe adaptarse mediante un botón flotante que al hacer clic despliega un panel deslizable con los botones de navegación.
**POR QUÉ**: Garantizar una experiencia de navegación usable y moderna en dispositivos móviles.

**Criterios de aceptación (EARS)**:
- **Cuando** la página se visualice en una pantalla pequeña, **el sistema deberá** mostrar un botón flotante con el icono de rayas de menú (hamburguesa) en lugar de los botones en horizontal.
- **Cuando** el usuario toque el botón flotante, **el sistema deberá** desplegar un panel deslizable con los cinco botones de navegación.
- **Cuando** el usuario toque fuera del panel o seleccione una opción, **el sistema deberá** cerrar el panel deslizable.

---

## Requisitos no funcionales

- **Simplicidad**: la página debe ser clara y sin elementos innecesarios.
- **Responsive**: la página debe adaptarse correctamente a distintos tamaños de pantalla (escritorio, tablet, móvil).
- **Rendimiento**: las transiciones y efectos deben ser fluidos, sin bloqueos perceptibles.
- **Accesibilidad**: los botones deben ser navegables por teclado y tener contraste suficiente.

## Casos límite

- **Contenido no disponible**: si al hacer clic en un botón la sección no tiene datos cargados, la zona de contenido debe mostrar un estado vacío o un mensaje indicando que el contenido no está disponible.
- **Imagen de perfil ausente**: el círculo de la sección Inicio debe mostrarse vacío o con un placeholder si la imagen no está disponible.
- **Ventana redimensionada**: si el usuario cambia el tamaño de la ventana, la navegación debe adaptarse correctamente (de botones en horizontal a botón flotante y viceversa).

## Fuera de alcance

- La carga real de datos desde la base de datos.
- El contenido específico de las secciones Formación, Experiencia, Proyectos y Login.
- La funcionalidad de autenticación del botón Login.
- La imagen de perfil de la persona del portfolio.
- La base de datos y su estructura.

## Criterios de finalización

- La página principal muestra un fondo azul marino con degradado.
- Los títulos superior e inferior son visibles.
- Los cinco botones de navegación son visibles en horizontal en escritorio y tienen efecto hover.
- En pantallas pequeñas, la navegación funciona mediante botón flotante y panel deslizable.
- Al hacer clic en un botón, la zona de contenido se actualiza (aunque el contenido de las secciones no esté disponible).
- La sección Inicio muestra el título "Portfolio" y el círculo marco.
- La página es responsive y funciona en escritorio, tablet y móvil.

## Dudas abiertas

Todas las dudas iniciales han sido resueltas:

- **Efecto hover**: cambio de color o sombra acorde al color del botón, limpio y suave.
- **Títulos**: ambos muestran el texto "Portfolio".
- **Contenido no disponible**: mensaje con el nombre de la sección y "en creación".
- **Botón flotante**: icono de rayas de menú (hamburguesa).
