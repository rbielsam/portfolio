# Tareas — Imagen de perfil (Spec 005)

> Enfoque: tests primero, luego código. Backend: PHPUnit (`php artisan test`). Frontend: `node --test`.

## Fase 0: Requisito previo

### T0.1: Instalar GD en PHP (acción del usuario) ✅
`sudo apt install php8.5-gd`. Sin esta extensión no se pueden procesar imágenes.

**Criterios de aceptación**:
- `php -m | grep gd` lista la extensión gd.
- `php -r "var_dump(function_exists('imagecreatetruecolor'));"` devuelve true.

---

## Fase 1: Dependencia y almacenamiento

### T1.1: Tests de la instalación de imagen ✅
Verificar que Intervention Image está disponible y el driver configurado.

**Criterios de aceptación**:
- Test que confirma que la clase Image está disponible.
- Test que confirma que el driver configurado funciona.

---

### T1.2: Instalar `intervention/image-laravel` ✅
`composer require intervention/image-laravel` y publicar la configuración con driver GD.

**Criterios de aceptación**:
- El paquete está instalado.
- Existe `config/intervention-image.php` con driver gd.

---

### T1.3: Enlazar el almacenamiento ✅
`php artisan storage:link` para servir los ficheros desde `/storage`.

**Criterios de aceptación**:
- El enlace `public/storage` existe.
- Un fichero guardado en el disco public es accesible por URL.

---

## Fase 2: Servicio de imagen

### T2.1: Tests del servicio ✅
Tests de recorte, guardado y borrado de ficheros.

**Criterios de aceptación**:
- Test: una imagen panorámica se recorta a 800×800.
- Test: una imagen ya cuadrada mantiene su proporción sin deformarse.
- Test: una imagen con transparencia se conserva.
- Test: el fichero guardado tiene el tamaño recortado.
- Test: el nombre del fichero es aleatorio y no contiene el nombre original.
- Test: al procesar, se eliminan los metadatos del fichero.

---

### T2.2: Implementar `ProfilePhotoService` ✅
Servicio con los métodos de guardar (con recorte), obtener ruta y eliminar.

**Criterios de aceptación**:
- `store(UploadedFile)` recorta con `cover(800, 800)` y guarda en el disco public bajo `photos/`.
- El nombre generado es aleatorio.
- `delete(?string $path)` borra el fichero si existe y no falla si no está.
- La codificación usa calidad 82 y conserva el formato de entrada.

---

## Fase 3: Validación y endpoints

### T3.1: Tests de validación del fichero ✅
Tests de formatos y peso.

**Criterios de aceptación**:
- Test: JPG, PNG y WebP se aceptan.
- Test: un PDF o texto se rechazan con 422.
- Test: un fichero de más de 2 MB se rechaza con 422.
- Test: un fichero con extensión de imagen pero contenido no imagen se rechaza.
- Test: si se rechaza, la foto anterior sigue intacta.

---

### T3.2: Tests de los endpoints ✅
Tests de POST, PUT y DELETE con y sin autenticación.

**Criterios de aceptación**:
- Test: sin autenticación, los tres endpoints devuelven 401.
- Test: POST con fichero válido guarda la foto y devuelve 201.
- Test: PUT sustituye la foto existente y devuelve 200.
- Test: PUT borra el fichero anterior del disco.
- Test: DELETE quita la foto y la deja en null.
- Test: DELETE sin foto existente no falla.

---

### T3.3: Crear `UploadProfilePhotoRequest` ✅
Reglas de validación: required, file, mimes jpg/jpeg/png/webp, max 2048 KB.

**Criterios de aceptación**:
- El request valida formato y peso.
- El nombre del atributo es `image`.

---

### T3.4: Crear `ProfilePhotoController` y rutas ✅
Controlador con `store`, `update` y `destroy`, bajo `auth:sanctum`.

**Criterios de aceptación**:
- `POST /api/profile/photo` → store.
- `PUT /api/profile/photo` → update.
- `DELETE /api/profile/photo` → destroy.
- Las tres rutas requieren autenticación.
- Ninguna ruta permite el acceso público.

---

## Fase 4: Frontend — subida

### T4.1: Tests del componente de subida ✅
Tests del componente `PhotoUploader`.

**Criterios de aceptación**:
- Test: el componente ofrece un selector de fichero.
- Test: acepta solo jpg, jpeg, png y webp.
- Test: rechaza en cliente los ficheros de más de 2 MB.
- Test: muestra la previsualización de la imagen elegida.
- Test: tiene botones de guardar y cancelar.
- Test: muestra el estado de carga al enviar.

---

### T4.2: Crear `PhotoUploader` ✅
Componente con selección, validación en cliente, previsualización y envío.

**Criterios de aceptación**:
- Acepta solo los formatos permitidos.
- Valida el peso antes de enviar.
- Muestra la previsualización sin recargar la página.
- Envía con `FormData` usando POST o PUT según haya foto previa.
- Muestra error si el servidor rechaza.
- Permite cancelar y volver al estado anterior.

---

### T4.3: Integrar en `AdminPerfil` ✅
Incluir `PhotoUploader` en la vista de perfil.

**Criterios de aceptación**:
- El componente aparece en la vista de perfil.
- Si hay foto, se muestra la actual con opción de sustituir o quitar.
- Si no hay, se muestra solo la opción de subir.

---

## Fase 5: Frontend — visualización

### T5.1: Tests de la visualización en Inicio ✅
Tests del círculo de la sección Inicio.

**Criterios de aceptación**:
- Test: con foto, se muestra la imagen.
- Test: sin foto, se muestran las iniciales del nombre.
- Test: con nombre de una sola palabra, se muestra su inicial.
- Test: sin nombre, el círculo no queda vacío ni rompe.

---

### T5.2: Actualizar `Inicio.jsx` ✅
Mostrar la foto o las iniciales sobre fondo degradado.

**Criterios de aceptación**:
- Con foto, la muestra dentro del círculo sin deformarse.
- Sin foto, muestra iniciales sobre degradado.
- Las iniciales se calculan del campo `name`.

---

### T5.3: Estilos del avatar ✅
Estilos del círculo, de la foto y de las iniciales.

**Criterios de aceptación**:
- El avatar mantiene la forma circular.
- Las iniciales están centradas y legibles.
- El fondo degradado es coherente con el diseño del portfolio.
- Es adaptable a móvil.

---

## Fase 6: Validación

### T6.1: Verificar el flujo completo ✅
Comprobar subida, recorte, sustitución, borrado y visualización.

**Criterios de aceptación**:
- Subir una imagen real la guarda recortada a 800×800.
- La web pública muestra la foto en el círculo.
- Sustituir elimina el fichero anterior.
- Quitar la foto devuelve al estado de iniciales.
- Sin autenticación no se puede tocar la foto.

---

### T6.2: Suite final y build ✅
Ejecutar todas las pruebas y el build.

**Criterios de aceptación**:
- `php artisan test` pasa.
- `node --test` pasa.
- `npm run build` no falla.

---

## Criterios de finalización

- Todas las tareas completadas.
- El administrador puede subir, sustituir y quitar la foto.
- Se rechazan formatos y pesos no permitidos.
- La imagen se guarda recortada a 800×800.
- Sin foto, el círculo muestra iniciales con degradado.
- No quedan ficheros huérfanos en el disco.
- Tests y build correctos.
