# Plan — Fotos en S3 y CloudFront (Spec 018)

## Alcance

- **Backend**: adaptador S3, disco de fotos configurable, URL pública en la API y comprobación de fallo al subir.
- **Frontend**: usar `photo_url` cuando venga de la API.
- **Infraestructura** (manual, consola de AWS): bucket, CloudFront + OAC, certificado ACM y DNS.
- **Servidor**: `.env`, rol IAM y migración de la foto actual.
- **Documentación**: `docs/despliegue.md`.
- **Sin cambios** en el procesado de la imagen (800×800, calidad 82), en el panel ni en el formulario de subida.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Bucket | Nuevo bucket dedicado, privado |
| Dominio | `cdn.rbielsam.es` |
| Dependencia | `league/flysystem-aws-s3-v3` |
| IAM | Ampliar el rol actual de la EC2 |
| Copia local | Se borra tras migrar |

## Arquitectura

```
Panel (React) ──POST /api/profile/photo──▶ Laravel (EC2)
                                              │
                                              │ procesa 800×800
                                              │ PutObject (rol IAM)
                                              ▼
                                        S3 privado (photos/)
                                              ▲
                                              │ OAC
                                        CloudFront (cdn.rbielsam.es)
                                              ▲
                                              │ HTTPS
                                        Visitante (React)
```

## Stack confirmado

- Laravel 13.17, PHP 8.3+ (servidor 8.5.4).
- `intervention/image-laravel` para el recorte.
- Tests: PHPUnit (`php artisan test --compact`), 105 actuales.
- Frontend: React 18 + Vite, tests estáticos (`npm test`), 243 actuales.

## Decisiones de implementación

### D1 — Disco de fotos configurable

`config/filesystems.php` gana `'photo_disk' => env('PHOTO_DISK', 'public')`.
`ProfilePhotoService` usa `Storage::disk(config('filesystems.photo_disk', 'public'))`.

- Local: `public` (sin cambios).
- Producción: `s3`.

### D2 — El disco `s3` apunta al bucket de fotos

`.env` de producción:

```
PHOTO_DISK=s3
AWS_DEFAULT_REGION=eu-south-2
AWS_BUCKET=<bucket-fotos>
AWS_URL=https://cdn.rbielsam.es
```

Sin `AWS_ACCESS_KEY_ID` ni `AWS_SECRET_ACCESS_KEY`: Laravel, al no recibirlas, usa la cadena de credenciales por defecto (rol de IAM de la instancia).

### D3 — La API devuelve `photo` y `photo_url`

`Profile` añade un accesor `photo_url` (con `$appends`) que resuelve la URL con el disco de fotos. Si `photo` ya es una URL absoluta, se devuelve tal cual. `photo` sigue siendo la **ruta relativa**, que es lo que usa el borrado y lo que se guarda en la base de datos.

### D4 — El frontend prefiere `photo_url`

`utils/initials.js` añade `profilePhotoSrc(profile)`: usa `photo_url` si existe; si no, `photoUrl(photo)` (local y compatibilidad). Lo usan `Inicio`, `SessionChip` y `AdminPerfil`.

### D5 — Un fallo de S3 no borra la foto anterior

`ProfilePhotoService::store()` comprueba el resultado de `put()`; si falla, lanza una excepción **antes** de que `replace()` borre la anterior.

### D6 — CloudFront solo para las fotos

El sitio sigue en la EC2. CloudFront tiene un origen S3 (bucket de fotos) y el dominio `cdn.rbielsam.es`.

## Estructura de ficheros

```
Laravel/composer.json / composer.lock              (nuevo: league/flysystem-aws-s3-v3)
Laravel/.env.example                                (PHOTO_DISK, AWS_URL)
Laravel/config/filesystems.php                      (photo_disk)
Laravel/app/Services/ProfilePhotoService.php        (disco configurable + fallo)
Laravel/app/Models/Profile.php                      (photo_url)
Laravel/tests/Feature/ProfilePhotoServiceTest.php   (disco s3 + fallo)
Laravel/tests/Feature/ProfilePhotoTest.php          (photo_url en la respuesta)
React/src/utils/initials.js                         (profilePhotoSrc)
React/src/components/sections/Inicio.jsx
React/src/components/Navigation/SessionChip.jsx
React/src/pages/admin/AdminPerfil.jsx
React/tests/t24.test.js                             (nuevo)
docs/despliegue.md                                  (bucket, CloudFront, ACM, DNS, .env, IAM, costes)
```

