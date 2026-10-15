# Tareas — Puesta en línea del portfolio en AWS (Spec 017)

Estado: **pendiente de ejecución**

> Esta spec **no modifica la aplicación ni ningún test**. Toca tres ficheros del repositorio y, sobre todo, infraestructura y servidor.
>
> **Quién ejecuta**: la infraestructura y los comandos del servidor se hacen en la cuenta de AWS y en la máquina; el agente no puede entrar en ninguna de las dos. Las fases 1 y 9 las hace el agente; las 2 a 8 las ejecuta la persona usuaria siguiendo `docs/despliegue.md`.

## Fase 1: Documentación y scripts

### T1.1 `docs/despliegue.md` — nuevo

La guía que sostiene el RF-7. Debe permitir seguir cada paso **sin interpretación**: qué se pincha, qué se teclea y qué se comprueba después.

Contenido mínimo:

1. **Contratar el dominio** y a qué registrador.
2. **Crear la infraestructura** en AWS: EC2, RDS, bucket de S3, rol de IAM, reglas de seguridad.
3. **Configurar el servidor**: Apache, PHP 8.3 y sus extensiones, MySQL, Composer, Certbot.
4. **Preparar la aplicación**: código, `.env` de producción, dependencias, migraciones, enlace de almacenamiento.
5. **Migrar los datos**.
6. **Publicar** la primera versión y una posterior.
7. **Restaurar una copia** de seguridad.
8. **Verificar el correo**.
9. **Revisar el coste** y qué empieza a costar al terminar el periodo gratuito.

Incluye el `.env` de producción con **los valores que hay que poner**, sin credenciales reales.

### T1.2 `deploy/publicar.sh` — nuevo

Compila en local, sube el build y aplica una versión en el servidor. Debe ser reutilizable para publicar cambios posteriores (RF-7).

### T1.3 `deploy/respaldo.sh` — nuevo

Copia comprimida de la base de datos hacia el bucket de S3, con retención, y con la instrucción de **restauración** incluida en el propio script (RF-6).

## Fase 2: Contratación

### T2.1 Dominio `rbielsam.com`

Registrado en un registrador al costo, con el DNS incluido. **Se comprueba al contratar** el precio real del primer año y de la renovación, porque la guía no debe fijar cifras que cambian.

### T2.2 Cuenta de AWS

Revisar en **Billing → Free Tier** hasta cuándo llega la gratuidad y qué servicios cubre, para que la guía refleje la situación real de la cuenta.

## Fase 3: Infraestructura AWS

### T3.1 EC2

Ubuntu 24.04, `t2.micro`, al menos 8 GB de disco, en una región europea cercana (**Milán `eu-south-1`**; válidas París o Fráncfort). Con **rol de IAM** con permisos de escritura sobre el bucket de copias (D4).

### T3.2 RDS

MySQL `db.t3.micro` en la **misma VPC**, sin alta disponibilidad (cuesta el doble), con almacenamiento mínimo suficiente.

### T3.3 Bucket de S3

Privado, con acceso público bloqueado y **regla de ciclo de vida** para no acumular copias indefinidamente.

### T3.4 Reglas de seguridad

| Puerto | Quién |
|---|---|
| 80 y 443 | Abiertos a internet |
| 22 | **Solo** desde la IP de administración |
| 3306 | **Solo** desde el EC2 — **nunca** desde internet |

**Comprobación**: la base de datos no debe responder desde fuera del servidor.

## Fase 4: Servidor

### T4.1 Base del servidor

Apache, PHP 8.3 con las extensiones que necesita Laravel (`mysql`, `mbstring`, `xml`, `curl`, `gd`, `zip`, `bcmath`), cliente de MySQL y Certbot.

### T4.2 Composer y HTTPS

Instalar Composer. Emitir el certificado con Certbot, comprobar la **renovación automática** y que HTTP redirige a HTTPS (RF-1).

## Fase 5: Aplicación y datos

### T5.1 Código y configuración

Código en el servidor y `.env` de producción generado **desde cero**, nunca copiado del de desarrollo.

| Variable | Valor |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | **`false`** (RF-8) |
| `APP_URL` | `https://rbielsam.com` |
| `DB_HOST` | punto final de RDS |
| `SESSION_DOMAIN` | se **deja** en `null` — un solo dominio |
| `FILESYSTEM_DISK` | se **deja** en `local` — las fotos van a S3 en la spec 018 |

