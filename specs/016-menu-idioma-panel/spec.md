# Spec — El menú de idiomas del panel se ve entero

## Contexto y objetivo

La spec 015 añadió el selector de idioma (español, catalán e inglés) a dos sitios del área de administración: la barra lateral de escritorio y la barra superior de móvil. En móvil y en la cabecera pública funciona bien. En la barra lateral de escritorio **no**.

Medido con la barra lateral de 200px y la ventana a 1600×900:

| Emplazamiento | Posición del botón | Posición del menú | Parte visible |
|---|---|---|---|
| Cabecera pública | `x ≈ 750` | `x ≈ 634 … 794` | 160 de 160px |
| **Barra lateral del panel** | `x = 16` | **`x = −106 … 54`** | **54 de 160px** |
| Barra superior del panel (375px) | `x = 188` | `x = 66 … 226` | 160 de 160px |

El menú se ancla al borde derecho del botón y crece hacia la izquierda. En la cabecera eso es inocuo porque el botón está centrado y hay sitio a su izquierda; en la barra lateral el botón está pegado al borde izquierdo de la ventana, así que **dos tercios del menú se salen de la pantalla**. Consecuencias visibles:

- Se ve una caja oscura de 54px con el texto de las opciones cortado por la mitad («…fi», «…mación»).
- El centro de las tres opciones queda **fuera** del área visible de la ventana, así que ninguna se puede pulsar: en escritorio **no se puede cambiar el idioma desde el panel**.
- La caja tapa los botones «Perfil» y «Formación» del menú del panel.

El objetivo es que el menú desplegado se vea entero, legible y utilizable desde la barra lateral del panel, sin tocar los dos emplazamientos que hoy funcionan.

## Usuarios

- **Persona administradora**: tiene sesión iniciada y usa el panel en una pantalla de escritorio (más de 768px de ancho).

## Requisitos funcionales

### RF-1: El menú desplegado se ve entero

**QUÉ**: Cuando se abra el selector de idioma desde la barra lateral del panel, el menú con las tres opciones debe mostrarse completo dentro del área visible de la ventana.
**POR QUÉ**: Hoy solo se ve un tercio del menú, con las etiquetas cortadas, y no se distingue qué opción es cada una.

**Criterios de aceptación (EARS)**:
- **Cuando** la persona administradora abra el selector desde la barra lateral del panel, **el menú deberá** mostrarse entero dentro de los límites de la ventana.
- **Cuando** la ventana mida más de 768px, **el menú no deberá** salirse por el borde izquierdo ni por ningún otro borde.
- **Cuando** el menú esté desplegado, **no deberá** cubrir el botón del selector.
- **Cuando** el menú esté desplegado, **podrá** superponerse a los botones del menú del panel, que es su comportamiento normal de desplegable.
- **Cuando** el menú esté desplegado, **los tres textos deberán** leerse completos, sin cortar ni recortar.

---

### RF-2: Las tres opciones se pueden elegir

**QUÉ**: Cada una de las tres opciones debe ser alcanzable y seleccionable, con el puntero y con el teclado.
**POR QUÉ**: Con el defecto actual el centro de las tres opciones queda fuera de la ventana y no se puede cambiar el idioma desde el panel en escritorio, que es el uso principal de esa pantalla.

**Criterios de aceptación (EARS)**:
- **Cuando** el menú esté desplegado, **cada opción deberá** ocupar un área pulsable completa.
- **Cuando** la persona administradora pulse una opción, **el sistema deberá** aplicar ese idioma y cerrar el menú.
- **Cuando** pulse la opción que ya está activa, **el menú deberá** cerrarse sin errores ni cambios.
- **Cuando** navegue por teclado desde el botón del selector, **deberá** poder recorrer las tres opciones y elegir una.
- **Cuando** elija un idioma, **el panel deberá** mostrarse en ese idioma de inmediato, sin recargar.

---

### RF-3: Los emplazamientos que funcionan no cambian

**QUÉ**: La cabecera pública y la barra superior del panel en móvil deben seguir viéndose y comportándose como hoy.
**POR QUÉ**: El defecto está solo en la barra lateral. Un arreglo que mueva el menú rompería dos sitios que hoy están bien, y la cabecera pública es la cara visible del proyecto.

**Criterios de aceptación (EARS)**:
- **Cuando** el selector se abra en la cabecera pública, **el menú deberá** seguir mostrándose en el mismo sitio que hoy.
- **Cuando** el panel se abra en una pantalla de 768px o menos, **el menú de la barra superior deberá** seguir mostrándose en el mismo sitio que hoy.
- **Cuando** se abra el menú desde cualquiera de los tres emplazamientos, **las tres opciones deberán** seguir visibles y pulsables.
- **Cuando** se cambie de idioma desde cualquier emplazamiento, **la preferencia deberá** guardarse y recuperarse igual que hoy.

