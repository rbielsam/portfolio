# Spec — Vista previa de la foto de perfil en el panel de administración

## Contexto y objetivo

El formulario de "Perfil" del panel de administración incluye un subidor de foto (`PhotoUploader`) con una zona de vista previa. Esa vista previa **no muestra la foto guardada**: aparece un icono de imagen rota.

La causa es que la ruta que devuelve la API se usa tal cual como `src` de la imagen:

```
AdminPerfil.jsx:72    currentPhoto={data?.photo || null}   →  "photos/xxx.jpg"
PhotoUploader.jsx:121 shownImage = preview || currentPhoto →  <img src="photos/xxx.jpg">
```

Al ser una URL relativa, el navegador la resuelve contra la raíz del sitio (`http://localhost:5173/photos/xxx.jpg`) y el servidor de desarrollo devuelve el `index.html`, no la imagen. La imagen existe y es accesible bajo `/storage/photos/xxx.jpg`; el componente simplemente no construye esa ruta.

Para construir la ruta correcta ya existe un helper en el proyecto, `photoUrl()` (`src/utils/initials.js`), que es el que usan tanto la sección Inicio como el indicador de sesión de la navegación. `PhotoUploader` es **el único** componente del proyecto que no lo usa.

El fallo estuvo oculto hasta ahora porque no había ninguna foto de perfil: con `photo = null` la zona mostraba el marcador "Sin foto", que es correcto. En cuanto se subió una foto, la vista previa quedó rota.

**Objetivo**: que la zona de vista previa muestre correctamente la foto del perfil en todos sus estados, sin romper la previsualización local que ya funciona.

## Usuarios

- **Persona autenticada con permiso de edición** (`admin`): gestiona su foto desde el panel.
- **Persona autenticada sin permiso de edición** (`editor`, `reader`): ve el formulario en solo lectura; la foto debe mostrarse igualmente aunque no pueda cambiarla.

## Requisitos funcionales

### RF-1: La vista previa muestra la foto guardada del perfil

**QUÉ**: Cuando el perfil tenga una foto, la zona de vista previa debe renderizar esa imagen construyendo su URL con el helper existente `photoUrl()`.
**POR QUÉ**: Hoy la ruta se usa en crudo y la imagen no carga nunca; la persona no puede comprobar qué foto tiene puesta.

**Criterios de aceptación (EARS)**:
- **Cuando** la persona abra la sección "Perfil" y el perfil tenga foto, **el sistema deberá** mostrar esa imagen en la vista previa.
- **Cuando** la subida de una foto termine con éxito, **el sistema deberá** mostrar la imagen recién subida.
- **Cuando** la persona confirme la subida, **el sistema deberá** seguir mostrando la imagen sin necesidad de recargar la página.
- **Cuando** el perfil no tenga foto, **el sistema deberá** mostrar el marcador "Sin foto", como hasta ahora.
- **Cuando** la persona quite la foto, **el sistema deberá** volver al marcador "Sin foto".
- **Cuando** la foto esté cargada, **el sistema deberá** servirla desde `/storage/`, igual que en la sección Inicio y en el indicador de sesión.

---

### RF-2: La previsualización local antes de subir no cambia

**QUÉ**: La vista previa de un archivo elegido pero aún no subido es un objeto `blob:` local; esa rama no debe alterarse.
**POR QUÉ**: Aplicar `photoUrl()` también al `blob:` rompería la previsualización que hoy funciona, cambiando un fallo por otro.

**Criterios de aceptación (EARS)**:
- **Cuando** la persona seleccione un archivo válido, **el sistema deberá** mostrar su previsualización local.
- **Cuando** exista un archivo local elegido, **el sistema deberá** usar esa previsualización con preferencia sobre la foto guardada.
- **Cuando** se cancele la selección o termine la subida, **el sistema deberá** volver a resolver contra la foto guardada.
- **Cuando** no haya archivo local ni foto guardada, **el sistema deberá** mostrar el marcador.

---

### RF-3: Una imagen que no carga se sustituye por el marcador

**QUÉ**: Si la imagen existente falla al cargarse, la zona debe mostrar el marcador en lugar de un icono roto.
**POR QUÉ**: Evita volver a un estado visual defectuoso si el fichero desaparece del disco o la ruta deja de ser válida. Es el mismo criterio que ya se aplicó al indicador de sesión (spec 010, RF-2).

