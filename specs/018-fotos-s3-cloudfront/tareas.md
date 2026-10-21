# Tareas — Fotos en S3 y CloudFront (Spec 018)

Estado: **completada** (pendiente solo la prueba visual desde el panel y borrar el CloudFront antiguo de copias).

## Fase 1 — Código

- [x] **T1.1** Instalar `league/flysystem-aws-s3-v3` (`^3.35`).
- [x] **T1.2** `config/filesystems.php`: `photo_disk` + `.env.example` (`PHOTO_DISK`, `AWS_URL`).
- [x] **T1.3** `ProfilePhotoService`: disco configurable y comprobación de fallo al guardar.
- [x] **T1.4** `Profile`: accesor `photo_url` con `$appends`.
- [x] **T1.5** La portada, el chip de sesión y el panel prefieren `photo_url` (con `photoUrl` como respaldo).
- [x] **T1.6** Tests: 3 nuevos en `ProfilePhotoServiceTest`, 4 en `ProfilePhotoUrlTest` y `React/tests/t24.test.js`.

## Fase 2 — Infraestructura (AWS)

- [x] **T2.1** Bucket privado `portfolio-s3-fotos-597663815824-eu-south-2-an` (eu-south-2).
- [x] **T2.2** Certificado ACM en `us-east-1` para `cdn.rbielsam.es`, validado por DNS en IONOS.
- [x] **T2.3** Distribución CloudFront `d3psf3rxsm1mch.cloudfront.net`, origen S3 + OAC, `cdn.rbielsam.es`, HTTP→HTTPS.
- [x] **T2.4** CNAME `cdn` → `d3psf3rxsm1mch.cloudfront.net` en IONOS.
- [x] **T2.5** Rol `portfolio-respaldos-role` ampliado con `FotosPortfolio` y `ListarFotos`.
- [x] **T2.6** Política del bucket con el `SourceArn` de la distribución.

## Fase 3 — Servidor y migración

- [x] **T3.1** `.env` del servidor: `PHOTO_DISK=s3`, `AWS_DEFAULT_REGION=eu-south-2`, `AWS_BUCKET`, `AWS_URL` (copia en `.env.bak-20261021`).
- [x] **T3.2** Foto actual copiada a `s3://<bucket-fotos>/photos/vsbEUqMTiZ3qOqUCbvLo08rz7x3K7xuY.jpg` y servida por CloudFront (`200 image/jpeg`).
- [x] **T3.3** Copia local borrada (`storage/app/public/photos/` queda vacío).
- [x] **T3.4** Publicado con `publicar.sh` (instala el adaptador y refresca la caché).
- [x] **T3.5** Ciclo contra S3 real verificado: `store` → `exists` → `delete` (subida-ok / borrado-ok).

### Verificación de la Fase 3

- `GET https://rbielsam.es/api/profile` → `photo` (ruta) y `photo_url` = `https://cdn.rbielsam.es/photos/…`.
- `https://cdn.rbielsam.es/photos/…` → `200 image/jpeg`.
- Endpoint directo de S3 → `403` (bucket privado).
- `php artisan tinker`: `photo_disk = s3`, el objeto existe.
- Tests: **112/112** backend y **246/246** frontend; build correcto.

## Fase 4 — Documentación

- [x] **T4.1** `docs/despliegue.md`: §12 con bucket, ACM, CloudFront, DNS, IAM, `.env`, migración y comprobaciones; nota de costes y de copias.
- [x] **T4.2** `MEMORY.md`.

## Pendiente

- [ ] Probar **subir/sustituir/borrar** desde el panel en producción (prueba visual).
- [ ] **Borrar** el CloudFront antiguo que apunta al bucket de copias (riesgo de exponer los `.sql.gz`).
