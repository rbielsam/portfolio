# Spec — Fotos en S3 y CloudFront (Spec 018)

## Contexto y objetivo

Hoy la foto de perfil se guarda en el **disco de la EC2** (`storage/app/public/photos/…`) y se sirve desde `https://rbielsam.es/storage/…`. La spec 017 lo dejó así a propósito y dejó las fotos fuera de las copias de seguridad:

> **Lo que esta copia NO cubre: las fotos.** Están en el disco del servidor y no se respaldan aquí — la respaldabilidad de imágenes es la spec 018, que las mueve a S3.
> — `docs/despliegue.md`

**Objetivo**: guardar las fotos en **S3** (bucket privado), servirlas por **CloudFront** con HTTPS y caché, y que el panel siga subiendo, sustituyendo y borrando fotos sin cambios de uso.

Con esto, las fotos dejan de depender del disco de la instancia y pasan a estar cubiertas por la durabilidad de S3.

## Usuarios

- **Visitante**: ve la foto de perfil en la portada y en el chip de sesión.
- **Administrador/editor**: sube, sustituye y borra la foto desde el panel.

## Requisitos funcionales

### RF-1: Las fotos se guardan en S3

**QUÉ**: al subir o sustituir una foto, el backend la procesa igual que hoy (recorte 800×800, calidad 82) y la guarda en un **bucket privado de S3**, bajo `photos/`.

**POR QUÉ**: desacoplar las fotos del disco de la EC2 y que S3 las proteja.

**Criterios de aceptación (EARS)**:

- **Cuando** el administrador suba una foto, **el sistema deberá** crear el objeto en S3 y guardar en la base de datos la **ruta relativa** (`photos/…`).
- **Cuando** el administrador sustituya la foto, **el sistema deberá** guardar la nueva y borrar el objeto anterior de S3.
- **Cuando** el administrador borre la foto, **el sistema deberá** eliminar el objeto de S3 y dejar `photo` a `null`.

### RF-2: Las fotos se sirven por CloudFront

**QUÉ**: la URL pública de la foto pasa a ser el dominio de CloudFront (por ejemplo `https://cdn.rbielsam.es/photos/…`), con HTTPS.

**POR QUÉ**: caché en el borde, menos carga en la EC2 y un origen que no expone el bucket.

**Criterios de aceptación (EARS)**:

- **Cuando** un visitante abra la portada, **el sistema deberá** mostrar la foto con una URL del dominio de CloudFront.
- **Cuando** se pida esa URL, **el sistema deberá** devolver la imagen con `200` y `Content-Type` de imagen.
- **Cuando** se intente acceder al bucket directamente por su endpoint de S3, **el sistema deberá** denegar el acceso (bucket privado, solo CloudFront con OAC).

### RF-3: La foto actual se migra

**QUÉ**: copiar la foto que hoy está en el disco del servidor al bucket, para que la web no se quede sin foto al cambiar la configuración.

**Criterios de aceptación (EARS)**:

- **Cuando** se termine la migración, **el sistema deberá** mostrar la misma foto que antes, ahora servida por CloudFront.
- **Cuando** se compare el objeto en S3 con el fichero local, **el sistema deberá** tener el mismo contenido.

### RF-4: El desarrollo local sigue funcionando

**QUÉ**: poder trabajar sin AWS.

**Criterios de aceptación (EARS)**:

- **Cuando** `PHOTO_DISK` valga `public` (valor por defecto en local), **el sistema deberá** guardar y servir las fotos en el disco local como hoy.
- **Cuando** `PHOTO_DISK` valga `s3`, **el sistema deberá** usar S3 y CloudFront.

### RF-5: Sin credenciales en el repositorio

**QUÉ**: el servidor usa el **rol de IAM** de la instancia, igual que las copias de seguridad.

**Criterios de aceptación (EARS)**:

- **Cuando** el servidor suba una foto, **el sistema deberá** autenticarse con el rol de IAM, sin claves estáticas en `.env` ni en el repositorio.

### RF-6: Caché y sustitución

**QUÉ**: los objetos se sirven con caché larga; como el nombre del fichero es aleatorio, sustituir la foto genera una URL nueva y no hace falta invalidar CloudFront.

**Criterios de aceptación (EARS)**:

- **Cuando** se sustituya la foto, **el sistema deberá** mostrar la nueva sin purgar la caché (nombre nuevo).

## Decisiones de diseño (propuestas)

| Tema | Propuesta |
|---|---|
| **Bucket** | **Nuevo bucket dedicado** a fotos, privado. Separado del de copias para que una política mal puesta no exponga respaldos. |
| **Dominio** | **`cdn.rbielsam.es`** (CNAME a la distribución). |
| **Certificado** | **ACM en `us-east-1`** (CloudFront solo acepta certificados de esa región), validado por DNS en IONOS. |
| **Origen** | S3 privado + **OAC** (Origin Access Control). Sin acceso público al bucket. |
| **Disco de Laravel** | `PHOTO_DISK=s3` en producción; `public` en local. |
| **URL en la API** | La API devuelve `photo` (ruta) y `photo_url` (URL completa resuelta con el disco), para no atar el frontend a una variable de compilación. |
| **Copia local** | **No** se conserva: S3 es la fuente de verdad. |
| **CloudFront** | Solo para las fotos. **No** se pone delante del sitio entero (eso sería otra spec). |

## Casos límite

- **Sustitución con la misma extensión**: el nombre aleatorio cambia, así que no hay colisión ni caché vieja.
- **Fallo de S3 al subir**: la foto anterior debe conservarse (comportamiento actual de `replace`).
- **Borrado de un objeto que ya no existe**: no debe romper (el servicio ya ignora rutas fuera de `photos/`).
- **Coste**: CloudFront tiene capa gratuita permanente (1 TB/mes y 10 M peticiones); S3, 5 GB durante 12 meses. Las fotos son de pocos cientos de KB.

## Fuera de alcance

- Poner el sitio entero detrás de CloudFront.
- Miniaturas o varios tamaños de foto.
- Fotos de proyectos (hoy no existen).
- Cambiar el procesado de la imagen (recorte, tamaño, calidad).
- Cambiar el panel ni el formulario de subida.

## Decisiones cerradas

1. **Bucket**: nuevo bucket dedicado y privado, separado del de copias.
2. **Subdominio**: `cdn.rbielsam.es`.
3. **Dependencia**: se aprueba instalar `league/flysystem-aws-s3-v3`.
4. **Rol de IAM**: se amplía el rol actual de la EC2.
5. **Copia local**: se borra la foto del disco del servidor tras comprobar que se ve por CloudFront.

## Criterios de finalización

- Subir, sustituir y borrar desde el panel funcionan contra S3.
- La portada y el chip de sesión muestran la foto desde CloudFront.
- La foto actual está migrada y se ve igual que antes.
- El bucket no es público; el acceso directo a S3 devuelve acceso denegado.
- En local, con `PHOTO_DISK=public`, todo sigue funcionando.
- Tests backend y frontend en verde, sin regresiones.
