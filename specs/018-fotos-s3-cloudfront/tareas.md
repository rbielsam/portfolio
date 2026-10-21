# Tareas — Fotos en S3 y CloudFront (Spec 018)

Estado: **Fase 1 completada**. Fase 2 pendiente (consola de AWS, manual).

## Fase 1 — Código

- [x] **T1.1** Instalar `league/flysystem-aws-s3-v3` (`^3.35`).
- [x] **T1.2** `config/filesystems.php`: `photo_disk` + `.env.example` (`PHOTO_DISK`, `AWS_URL`).
- [x] **T1.3** `ProfilePhotoService`: disco configurable y comprobación de fallo al guardar.
- [x] **T1.4** `Profile`: accesor `photo_url` con `$appends`.
- [x] **T1.5** La portada, el chip de sesión y el panel prefieren `photo_url` (con `photoUrl` como respaldo).
- [x] **T1.6** Tests: 3 nuevos en `ProfilePhotoServiceTest`, 4 en `ProfilePhotoUrlTest` y `React/tests/t24.test.js`.

### Verificación de la Fase 1

- `php artisan test --compact`: **112/112** (105 previos + 7 nuevos).
- `npm test`: **246/246** (243 previos + 3 nuevos).
- `npm run build`: correcto.
- `vendor/bin/pint --dirty`: formateado.
- Ningún test existente cambió de aserción: los de `photoUrl` de t10/t15/t16 siguen pasando porque los componentes mantienen el helper.

## Fase 2 — Infraestructura (manual, consola AWS)

- [ ] **T2.1** Crear el bucket privado de fotos.
- [ ] **T2.2** Crear el certificado ACM en `us-east-1` para `cdn.rbielsam.es` y validarlo en IONOS.
- [ ] **T2.3** Crear la distribución CloudFront (origen S3 + OAC, `cdn.rbielsam.es`, HTTP→HTTPS).
- [ ] **T2.4** CNAME `cdn` → distribución en IONOS.
- [ ] **T2.5** Ampliar el rol de IAM con los permisos del bucket de fotos.

> Los pasos exactos están en **§12 de `docs/despliegue.md`**.

## Fase 3 — Servidor y migración

- [ ] **T3.1** Añadir `PHOTO_DISK`, `AWS_BUCKET`, `AWS_URL` y `AWS_DEFAULT_REGION` al `.env` del servidor.
- [ ] **T3.2** Copiar la foto actual a S3 (`aws s3 cp`) y comprobarla por CloudFront.
- [ ] **T3.3** Borrar la copia local.
- [ ] **T3.4** Publicar con `publicar.sh`.
- [ ] **T3.5** Probar subir, sustituir y borrar desde el panel en producción.

## Fase 4 — Documentación

- [x] **T4.1** `docs/despliegue.md`: §12 con bucket, ACM, CloudFront, DNS, IAM, `.env`, migración y comprobaciones; nota de costes y de copias.
- [ ] **T4.2** `MEMORY.md` (al cerrar la spec).

## Verificación final (pendiente)

- Producción: foto servida por `cdn.rbielsam.es`, bucket privado, sustitución sin caché vieja.
