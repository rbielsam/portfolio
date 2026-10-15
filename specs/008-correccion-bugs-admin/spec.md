# Spec — Corrección de bugs en el panel de administración

## Contexto y objetivo

Al revisar el área de administración con un usuario registrado se han detectado dos fallos que afectan a su uso real:

1. En las secciones **Formación**, **Experiencia** y **Proyectos**, cuando no hay ningún registro guardado, la vista muestra únicamente el mensaje "No hay datos disponibles" y **no permite crear el primero**. El formulario de creación no llega a aparecer. Esto impide arrancar el contenido del portfolio desde el panel.
2. La sección **Usuarios** se muestra sin diseño: el botón "Crear usuario" parece texto plano, los datos de cada usuario aparecen pegados unos tras otros y las acciones "Editar" y "Eliminar" se ven también como texto seguido. La vista es difícil de leer y de usar.

El objetivo es corregir ambos fallos para que el panel sea operativo: poder crear registros desde cero en cualquier sección y que la gestión de usuarios se vea y se use correctamente.

> Esta spec corrige fallos de funcionamiento. La unificación estética del panel con el resto del sitio (paleta, diseño responsive) queda fuera y se tratará en una spec aparte.

## Usuarios

- **Administrador**: persona con todos los permisos, que necesita crear y gestionar el contenido del portfolio.
- **Editor**: persona que gestiona el contenido y los mensajes, pero no los usuarios.
- **Solo lectura**: persona que puede ver el contenido, pero no modificarlo.

## Requisitos funcionales

### RF-1: El estado vacío no impide crear el primer registro

**QUÉ**: En Formación, Experiencia y Proyectos, la ausencia de datos no debe impedir al usuario con permisos de edición crear el primer registro.
**POR QUÉ**: Sin esta capacidad el panel no sirve para arrancar el contenido del portfolio.

**Criterios de aceptación (EARS)**:
- **Cuando** una sección de contenido no tenga ningún registro, **el sistema deberá** mostrar el mensaje de vacío junto con la posibilidad de crear el primer registro.
- **Cuando** el usuario pulse la opción de añadir, **el sistema deberá** mostrar el formulario de creación de esa sección.
- **Cuando** el usuario envíe el formulario con datos válidos, **el sistema deberá** guardar el registro y mostrarlo en la lista.
- **Cuando** el usuario con permisos de solo lectura acceda a una sección vacía, **el sistema no deberá** mostrar la opción de añadir.

---

### RF-2: Título de sección siempre visible

**QUÉ**: Cada sección del panel debe mostrar su título tanto si hay datos como si no los hay.
**POR QUÉ**: El título es la referencia de en qué sección se está; hoy desaparece cuando la lista está vacía.

**Criterios de aceptación (EARS)**:
- **Cuando** el usuario abra Formación, Experiencia o Proyectos, **el sistema deberá** mostrar el título de la sección.
- **Cuando** la sección esté vacía, **el sistema deberá** mostrar el título junto al mensaje de vacío.
- **Cuando** la sección tenga registros, **el sistema deberá** mantener el mismo título.

---

### RF-3: Botón de añadir visible y con formulario plegable

**QUÉ**: Las secciones de contenido deben ofrecer un control explícito para añadir un registro nuevo, que al pulsarlo muestre u oculte el formulario de creación.
**POR QUÉ**: Un formulario permanentemente abierto ensucia la vista; el usuario debe poder abrirlo y cerrarlo cuando quiera.

**Criterios de aceptación (EARS)**:
- **Cuando** el usuario acceda a una sección de contenido con permisos de edición, **el sistema deberá** mostrar una opción para añadir un registro nuevo, haya datos o no.
- **Cuando** el usuario pulse la opción de añadir, **el sistema deberá** mostrar el formulario de creación.
- **Cuando** el formulario esté visible, **el sistema deberá** ofrecer una forma de cancelar y ocultarlo sin guardar.
- **Cuando** el usuario cancele la creación, **el sistema deberá** descartar los datos introducidos y ocultar el formulario.
- **Cuando** el formulario esté oculto, **el sistema no deberá** mostrar los campos en pantalla.

---

### RF-4: El botón de editar reutiliza el formulario de creación

**QUÉ**: La edición de un registro existente debe abrir ese mismo formulario, relleno con los datos del registro y en modo de actualización.
**POR QUÉ**: Mantener un único formulario para crear y editar evita duplicar pantallas y comportamientos contradictorios.

