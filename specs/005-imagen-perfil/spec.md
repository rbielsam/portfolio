# Spec — Imagen de perfil

## Contexto y objetivo

La sección Inicio del portfolio muestra un círculo reservado para la fotografía de la persona. Actualmente ese círculo está vacío y el campo de la base de datos solo admite una URL escrita a mano.

El objetivo es permitir subir una fotografía real desde el área de administración, que el sistema la recorte y optimise para el círculo, y que se muestre correctamente en la web. Mientras no haya foto, el círculo debe verse intencionado y no vacío.

## Usuarios

- **Administrador**: persona autenticada que sube, sustituye o quita la fotografía de perfil.
- **Visitante**: persona que ve el portfolio y contempla la fotografía en la sección Inicio.

## Requisitos funcionales

### RF-1: Subida de la imagen de perfil

**QUÉ**: El administrador debe poder subir una fotografía de perfil desde el área de administración.
**POR QUÉ**: Gestionar el contenido sin depender de herramientas externas ni de que las imágenes-online permanence.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador abra la edición del perfil, **el sistema deberá** ofrecer la opción de subir una imagen.
- **Cuando** el administrador seleccione un fichero válido y no haya foto previa, **el sistema deberá** guardarla y asociarla al perfil.
- **Cuando** exista una foto previa, **el sistema deberá** mostrarla para que el administrador vea lo que va a sustituir.
- **Cuando** el administrador sustituya la foto por otra, **el sistema deberá** quedar con la nueva imagen y eliminar el fichero anterior.

---

### RF-2: Validación del fichero

**QUÉ**: El sistema debe rechazar las imágenes que no cumplan los formatos ni el peso permitidos.
**POR QUÉ**: Evitar subir ficheros ejecutables o desmesadamente pesados que rompan el sitio o comprometan la seguridad.

**Criterios de aceptación (EARS)**:
- **Cuando** el archivo tenga un formato distinto de JPG, PNG o WebP, **el sistema deberá** rechazarlo con un mensaje claro.
- **Cuando** el archivo pese más de 2 MB, **el sistema deberá** rechazarlo con un mensaje claro.
- **Cuando** el archivo tenga extensión válida pero no sea realmente una imagen, **el sistema deberá** rechazarlo.
- **Si** el archivo es rechazado, **el sistema no deberá** guardarlo ni sustituir la imagen anterior.

---

### RF-3: Recorte y optimización de la imagen

**QUÉ**: El sistema debe recortar la imagen para que encaje en el círculo.
**POR QUÉ**: El círculo necesita una imagen cuadrada para verse correctamente y así la web carga rápido.

**Criterios de aceptación (EARS)**:
- **Cuando** el sistema reciba una imagen válida, **el sistema deberá** recortarla desde el centro hasta obtener un cuadrado.
- **Cuando** el sistema haya recortado la imagen, **el sistema deberá** guardarla con un tamaño cuadrado adecuado para mostrarse en el círculo.
- **Cuando** la imagen ya sea cuadrada, **el sistema deberá** conservarla sin deformarla.
- **Si** la imagen tiene transparencia, **el sistema deberá** respetarla.

---

### RF-4: Visualización en el círculo

**QUÉ**: La sección Inicio debe mostrar la fotografía dentro del círculo.
**POR QUÉ**: Es el elemento visual que identifica al autor del portfolio.

**Criterios de aceptación (EARS)**:
- **Cuando** un visitante abra la sección Inicio y exista fotografía, **el sistema deberá** mostrarla dentro del círculo.
- **Cuando** exista fotografía, **el sistema no deberá** deformarla ni mostrar partes recortadas de forma imprevista.
- **Cuando** el visitante navegue entre secciones y vuelva a Inicio, **el sistema deberá** seguir mostrando la fotografía.

---

### RF-5: Estado sin fotografía

**QUÉ**: Cuando no haya fotografía, el círculo debe mostrar las iniciales del nombre sobre un fondo degradado.
**POR QUÉ**: Evitar un círculo vacío que parezca un error y mantener un aspecto cuidado desde el primer momento.

**Criterios de aceptación (EARS)**:
- **Cuando** no exista fotografía, **el sistema deberá** mostrar las iniciales del nombre dentro del círculo.
- **Cuando** no exista fotografía, **el sistema deberá** mostrar un fondo degradado en lugar de un color plano.
- **Cuando** el nombre tenga una sola palabra, **el sistema deberá** mostrar la inicial de esa palabra.
- **Si** el nombre no permite obtener iniciales, **el sistema no deberá** mostrar un círculo vacío ni romperse.

---

### RF-6: Quitar la fotografía

**QUÉ**: El administrador debe poder eliminar la fotografía.
**POR QUÉ**: Poder corregir una subida equivocada y volver al estado sin imagen.

**Criterios de aceptación (EARS)**:
- **Cuando** exista fotografía, **el sistema deberá** ofrecer la opción de quitarla.
- **Cuando** el administrador la quite, **el sistema deberá** dejar el perfil sin fotografía.
- **Cuando** se quite la fotografía, **el sistema deberá** mostrar de nuevo las iniciales en el círculo.
- **Cuando** el administrador quite la fotografía, **el sistema no deberá** mostrar ningún error en la web pública.

---

## Requisitos no funcionales

- **Seguridad**: solo un administrador autenticado puede subir o quitar la fotografía.
- **Rendimiento**: la imagen de perfil no debe bloquear la carga de la página ni pesar lo suficiente como para perjudicar la experiencia.
- **Privacidad**: la fotografía es información pública del portfolio por lo que se muestra de forma abierta; no debe contenerse ningún dato sensible en los metadatos del fichero.
- **Usabilidad**: la subida debe ser clara, con mensajes comprensibles cuando algo falla.

## Casos límite

- **Imagen muy panorámica o muy vertical**: el recorte al centro debe deixar una imagen cuadrada válida.
- **Imagen con transparencia**: debe conservarse la transparencia.
- **Fichero con extensión manipulada**: si no es una imagen real, se rechaza aunque tenga extensión correcta.
- **Subida interrumpida**: si el administrador cancela, la fotografía anterior debe seguir intacta.
- **Espacio en disco**: si la escritura falla, la web pública debe seguir funcionando con la imagen anterior.

## Fuera de alcance

- Varias fotografías o galería de imágenes.
- Recorte manual por el administrador (siempre es central).
- Edición de la imagen (filtros, brillo, retoque).
- Lightbox o ampliación al hacer clic.
- Reemplazo del avatar de otras secciones.

## Criterios de finalización

- El administrador puede subir una imagen de perfil desde el panel.
- Se rechazan los ficheros con formato o peso no permitido.
- La imagen se recorta a cuadrado y se muestra correctamente en el círculo.
- Sin fotografía, el círculo muestra las iniciales sobre fondo degradado.
- El administrador puede quitar la fotografía y la web pública sigue funcionando.
- Las pruebas definidas pasan.

## Dudas resueltas

- **Almacenamiento**: subida de fichero desde el panel, no URL escrita a mano.
- **Procesado**: recorte al centro hasta un cuadrado de 800×800 px.
- **Formatos y peso**: JPG, PNG y WebP; máximo 2 MB; validación del tipo real del fichero.
- **Sin fotografía**: iniciales del nombre sobre fondo degradado, con opción de quitarla.
