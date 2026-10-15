# Plan — Imagen de perfil (Spec 005)

## Requisito previo (bloqueante)

**No hay GD ni Imagick instalados en PHP**, y son obligatorios para procesar imágenes (Intervention Image los necesita). `sudo` requiere autenticación interactiva, así que no puedo instalarlos.

**Debes ejecutar esto en tu terminal:**

```bash
sudo apt install php8.5-gd
```

Alternativa (mejor calidad de recorte, más pesado): `sudo apt install php8.5-imagick`.

Verificación: `php -m | grep -E "gd|imagick"` debe listar `gd`.

> Mientras no esté instalado, el resto del código se puede escribir y los tests de validación pasan, pero los que **procesan** la imagen fallarán.

## Stack confirmado

- **Backend**: Laravel 13 + PHP 8.5
- **Procesado**: `intervention/image-laravel` (driver GD)
- **Almacenamiento**: disco `public` de Laravel (`storage/app/public/photos`)
- **Frontend**: React 18 (subida con `fetch` + `FormData`)

## Decisiones de la fase de plan

| Decisión | Motivo |
|---|---|
| **Disco `public` de Laravel** | Simple y suficiente ahora. Si en el despliegue en AWS compensa S3, se cambia `FILESYSTEM_DISK` y nada más |
| **Nombre de fichero aleatorio** | Evita colisiones y no expone datos personales en la URL |
| **Borrado del fichero anterior al sustituir** | Evita ficheros huérfanos acumulados en el disco |
| **Recorte con `cover(800, 800)`** | Método oficial de Intervention Image: recorta al centro al tamaño exacto |
| **Calidad 82 al codificar** | Buen equilibrio entre nitidez y peso |
| **Formato de salida = el de entrada** | No converts JPEG a PNG ni al revés; el admin sube lo que quiere |
| **Metadatos eliminados al procesar** | Intervention Image no copia EXIF: la foto no filtra datos del dispositivo |

## Estructura de base de datos

`profile.photo` **ya existe** (campo `string`, nullable). Se reutiliza:
- Contiene la ruta relativa, por ejemplo `photos/a1b2c3d4.jpg`
- `null` = no hay foto (se muestra el estado de iniciales)

**No hace falta ninguna migración.**

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/profile/photo` | Subir la foto (alta: cuando no hay ninguna) |
| PUT | `/api/profile/photo` | Sustituir la foto (modificación: cuando ya existe) |
| DELETE | `/api/profile/photo` | Quitar la foto |

Los tres bajo `auth:sanctum` (solo administradores). El perfil sigue teniendo `GET /api/profile` y `PUT /api/profile` públicos en lectura.

Nomenclatura coherente con el resto de la API (education, experience, projects), donde `POST` crea, `PUT` actualiza y `DELETE` elimina. `POST` y `PUT` comparten el mismo procesamiento interno; se diferencian en la semántica:

| Endpoint | Situación | Efecto |
|---|---|---|
| `POST` | No hay foto todavía | Guarda la nueva |
| `PUT` | Ya había una foto | Sustituye la anterior y borra su fichero |
| `DELETE` | Hay una foto | La quita y borra su fichero |

## Validación del fichero

```
image  →  required | file | mimes:jpg,jpeg,png,webp | max:2048
```

La regla `mimes:` de Laravel comprueba el **tipo MIME real** del contenido, no solo la extensión. Un `.exe` renombrado a `.jpg` se rechaza.

## Flujo de subida

```
1. Admin sube el fichero (multipart/form-data, campo "image")
2. Validar formato y peso
3. Guardar con nombre aleatorio en el disco public → photos/{random}.{ext}
4. Leer el original, aplicar cover(800, 800), codificar con calidad 82
5. Sobrescribir el guardado con la versión recortada
6. Si había foto previa, borrar su fichero del disco
   (tanto en POST como en PUT; en DELETE solo se cumple este punto)
7. Guardar la ruta en profile.photo
8. Devolver el perfil actualizado
```

## Capa de servicio

Un servicio `ProfilePhotoService` separa el procesamiento de imagen del controlador. Motivo: la constitución exige separar interfaz, lógica de negocio y acceso a datos, y el procesamiento de imagen es lógica de negocio, no de HTTP.

```
app/
├── Http/Controllers/Api/ProfilePhotoController.php   (validación + respuestas)
├── Services/ProfilePhotoService.php                   (recorte, guardado, borrado)
└── Http/Requests/UploadProfilePhotoRequest.php       (reglas de validación)
```

## Frontend

```
src/
├── components/admin/PhotoUploader.jsx    (input file, previsualización, botones)
├── pages/admin/AdminPerfil.jsx           (integrar el componente)
├── components/sections/Inicio.jsx        (foto en el círculo, o iniciales)
└── styles/                                (avatar, iniciales, carga de imagen)
```

**Iniciales:** se obtienen de `name` → primera letra de la primera palabra + primera letra de la segunda. Con una sola palabra, su inicial.

## Dependencia nueva

```bash
composer require intervention/image-laravel
```

Es la primera dependencia añadida tras la constitution; queda documentada en este plan y en `MEMORY.md`.

## Pasos de implementación

1. **Instalar GD** (acción del usuario, bloqueante)
2. **Tests primero** — `PhotoServiceTest` y `PhotoUploadTest` (subida, validación, recorte, borrado, sin permisos)
3. **Instalar** `intervention/image-laravel` y publicar su configuración (driver GD)
4. **Enlazar el almacenamiento** — `php artisan storage:link`
5. **Servicio** `ProfilePhotoService` con `cover(800, 800)`
6. **Request** de validación
7. **Controlador** con los endpoints de subida y borrado
8. **Rutas** bajo `auth:sanctum`
9. **Frontend** — `PhotoUploader` con previsualización y estado de carga
10. **Integrar** en `AdminPerfil`
11. **Actualizar `Inicio.jsx`** — foto o iniciales con degradado
12. **Estilos** del avatar e iniciales
13. **Verificar** flujo completo y suite completa

## Criterios de finalización del plan

- GD o Imagick instalados y operativo.
- El administrador puede subir, sustituir y quitar la foto.
- Se rechazan formatos y pesos no permitidos.
- La imagen se guarda recortada a 800×800.
- Sin foto, el círculo muestra las iniciales con degradado.
- Los ficheros huérfanos se eliminan al sustituir.
- `php artisan test` y `node --test` en verde.
- Build correcto.
