# Tareas — Vista previa de la foto de perfil en el panel (Spec 011)

> Enfoque: tests primero, luego código. Frontend: `node --test tests/*.test.js`.
> **Restricciones**: no se modifica ningún test existente · se toca un solo fichero de fuente · **la foto real del usuario no se modifica** (decisión registrada en el plan, D5).

## Fase 1: Tests

### T1.1: Tests de la vista previa de foto ✅
Crear `tests/t16.test.js` con las comprobaciones estáticas.

**Criterios de aceptación**:
- Comprueba que `PhotoUploader.jsx` importa `photoUrl` desde `src/utils/initials.js`.
- Comprueba que la URL se construye con `photoUrl(currentPhoto)` (RF-1).
- Comprueba que la expresión conserva el orden `preview || photoUrl(...)` (RF-2).
- Comprueba que `preview` **no** se pasa por `photoUrl()` — si lo hiciera, la previsualización local se rompería (RF-2).
- Comprueba que el `<img>` declara `onError` (RF-3).
- Comprueba que la zona de vista previa sigue renderizando `photo-uploader__placeholder` como respaldo.
- Comprueba que `sections/Inicio.jsx` y `Navigation/SessionChip.jsx` siguen usando `photoUrl` (regresión de las specs 005 y 010).
- Los tests fallan antes de implementar. ✅ (4 de 7 fallaban; T16.4, T16.6 y T16.7 son guardas de regresión)

---

## Fase 2: Implementación

### T2.1: Corregir la URL de la foto en `src/components/admin/PhotoUploader.jsx` ✅
Único fichero de fuente modificado en esta spec.

**Criterios de aceptación**:
- Se importa `photoUrl` desde `../../utils/initials.js`. ✅
- La URL de la imagen pasa a resolverse con `preview || photoUrl(currentPhoto)` (RF-1 y RF-2). ✅
- El estado de imagen fallida guarda la **URL** que falló, no un booleano, para que se auto-invalida cuando la imagen cambie (subir, quitar, elegir archivo) sin necesidad de `useEffect`. ✅ (`failedSrc`)
- El `<img>` declara `onError` que marca esa URL como fallida (RF-3). ✅
- Cuando `imageSrc` es `null` o está marcada como fallida, se renderiza el marcador `photo-uploader__placeholder` (RF-1 y RF-3). ✅
- `photoUrl(null)` devuelve `null`, por lo que los casos "sin foto" y "foto quitada" siguen mostrando el marcador sin código adicional. ✅
- No se añade CSS ni ningún fichero nuevo de estilos. ✅
- No se modifica `AdminPerfil.jsx`, la validación, los botones, el borrado ni el resto del componente. ✅
- No se modifica backend, endpoints ni estructura de datos. ✅
- No se importa ninguna dependencia nueva. ✅

---

## Fase 3: Validación

### T3.1: Prueba manual no destructiva en navegador ✅
Comprobar el fallo corregido y las regresiones **sin modificar la foto del usuario**.

**Criterios de aceptación**:
- **El fallo corregido**: al abrir "Perfil" con la foto guardada, la imagen carga. Verificado en el DOM con `naturalWidth > 0` (antes era `0` y `cargaOk: false`). ✅ **`naturalWidth: 800`, `cargaOk: true`**, y la URL pasó de `5173/photos/...` a `5173/storage/photos/...`.
- **Previsualización local**: elegir un archivo válido muestra su vista previa (`blob:`) sin subirlo. ✅ `blob:http://localhost:5173/32f2ec46-...`, `naturalWidth: 800`.
- **Cancelar**: al cancelar la selección se vuelve a la foto guardada. ✅ Vuelve a `/storage/photos/...` con `naturalWidth: 800`.
- **Sin foto**: con `photo = null` se muestra "Sin foto" (comportamiento actual correcto, sin regresión). ✅ Por código: `photoUrl(null)` → `null` → marcador.
- **Regresión spec 005**: la sección Inicio muestra la foto grande correctamente. ✅ `ok: true`.
- **Regresión spec 010**: el indicador de sesión de la navegación muestra la foto correctamente. ✅ `ok: true`.
- **Lectura**: el formulario en solo lectura muestra la foto igualmente. ✅ El `<img>` no depende de `readOnly`.
- **Consola**: sin errores nuevos. ✅
- **No se pulsa** "Guardar foto" ni "Quitar foto": la foto real del usuario queda intacta. ✅ Comprobado en BD: mismo fichero, nombre, tamaño (59560) y fecha (11:23); 2 usuarios.

---

### T3.2: Tests finales y build ✅
Ejecutar toda la suite y el build.

**Criterios de aceptación**:
- `npm test` pasa (los 151 existentes + los nuevos de `t16`), sin haber tocado ningún test previo. ✅ **158/158**
- `npm run build` no falla. ✅

---

## Cobertura de criterios no verificados en navegador

Recogido del plan (D5): **la foto real del usuario no se modifica**, así que dos criterios no se prueban manualmente.

- **«Tras subir una foto, se muestra»**: comparte la expresión exacta `preview || photoUrl(currentPhoto)` con el caso "al abrir", que sí se prueba. La única diferencia es que `preview` se limpia al terminar (`useEffect` sobre `file`), comportamiento que no se modifica.
- **«Tras quitar la foto, aparece el marcador»**: `onRemoved` pone `photo: null` → `photoUrl(null)` → `null` → marcador. Cubierto por inspección.
- **RF-3 (imagen que no carga)**: cubierto por test estático.

## Criterios de finalización

- Todas las tareas completadas. ✅
- Al abrir "Perfil" con una foto guardada, la imagen se ve correctamente, sin icono roto. ✅
- La previsualización local de un archivo elegido sigue funcionando igual y cancelar vuelve a la foto guardada. ✅
- Sin foto, o con `photo = null`, se muestra el marcador "Sin foto". ✅
- Si la imagen no puede cargarse, se muestra el marcador en lugar de una imagen rota. ✅
- La sección Inicio y el indicador de sesión siguen mostrando la foto. ✅
- El resto del subidor (validación, botones, mensajes de error, borrado) queda sin cambios de comportamiento. ✅
- Se modifica un solo fichero de fuente y no se añade CSS. ✅
- La foto real del usuario no se modifica. ✅
- Tests y build correctos, sin modificar ningún test existente. ✅