**Criterios de aceptación (EARS)**:
- **Cuando** la imagen falle su carga, **el sistema deberá** mostrar el marcador "Sin foto".
- **Cuando** la imagen cargue correctamente, **el sistema deberá** seguir mostrándola.
- **Cuando** se elija un archivo local, **el sistema deberá** ignorar el estado de error de la imagen anterior.

## Requisitos no funcionales

- **Sin dependencias nuevas**: se usa el helper `photoUrl()` ya existente en el proyecto.
- **Sin cambios de backend**: el endpoint y la respuesta de `/api/profile` no se modifican.
- **Sin cambios de estructura de datos**: no se toca la tabla `profiles` ni `users`.
- **Sin refactor de utilidades**: `photoUrl()` sigue viviendo en `src/utils/initials.js`, aunque su nombre no encaje perfectamente; moverlo queda fuera de alcance.
- **Consistencia**: la vista previa resuelve la foto igual que la sección Inicio y el indicador de sesión.
- **Alcance mínimo**: solo se toca `PhotoUploader.jsx`; el resto del subidor (validación de tipo y tamaño, botones, errores) queda intacto.

## Casos límite

- **Perfil sin foto**: se muestra "Sin foto" (comportamiento actual correcto).
- **Foto presente en la base de datos pero ausente del disco**: la imagen falla y se muestra el marcador, no un icono roto (RF-3).
- **Foto recién subida**: la previsualización local se limpia al terminar y debe resolverse contra la foto guardada.
- **Subida fallida (422 por tipo o tamaño mayor de 2 MB)**: se muestra el mensaje de error existente y se conserva lo que se estaba mostrando.
- **Subida fallida por red**: igual que el caso anterior; no se pierde la foto previa.
- **Persona con solo lectura** (`editor`, `reader`): la foto se muestra correctamente aunque los controles estén deshabilitados.
- **Cambio de archivo varias veces seguidas**: siempre se muestra la última previsualización local.
- **Ruta de foto con caracteres especiales**: `photoUrl()` la normaliza igual que en el resto de la aplicación.

## Fuera de alcance

- Estética, paleta y comportamiento responsive del área de administración (spec **009**, reservada).
- Mover `photoUrl()` a un fichero de utilidades propio.
- Cambiar el aspecto del subidor o de la zona de vista previa.
- Modificar la validación de tipo o tamaño en cliente o en servidor.
- Cambiar los endpoints de subida o borrado de foto.
- Mostrar la foto en el área de administración fuera de la sección Perfil.
- El nombre que muestra el indicador de sesión de la navegación (`user.name` frente a `profile.name`): es el comportamiento aprobado en la spec 010.
- Crear un campo de foto por usuario en la tabla `users`.

## Criterios de finalización

- Al abrir "Perfil" con una foto guardada, la imagen se ve correctamente, sin icono roto.
- Tras subir una foto nueva, la vista previa muestra esa foto.
- La previsualización local de un archivo elegido sigue funcionando igual.
- Sin foto, o tras quitarla, se muestra el marcador "Sin foto".
- Si la imagen no puede cargarse, se muestra el marcador en lugar de una imagen rota.
- La sección Inicio y el indicador de sesión siguen mostrando la foto como hasta ahora.
- El resto del subidor de foto (validación, botones, mensajes de error) queda sin cambios de comportamiento.
- Las pruebas definidas en el plan pasan.

## Dudas resueltas

- **Número de spec**: es la **011**; la 009 sigue reservada para estética y responsive del panel.
- **Causa raíz**: la ruta relativa `photos/xxx.jpg` se usa como `src` sin pasar por `photoUrl()`. No es un problema del proxy de Vite añadido en la spec 010: `/photos` nunca existió como ruta válida, ni en el origen de Laravel (404).
- **Arreglo**: aplicar `photoUrl()` únicamente sobre `currentPhoto`, dejando `preview` (el `blob:`) intacto.
- **Alcance**: se corrige solo `PhotoUploader.jsx`; es el único componente que no usaba el helper.
- **Robustez adicional (RF-3)**: se añade el respaldo ante fallo de carga de la imagen, por coherencia con lo ya hecho en la spec 010. Si se prefiere el mínimo estricto, puede eliminarse sin afectar al RF-1.