---

### RF-4: El foco no se pierde al cerrarse

**QUÉ**: Cuando el menú se cierre por teclado o tras elegir una opción, el foco debe volver al botón del selector.
**POR QUÉ**: Hoy el foco queda en `<body>` y la siguiente pulsación de Tab empieza otra vez desde arriba de todo el documento, con lo que una persona que navega con teclado pierde su sitio. No lo causa este arreglo —es el comportamiento que dejó la spec 015—, pero una vez corregida la posición del menú ya se puede usar con teclado y el fallo se nota.

**Criterios de aceptación (EARS)**:
- **Cuando** el menú esté abierto y se pulse `Escape` con el foco en una opción, **el sistema deberá** cerrar el menú y dejar el foco en el botón del selector.
- **Cuando** se elija una opción, **el sistema deberá** cerrar el menú y dejar el foco en el botón del selector.
- **Cuando** el menú esté abierto con el foco en el botón y se pulse `Escape`, **el sistema deberá** cerrarlo **sin** mover el foco.
- **Cuando** el menú se cierre por un clic fuera, **el sistema deberá** cerrarlo **sin** mover el foco, que debe seguir el sitio donde se ha hecho clic.
- **Cuando** se haya perdido el foco, **el sistema deberá** seguir siendo operable: el botón sigue siendo el punto de entrada con `Enter` o `Espacio`.

---

## Requisitos no funcionales

- **Simplicidad**: la corrección debe ser de presentación; no añade dependencias ni lógica de estado nueva.
- **Consistencia**: conserva el aspecto actual del menú (ancho, altura, colores, bordes y sombra) y el de los botones del panel.
- **Accesibilidad**: el menú sigue siendo operable con teclado, con foco visible y con el mismo nombre accesible del botón, y el foco no se pierde del selector.
- **Rendimiento**: el despliegue del menú sigue siendo inmediato, sin parpadeos ni posiciones intermedias visibles.
- **Robustez**: el resultado no depende del texto concreto de las opciones ni del idioma activo, que cambian de longitud.

## Casos límite

- **Ventana estrecha justo por encima del corte**: el panel de escritorio aparece a partir de 769px; ahí el menú debe seguir cabiendo entero.
- **Menú del panel con menos botones**: un perfil sin permiso de usuarios ve la barra lateral más corta; la posición del selector no depende de cuántos botones haya debajo.
- **Cambio de idioma y vuelta**: al volver a abrir el menú, la opción activa debe seguir marcada.
- **Cierre sin elegir**: Escape o un clic fuera deben cerrar el menú sin dejarlo medio colgado.
- **Foco al cerrar**: al cerrarse con Escape o al elegir una opción, el foco debe volver al botón y no perderse en `<body>` (RF-4).

## Fuera de alcance

- Cambiar la posición, el tamaño o el aspecto del botón del selector.
- Cambiar el tamaño, la paleta o el comportamiento de apertura y cierre del menú (clic fuera, Escape, marca de opción activa). El RF-4 solo añade **dónde queda el foco**, no cuándo ni cómo se cierra.
- Modificar la cabecera pública o la barra superior del panel en móvil.
- Añadir idiomas o tocar los diccionarios.
- Revisar otros desplegables, porque hoy no hay ninguno más.

## Criterios de finalización

- En el panel de escritorio, el menú desplegado se ve entero y sus tres opciones se pueden pulsar con el puntero.
- Las tres opciones muestran su texto completo.
- El cambio de idioma funciona igual que antes desde los tres emplazamientos.
- Tras cerrar con Escape desde una opción o al elegir una, el foco queda en el botón del selector.
- La cabecera pública y la barra superior móvil quedan visualmente sin cambios.
- Las pruebas definidas en el plan pasan.

## Dudas resueltas

- **Alcance del arreglo**: solo la barra lateral del panel; no se unifica con el resto de emplazamientos (decisión de la persona usuaria).
- **Tipo de entrega**: spec nueva (016), sin reabrir la spec 015 ya validada (decisión de la persona usuaria).
- **El foco al cerrar**: la spec decía a la vez que no se tocaba JavaScript y que el foco no debía perderse; era una contradicción interna. Durante la validación se confirmó que el foco se pierde en `<body>` al cerrar con Escape desde una opción o con un clic fuera, y la persona usuaria decidió ampliar la 016 con el RF-4 en lugar de abrir una spec aparte (decisión de la persona usuaria).