> No se modifica ningún test existente salvo los dos de fotos, que se amplían.

## Fases

### Fase 1 — Código (local, sin AWS)

1. Instalar `league/flysystem-aws-s3-v3`.
2. `config/filesystems.php` + `ProfilePhotoService` + `.env.example`.
3. `Profile::photo_url`.
4. Frontend (`profilePhotoSrc` y sus tres usos).
5. Tests.

Se completa y verifica **sin tocar AWS**: `Storage::fake('s3')` simula el disco.

### Fase 2 — Infraestructura (manual, consola de AWS)

1. Crear el **bucket privado** de fotos con bloqueo de acceso público.
2. Crear el **certificado ACM en `us-east-1`** para `cdn.rbielsam.es` y validarlo con el CNAME que da AWS en IONOS.
3. Crear la **distribución CloudFront**: origen S3 con OAC, `cdn.rbielsam.es`, redirigir HTTP→HTTPS.
4. Añadir el **CNAME `cdn`** → dominio de la distribución en IONOS.
5. Ampliar el **rol de IAM** con `PutObject`, `GetObject`, `DeleteObject` y `ListBucket` sobre el bucket de fotos.

### Fase 3 — Servidor y migración

1. Añadir las variables al `.env` del servidor.
2. Copiar la foto actual con `aws s3 cp` (el servidor ya tiene AWS CLI y el rol).
3. Comprobar que la web la muestra por CloudFront.
4. Borrar la copia local.
5. Publicar (`publicar.sh`) para instalar el paquete y refrescar la caché.

### Fase 4 — Documentación

1. `docs/despliegue.md`: sección de fotos, IAM, `.env`, costes y actualización.
2. `MEMORY.md`.

## Verificación

### Automática

- `php artisan test --compact` → los 105 actuales + los nuevos.
- `npm test` → los 243 actuales + `t24`.
- `npm run build`.

Tests nuevos:

- El servicio guarda en el disco configurado (`Storage::fake('s3')`).
- Un fallo de escritura no borra la foto anterior.
- `photo_url` aparece en `/api/profile` y usa el disco configurado.
- `profilePhotoSrc` prefiere `photo_url` y cae a `photoUrl` si no existe.

### Manual

1. En local (`PHOTO_DISK=public`), subir/sustituir/borrar sigue funcionando.
2. En producción: subir una foto desde el panel → aparece en la portada servida por `cdn.rbielsam.es`.
3. Sustituir → se ve la nueva y el objeto anterior ya no está en S3.
4. Borrar → la portada muestra las iniciales.
5. `curl -I https://cdn.rbielsam.es/photos/<fichero>` → `200`, `content-type: image/jpeg`, y `x-cache: Hit` en la segunda petición.
6. Acceso directo al endpoint de S3 del objeto → `403`.
7. La foto actual migrada se ve igual que antes.

### Datos

- No cambia el esquema ni el contenido de `profile.photo` (sigue siendo la ruta relativa).
- La migración copia el objeto; no modifica la base de datos.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `AWS_URL` mal configurada | Comprobar `photo_url` en `/api/profile` y la petición a CloudFront. |
| El rol sin permisos sobre el bucket nuevo | `aws s3 cp` de prueba antes de publicar. |
| Certificado ACM en la región equivocada | Debe crearse en **`us-east-1`**, no en `eu-south-2`. |
| Caché de configuración | `publicar.sh` ejecuta `config:cache`; tras cambiar `.env`, volver a publicar. |
| Subida silenciosa fallida (`throw => false`) | D5: el servicio comprueba el resultado y lanza excepción. |

## Criterios de finalización del plan

- Todo lo de la spec, verificado en producción.
- Suites en verde.
- `docs/despliegue.md` reproducible desde cero.