**Criterios de aceptación (EARS)**:
- **Cuando** el usuario pulse la opción de editar de un registro, **el sistema deberá** mostrar el formulario relleno con sus datos.
- **Cuando** el formulario se abre desde la edición, **el sistema deberá** distinguir visualmente que se va a actualizar, no a crear.
- **Cuando** el usuario envíe el formulario en modo edición, **el sistema deberá** actualizar el registro existente sin duplicarlo.
- **Cuando** el usuario cancele la edición, **el sistema deberá** descartar los cambios y ocultar el formulario.
- **Cuando** el usuario pulse añadir teniendo el formulario de edición abierto, **el sistema deberá** mostrar el formulario vacío en modo de creación.

---

### RF-5: La sección de Usuarios se muestra con diseño legible

**QUÉ**: La sección de Usuarios debe presentar cada usuario como una entrada clara, con su nombre, email y rol separados, y con acciones identificables como botones.
**POR QUÉ**: Hoy los datos y las acciones aparecen pegados como texto corrido, lo que dificulta distinguir un usuario de otro y pulsar acciones.

**Criterios de aceptación (EARS)**:
- **Cuando** el administrador abra la sección Usuarios, **el sistema deberá** mostrar la opción de crear un usuario como un control claramente diferenciado del texto.
- **Cuando** se liste un usuario, **el sistema deberá** mostrar su nombre, email y rol de forma separada y legible.
- **Cuando** haya varios usuarios, **el sistema deberá** distinguir visualmente cada entrada del listado.
- **Cuando** un usuario tenga acciones disponibles, **el sistema deberá** mostrarlas como controles identificables y separados entre sí.
- **Cuando** el rol de un usuario se muestre en la lista, **el sistema deberá** hacerlo de forma diferenciable del resto de datos.
- **Cuando** se produzca un error al cargar o guardar usuarios, **el sistema deberá** mostrarlo como un mensaje visible y diferenciado del contenido.

---

## Requisitos no funcionales

- **Consistencia**: las tres secciones de contenido deben comportarse de forma idéntica entre sí.
- **Simplicidad**: un único formulario por sección, usado tanto para crear como para editar.
- **Preservación de datos**: las correcciones no deben alterar ni perder registros existentes.
- **Permisos**: los controles de edición siguen ocultos para quien no tenga permisos; la comprobación de permisos sigue realizándose también en el servidor.
- **Legibilidad**: la sección de Usuarios debe poder leerse y usarse sin esfuerzo.

## Casos límite

- **Base de datos vacía**: las tres secciones de contenido deben poder crear su primer registro.
- **Solo lectura**: un usuario sin permisos de edición ve las listas, pero no la opción de añadir ni la de editar.
- **Editor**: puede crear y editar contenido y mensajes, pero no accede a la sección de Usuarios.
- **Cancelar a mitad**: al cancelar creación o edición no debe quedar ningún registro ni reserva a medias.
- **Error al guardar**: si el servidor rechaza el guardado, el formulario no debe perderse sin explicación y no debe crearse un registro duplicado.
- **Varios registros**: la lista debe seguir siendo legible y cada entrada debe mantener sus acciones.
- **Edición repetida**: alternar entre editar distintos registros debe refrescar siempre el formulario con los datos correctos.

## Fuera de alcance

- Unificación de la paleta y el estilo del panel con el resto del sitio.
- Diseño responsive del panel de administración.
- Mejoras de contraste y accesibilidad más allá de lo necesario para que estas secciones sean usables.
- Modificación del backend, la autenticación o los permisos.
- Nuevas funcionalidades de las secciones de contenido más allá de crear, editar y borrar.

## Criterios de finalización

- Con la base de datos vacía, se puede crear el primer registro en Formación, Experiencia y Proyectos.
- El título de la sección es visible con y sin datos.
- El botón de añadir está siempre presente para quien tenga permisos y alterna la visibilidad del formulario.
- Cancelar una creación o una edición descarta los datos y cierra el formulario.
- Editar un registro actualiza su contenido sin duplicarlo.
- La sección de Usuarios muestra cada usuario de forma separada y sus acciones como botones identificables.
- Las listas siguen cargando, editando y borrando registros existentes sin pérdida de datos.
- Las pruebas definidas en el plan pasan.

## Dudas resueltas

- **Estado vacío**: se muestra el mensaje de vacío y, además, la opción de crear el primer registro.
- **Botón de añadir**: siempre visible para quien tenga permisos; al pulsarlo muestra u oculta el formulario.
- **Título de sección**: siempre visible, con y sin datos.
- **Editar**: reutiliza el mismo formulario, en modo de actualización.
- **Usuarios**: se corrige en esta spec como fallo de funcionamiento, no como mejora estética.