### T5.2 Dependencias, migraciones y enlace

Dependencias sin desarrollo, migraciones, caché de configuración y rutas, y `storage:link` — el enlace actual apunta a esta máquina por ruta absoluta, así que hay que crearlo de nuevo en el servidor (T3.2 de la estructura).

### T5.3 Migrar los datos

Base de datos y foto de perfil. **Antes** se comprueba que nadie esté editando el panel; **después**, que los recuentos coincidan y que **no** haya registros de prueba.

Recuentos esperados: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**, y la foto `photos/vsbEUqMTiZ3qOqUCbvLo08rz7x3K7xuY.jpg`.

## Fase 6: Publicación

### T6.1 Build de React

`npm run build` en local. **No se instala Node en el servidor** (D5).

### T6.2 Publicar y comprobar la raíz

Colocar `index.html` y `assets/` en `public/` del backend.

**Punto de más riesgo del plan**: en la raíz debe aparecer **el portfolio y no la página de bienvenida de Laravel**. `routes/web.php` tiene una ruta que la devuelve, y Apache entrega `index.html` antes que `index.php` si ambos existen. Se comprueba en el navegador y se deja escrito el resultado.

### T6.3 Resolver la interposición, si la hay

**Solo si** la raíz no entrega la app, se retira esa ruta —que la aplicación no usa— y se vuelve a comprobar. Es el único cambio de código que contempla esta spec, y solo si hace falta.

## Fase 7: Copias de seguridad

### T7.1 Copia automática

`respaldo.sh` instalado y programado en cron, apuntando al bucket de S3.

### T7.2 Probar la restauración

Restaurar una copia en **una base de datos de prueba**, nunca en la real. **Una copia que nunca se ha probado no es una copia** (RF-6).

## Fase 8: Correo

### T8.1 Verificar el dominio

Añadir los registros DNS que pida el servicio de correo para superar DKIM y SPF (RF-5).

### T8.2 Remitente propio

Cambiar `MAIL_FROM_ADDRESS` a una dirección del dominio propio y comprobar que los mensajes dejan de acabar en la carpeta de correo no deseado.

## Fase 9: Verificación

### T9.1 Comprobaciones de navegador

Contra `https://rbielsam.com`, **desde otra red que la del servidor** (datos móviles, no el mismo wifi):

- La página pública carga **sin aviso de sitio inseguro**; por HTTP redirige a HTTPS.
- La raíz muestra **el portfolio**, no la página de bienvenida de Laravel.
- El panel permite iniciar sesión y abrir **las seis vistas** con sus datos.
- El cambio de idioma funciona y la preferencia persiste.
- La foto de perfil se ve en la pública y en el panel.
- Un mensaje del formulario **llega al correo** de la persona responsable.

### T9.2 Datos

Recuentos: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**. Sin usuarios ni mensajes de prueba.

### T9.3 Seguridad

Provocar un error y comprobar que la respuesta **no** muestra trazas ni valores de entorno. Revisar que el repositorio no contiene claves. Comprobar que la base de datos **no responde** desde internet.

### T9.4 Sin regresiones

| Suite | Resultado esperado |
|---|---|
| `npm test` | **234/234**, ningún test modificado |
| `npm run build` | sin errores |
| `php artisan test --compact` | **105/105** |

### T9.5 Coste

Dejar escrito en `docs/despliegue.md` **lo que cuesta hoy** y **lo que empezará a costar** cuando termine el periodo gratuito.

## Pendiente

- [ ] T1.1
- [ ] T1.2
- [ ] T1.3
- [ ] T2.1
- [ ] T2.2
- [ ] T3.1
- [ ] T3.2
- [ ] T3.3
- [ ] T3.4
- [ ] T4.1
- [ ] T4.2
- [ ] T5.1
- [ ] T5.2
- [ ] T5.3
- [ ] T6.1
- [ ] T6.2
- [ ] T6.3
- [ ] T7.1
- [ ] T7.2
- [ ] T8.1
- [ ] T8.2
- [ ] T9.1
- [ ] T9.2
- [ ] T9.3
- [ ] T9.4
- [ ] T9.5
