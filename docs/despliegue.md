# Despliegue en AWS

Puesta en línea del portfolio en AWS, con `rbielsam.com` como dominio.

Este documento es la **única fuente** para desplegar, actualizar y restaurar. Está escrito para seguirse paso a paso sin interpretar. Si algo no cuadra, **se para y se pregunta**.

> **Spec**: `specs/017-despliegue-aws/`
> **Fotos en S3 y CloudFront**: pendiente, spec 018.

---

## 0 · Antes de empezar

### Qué necesitas

- Una **cuenta de AWS**. Si es reciente, revisa en **Billing → Free Tier** hasta cuándo llega la gratuidad y qué cubre: cambia con la fecha de alta.
- Un **método de pago** válido en la cuenta.
- **Acceso por terminal** a esta máquina y al servidor.
- **~1 hora** la primera vez, si todo va bien.

### Regla que gobierna todo el documento

**Lo que cambia entre desarrollo y producción vive en `.env`, no en el código.** Nunca se modifica el código para adaptarlo al servidor; si un entorno necesita algo distinto, se expresa en su `.env`.

Y **nunca se edita el código directamente en el servidor**: si se hace, el entorno queda desincronizado y la siguiente publicación lo revierte sin avisar.

### Coste

| Concepto | Durante la prueba gratuita | Después |
|---|---|---|
| EC2 `t3.micro` | incluido | ≈ 8 – 10 $/mes |
| RDS `db.t3.micro` | incluido | ≈ 13 $/mes |
| **IPv4 pública (IP elástica)** | **≈ 3,60 $/mes — NO cubierta** | ≈ 3,60 $/mes |
| S3 (copias) | incluido | céntimos |
| Dominio `.com` | ≈ 1 – 11 $ el año | ≈ 10 – 15 $/año |
| **Total** | **≈ 3,60 $/mes + el dominio** | **≈ 26 – 32 $/mes** |

> **Desde febrero de 2024 AWS cobra toda IPv4 pública: 0,005 $/hora (≈ 3,60 $/mes) y ya no está incluida en el nivel gratuito.** Vale tanto para la IP pública automática como para la elástica. No hay alternativa razonable —sin IP pública no hay web—, pero conviene saberlo antes de mirar la factura.

> Revisar los precios reales al contratar: cambian a menudo y por región.

**Si el coste de después no compensa**, la alternativa es dejarlo todo en una sola máquina (`t2.micro` con MySQL dentro), que ronda los 9 $/mes. No es el caso elegido, pero conviene saber que existe.

---

## 1 · Contratar el dominio

Registra **`rbielsam.com`** en un registrador **al costo** (que venda sin extras ni subidas de precio). Es más barato que registrarlo en AWS y **viene con DNS incluido**, así que no hay que pagar una zona de Route 53.

**No apuntes todavía el dominio a nada.** Primero hay que crear la infraestructura y tener la **IP fija** (paso 2.3); si se apunta antes, el sitio se caerá cada vez que la instancia se reinicie. El registro DNS se configura al final, cuando ya existe la IP.

---

## 2 · Crear la infraestructura

### 2.1 · Región

Elige una región **europea**. **Milán (`eu-south-1`)** es la más cercana a España; `eu-west-3` (París) y `eu-central-1` (Fráncfort) también sirven.

**No cambies de región después**: mover la infraestructura cuesta dinero y tiempo.

### 2.2 · EC2 — el servidor

| Parámetro | Valor |
|---|---|
| Imagen | **Ubuntu Server 26.04 LTS** (la que se usó; 24.04 también sirve, pero PHP será 8.3) |
| Tipo | `t2.micro` (1 vCPU, 1 GB) |
| Almacenamiento | **8 GB** o más (hasta 30 GB incluidos) |
| Región | la elegida en 2.1 |

Al crearlo se genera un **par de claves** (`.pem`). **Guárdalo**: es la única forma de entrar. Si se pierde, hay que recrear la instancia.

### 2.3 · IP fija y apuntar el dominio

Asigna una **IP elástica** a la instancia. Sin ella, la dirección cambia al reiniciar y el dominio se rompe.

Con la IP en la mano, **configura el DNS** en el registrador, con un registro **A** para cada nombre:

| Registro | Apunta a |
|---|---|
| `@` (el dominio raíz) | la IP elástica |
| `www` | la misma IP elástica |

Esto **hay que hacerlo aquí, antes del paso 4.6**: Certbot comprueba que el dominio resuelve hacia el servidor para emitir el certificado, y si no resuelve, falla.

Puede tardar unos minutos en propagarse. Se comprueba con:

```bash
dig +short rbielsam.com
```

Debe devolver la IP elástica **antes** de continuar.

### 2.4 · RDS — la base de datos

| Parámetro | Valor |
|---|---|
| Motor | **MySQL** |
| Tamaño | `db.t3.micro` |
| VPC | **la misma VPC que el EC2** |
| Acceso público | **No** |
| Alta disponibilidad | **No** (cuesta el doble) |

Anota el **nombre del endpoint** (`xxxx.rds.amazonaws.com`), la base de datos, el usuario maestro y su contraseña. Esa contraseña no se guarda en el repositorio.

### 2.5 · S3 — las copias de seguridad

Crea un bucket **privado** para las copias:

- **Acceso público bloqueado**.
- Regla de ciclo de vida que **borre las copias antiguas** (por ejemplo, conservar 14 días).

### 2.6 · Rol de IAM

Crea un rol que pueda **escribir y borrar en ese bucket** y asígnalo a la instancia EC2. Así el servidor accede a S3 **sin tener claves de acceso guardadas en disco**, que si se cuelan quedan expuestas.

### 2.7 · Reglas de seguridad

| Puerto | Origen | Por qué |
|---|---|---|
| **80** y **443** | internet | la web |
| **22** | **solo tu IP** | el acceso SSH |
| **3306** | **solo la instancia EC2** | RDS, nunca desde internet |

**Comprobación obligatoria**: la base de datos **no debe responder** desde fuera del servidor. Si responde desde internet, la regla está mal puesta.

---

## 3 · Configurar el servidor

Entra por SSH:

```bash
ssh -i tu-clave.pem ubuntu@<IP-ELASTICA>
```

### 3.1 · Sistema y PHP

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx curl git unzip
sudo apt -y install php8.5-cli php8.5-fpm php8.5-mysql php8.5-mbstring \
    php8.5-xml php8.5-curl php8.5-gd php8.5-zip
```

> **La versión de PHP depende de la versión de Ubuntu.** Ubuntu 26.04 trae **PHP 8.5**; Ubuntu 24.04 traía 8.3. Comprueba cuál lleva tu servidor **antes** de teclear lo anterior:
>
> ```bash
> apt-cache search --names-only '^php[0-9.]+-cli$' | sort
> ```
>
> Y usa el que salga (por ejemplo `php8.4-cli`) en **todos** los sitios de esta guía donde aparezca: los paquetes y la ruta `/etc/php/X.Y/`. El proyecto admite `^8.3`, así que cualquier versión igual o superior sirve.

**`php8.5-cli` es imprescindible y no lo trae `php8.5-fpm`.** Sin él no existe el comando `php`, y por lo tanto no hay `php artisan` ni Composer.

| Paquete | Para qué |
|---|---|
| `php8.5-fpm` | ejecutar la web |
| `php8.5-cli` | `php artisan` y Composer |
| `php8.5-mysql` | conexión PDO a la base de datos |
| `php8.5-xml` | `dom`, `xml` y `xmlwriter`, que Laravel exige |
| `php8.5-mbstring` | texto multibyte |
| `php8.5-curl` | cliente HTTP y envío de correos |
| `php8.5-gd` | `intervention/image`, para las fotos |
| `php8.5-zip` | comprimir y extraer |

La lista se ha comprobado contra `composer check-platform-reqs`: es el mínimo que este proyecto necesita. **No** se instala `bcmath` ni `intl`: no los exige Composer y el código no los usa.

### 3.2 · nginx con PHP-FPM

Arranca PHP-FPM y nginx (nginx ya se instaló en el paso 3.1):

```bash
sudo systemctl enable --now php8.5-fpm nginx
```

Crea el sitio:

```bash
sudo tee /etc/nginx/sites-available/portfolio > /dev/null <<'NGINX'
server {
    listen 80;

    # El dominio se añade en el paso 4.6. El guion bajo actúa de comodín
    # para poder entrar por la IP elástica mientras tanto.
    server_name rbielsam.com www.rbielsam.com _;

    root /var/www/portfolio/Laravel/public;
    index index.html index.php;

    charset utf-8;

    # nginx admite 1 MB por defecto y la foto de perfil se valida en 2 MB
    # (max:2048 en UploadProfilePhotoRequest). Sin esto, nginx la rechaza
    # con un 413 antes de que Laravel llegue a verla.
    client_max_body_size 8m;

    access_log /var/log/nginx/portfolio-access.log;
    error_log  /var/log/nginx/portfolio-error.log;

    # Lo que no sea un fichero estático va al front controller de Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;

        # Sin estas dos, el login del panel no funciona. nginx no reenvía
        # por defecto estas cabeceras a PHP-FPM, y son las que transportan
        # el token de sesión de Sanctum y el CSRF. Equivalen a las líneas
        # RewriteCond/RewriteRule de Authorization y X-XSRF-Token del
        # .htaccess de Apache.
        fastcgi_param HTTP_AUTHORIZATION $http_authorization;
        fastcgi_param HTTP_X_XSRF_TOKEN  $http_x_xsrf_token;

        fastcgi_hide_header X-Powered-By;
    }

    # Los bundles llevan el hash en el nombre, así que cambian en cada
    # build: se pueden cachear un año sin riesgo de servir una versión vieja
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # El HTML cambia en cada publicación: nunca cachearlo, o se quedaría
    # apuntando a bundles que ya no existen
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # No servir ficheros ocultos (.git, .env, .htaccess…)
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo nginx -t && sudo systemctl reload nginx
```

> **Comprueba siempre `nginx -t` antes de recargar.** Si responde `test is successful`, recarga tranquilo; si falla, nginx sigue sirviendo la configuración anterior y no te quedas sin web.

**Sobre `index index.html index.php`**: es lo que hace que la raíz muestre **el portfolio** y no la página de bienvenida de Laravel. nginx busca `index.html` antes que `index.php`, y como `publicar.sh` copia el build de React ahí, la ruta `view('welcome')` de `routes/web.php` nunca se ejecuta.

> **Un 404 en la raíz es normal en este punto**: `/var/www/portfolio` todavía no existe, se crea en el paso 4.1. La web empezará a responder después de instalar la aplicación.

> **La caché de `index.html` es el fallo más típico al desplegar con nginx.** Si al actualizar la web se quedara vieja —o diera un 404 porque busca bundles que ya no existen—, comprueba que este bloque está tal cual.

### 3.3 · PHP-FPM para un servidor pequeño

Con 1 GB de memoria hay que limitar los procesos de PHP:

```bash
sudo sed -i 's/^pm = .*/pm = dynamic/' /etc/php/8.5/fpm/pool.d/www.conf
sudo sed -i 's/^pm.max_children = .*/pm.max_children = 3/' /etc/php/8.5/fpm/pool.d/www.conf
sudo sed -i 's/^pm.start_servers = .*/pm.start_servers = 1/' /etc/php/8.5/fpm/pool.d/www.conf
sudo sed -i 's/^pm.min_spare_servers = .*/pm.min_spare_servers = 1/' /etc/php/8.5/fpm/pool.d/www.conf
sudo sed -i 's/^pm.max_spare_servers = .*/pm.max_spare_servers = 2/' /etc/php/8.5/fpm/pool.d/www.conf
sudo systemctl restart php8.5-fpm
```

### 3.4 · Cliente de MySQL y AWS CLI

```bash
sudo apt -y install mysql-client awscli
```

### 3.5 · Composer

```bash
curl -sS https://getcomposer.org/installer | sudo php -- \
    --install-dir=/usr/local/bin --filename=composer
```

> **HTTPS se deja para el paso 4.6**, cuando la aplicación ya esté instalada: Certbot comprueba que el dominio sirve contenido, y con `DocumentRoot` vacío esa comprobación puede fallar.

---

## 4 · Instalar la aplicación

### 4.1 · Código

El servidor recibe el código **por rsync**, igual que hará después el script de publicación. Así no necesita credenciales de GitHub y lo que llega es exactamente lo que se ha probado aquí.

```bash
# En el SERVIDOR:
sudo mkdir -p /var/www/portfolio
sudo chown -R $USER:$USER /var/www/portfolio

# `storage/` se excluye del rsync, así que su estructura se crea a mano.
# Sin ella, `view:cache` del paso 4.3 falla.
mkdir -p /var/www/portfolio/Laravel/storage/app/public/photos
mkdir -p /var/www/portfolio/Laravel/storage/framework/cache/data
mkdir -p /var/www/portfolio/Laravel/storage/framework/sessions
mkdir -p /var/www/portfolio/Laravel/storage/framework/views
mkdir -p /var/www/portfolio/Laravel/storage/logs

# En ESTA máquina:
rsync -az Laravel/ ubuntu@<IP>:/var/www/portfolio/Laravel/ \
    --exclude .env --exclude storage --exclude vendor
```

> **`storage/` es del servidor**, no del repositorio: ahí viven las fotos, la caché y los registros. No se sincroniza desde aquí —con `--delete` borraría las fotos ya subidas—, por eso se crea su estructura a mano y se respeta siempre.

### 4.2 · Configuración de producción

**Se escribe desde cero.** Nunca se copia el `.env` de desarrollo.

```bash
cd /var/www/portfolio/Laravel
cp .env.example .env
```

Edita `.env` con los valores de producción:

| Variable | Valor |
|---|---|
| `APP_NAME` | `Portfolio` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | **`false`** |
| `APP_URL` | `https://rbielsam.com` |
| `APP_LOCALE` | `es` |
| `APP_KEY` | lo genera el paso 4.3 |
| `DB_HOST` | **el endpoint de RDS** |
| `DB_DATABASE` | el nombre de la base de datos |
| `DB_USERNAME` | el usuario de RDS |
| `DB_PASSWORD` | la contraseña de RDS |
| `SESSION_DRIVER` | se **deja** en `database` |
| `SESSION_DOMAIN` | se **deja** en `null` |
| `FILESYSTEM_DISK` | se **deja** en `local` |
| `MAIL_MAILER` | `resend` |
| `RESEND_API_KEY` | la clave de Resend |
| `MAIL_FROM_ADDRESS` | dirección del dominio propio, tras el paso 8 |

> `APP_DEBUG=false` es la variable que **evita que un error filtre trazas con todo lo configurado**. No se publica con `true`, ni por un rato.

### 4.3 · Dependencias, clave y migraciones

```bash
cd /var/www/portfolio/Laravel
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan storage:link
php artisan migrate --force
php artisan config:cache route:cache view:cache
```

> `storage:link` crea el enlace de almacenamiento. El que existía en desarrollo apuntaba a esta máquina por ruta absoluta y **no sirve en el servidor**.

### 4.4 · Usuario administrador

⚠️ **Este paso se ejecuta DESPUÉS del bloque 5, no antes.** La importación del paso 5 recrea las tablas con los datos reales —incluidos los 2 usuarios—, así que un administrador creado aquí **se perdería** en la importación.

```bash
php artisan portfolio:setup-admin
```

**Pide la contraseña a mano y no la deja escrita en ningún sitio.** Si se pierde, se recrea el usuario con tinker.

> Si se está montando una instancia **desde cero y sin importar datos**, este es el paso que crea el primer administrador.

### 4.5 · Permisos

```bash
cd /var/www/portfolio
sudo chown -R www-data:www-data Laravel/storage Laravel/bootstrap/cache
sudo chmod -R 775 Laravel/storage Laravel/bootstrap/cache
```

### 4.6 · HTTPS

Con la aplicación ya instalada, el directorio raíz existe y Certbot puede comprobar el dominio:

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d rbielsam.com -d www.rbielsam.com --redirect
```

Certbot añade el certificado, **reescribe el bloque de nginx** y programa la renovación. Comprueba ambas cosas:

```bash
sudo systemctl status certbot.timer
sudo nginx -t
```

**Comprobación**: `http://rbielsam.com` debe redirigir a `https://`.

> Si Certbot fallara por no llegar al dominio, el problema es el **DNS** (paso 2.3): `dig +short rbielsam.com` debe devolver la IP elástica.

> **Lo que Certbot no toca**: el bloque de `location /assets/` y el de `location = /index.html` que definiste en el 3.2 se mantienen. Si tras certificar se te olvidara alguno, la web podría cargar lenta o servir una versión vieja. Comprueba que siguen ahí.

---

## 5 · Migrar los datos

**Antes**, comprueba que **nadie esté editando el panel**: si alguien guarda algo mientras se copia, ese cambio se pierde.

Desde esta máquina, exporta:

```bash
mysqldump -u <usuario> -p --single-transaction portfolio > portfolio.sql
```

Sube y restaura en el servidor:

```bash
scp -i tu-clave.pem portfolio.sql ubuntu@<IP>:/tmp/
ssh -i tu-clave.pem ubuntu@<IP>
mysql -h <endpoint-rds> -u <usuario> -p <base-de-datos> < /tmp/portfolio.sql
rm /tmp/portfolio.sql
```

Sube además la foto de perfil. **No está en el repositorio** (Laravel excluye `storage/`) y el servidor no la tiene:

```bash
scp -i tu-clave.pem \
    Laravel/storage/app/public/photos/*.jpg \
    ubuntu@<IP>:/var/www/portfolio/Laravel/storage/app/public/photos/
```

> Si dijera que el directorio no existe, créalo antes en el servidor:
> `mkdir -p /var/www/portfolio/Laravel/storage/app/public/photos`

### Comprobar

| Dato | Esperado |
|---|---|
| formación | **1** |
| experiencia | **1** |
| proyectos | **0** |
| usuarios | **2** |
| mensajes | **1** |
| foto | `photos/vsbEUqMTiZ3qOqUCbvLo08rz7x3K7xuY.jpg` |

Y que **no** haya usuarios ni mensajes de prueba.

---

## 6 · Publicar

El build de React se hace **aquí, no en el servidor**: el servidor no instala Node, y lo que llega a producción es exactamente lo que ya se ha probado.

La primera vez, instala las dependencias del frontend:

```bash
cd React && npm ci
```

Y publica con el mismo script que se usará después para actualizar:

```bash
PORTFOLIO_SERVIDOR=ubuntu@<IP> ./deploy/publicar.sh
```

El script hace cinco cosas, en este orden:

1. **Comprueba que las pruebas están en verde** — frontend y backend. Si una falla, no publica nada.
2. **Compila el frontend** aquí.
3. **Sincroniza** el código de Laravel con el servidor —sin tocar su `.env` ni sus `vendor/`, y sin tocar `storage/`.
4. **Sincroniza el build**: `public/index.html` y `public/assets/`.
5. En el servidor, crea la estructura de `storage/`, instala dependencias de producción, aplica migraciones y refresca la caché.

> **Nunca** se sincroniza `React/dist/` entero contra `Laravel/public/`: con `--delete` borraría `index.php`, `.htaccess` y las fotos. El script solo toca las rutas propias del frontend, y además verifica en el servidor que `public/index.php` y `public/.htaccess` siguen ahí antes de continuar.
>
> *(Bajo nginx el `.htaccess` no se usa —Laravel lo trae por si se sirve con Apache—, pero sigue siendo una buena marca de integridad: si falta, es que el backend se ha tocado.)*

### ⚠️ Punto de más riesgo

En la raíz **debe aparecer el portfolio** —foto, nombre y navegación— y **no** la página de bienvenida de Laravel.

Laravel tiene una ruta que la devuelve, pero nginx sirve `index.html` antes que `index.php` gracias a `index index.html index.php` del paso 3.2, así que normalmente no aparece. **Compruébalo en el navegador.** Si saliera la página de Laravel, se retira esa ruta:

```bash
# Solo si hace falta. Quitar la ruta que devuelve view('welcome') en routes/web.php
php artisan route:clear route:cache
```

Ese cambio, si se necesita, **se hace en el repositorio, se prueba aquí y se publica**. No se edita en el servidor.

> Si la raíz cargara **lenta** o devolviera **404 por buscar bundles que ya no existen** (`/assets/index-*.js`), el problema no es Laravel: es la caché de `index.html`. Comprueba el bloque `location = /index.html` con `Cache-Control: no-cache` del paso 3.2, y vacía la caché del navegador.

---

## 7 · Copias de seguridad

El script `deploy/respaldo.sh` se copia al servidor y se programa en cron:

```bash
sudo cp deploy/respaldo.sh /usr/local/bin/respaldo-portfolio
sudo chmod +x /usr/local/bin/respaldo-portfolio
```

**No guarda credenciales**: lee la base de datos del `.env` de la aplicación. Solo hay que indicarle el bucket, añadiendo esta línea al `.env` del servidor:

```
PORTFOLIO_BUCKET=<nombre-del-bucket>
```

El script comprueba además que el archivo subido pesa lo mismo que el volcado local y **falla si no coincide**: un respaldo que no se verifica puede estar roto durante meses sin que nadie se dé cuenta.

> La **retención** principal se configura como **regla de ciclo de vida del bucket** (paso 2.5). El script limpia además los archivos que ya hubieran quedado fuera de plazo, por si el bucket no la tuviera.

Programar, por ejemplo, cada día a las 4:00:

```bash
sudo crontab -e
```

```
0 4 * * * /usr/local/bin/respaldo-portfolio >> /var/log/respaldo-portfolio.log 2>&1
```

> **Lo que esta copia NO cubre: las fotos.** Están en el disco del servidor y no se respaldan aquí — la respaldabilidad de imágenes es la spec 018, que las mueve a S3. Si se pierde el disco antes de esa spec, se pierden las fotos subidas desde el panel.

### ⚠️ Probar la restauración

**Una copia que nunca se ha probado no es una copia.** Restaura una vez en **una base de datos de prueba**, nunca en la real:

```bash
aws s3 cp s3://<bucket>/portfolio-<fecha>.sql.gz - | gunzip | \
    mysql -h <endpoint-rds> -u <usuario> -p portfolio_prueba
```

---

## 8 · Correo

Hoy el remitente es `onboarding@resend.dev`, que **solo llega a la propia cuenta de Resend**. Para que los mensajes lleguen de verdad:

1. En el panel del servicio de correo, **verifica el dominio**: te dará registros DNS (DKIM y SPF).
2. Añade esos registros en el **DNS del registrador**.
3. Espera a que se verifique.
4. Cambia en el `.env` **del servidor**:

   ```
   MAIL_FROM_ADDRESS=noreply@rbielsam.com
   ```

5. En el servidor, recarga la caché y comprueba:

   ```bash
   cd /var/www/portfolio/Laravel
   php artisan config:cache
   php artisan portfolio:test-email
   ```

**Comprobación real**: enviar el formulario desde el sitio publicado y **confirmar que el correo llega** y no acaba en la carpeta de correo no deseado.

---

## 9 · Actualizar

1. Hacer los cambios aquí, con sus pruebas.

2. Confirmar en git.

   ```bash
   git add -A && git commit
   ```

3. Publicar con el script, que hace **todo lo demás**:

   ```bash
   PORTFOLIO_SERVIDOR=ubuntu@<IP> ./deploy/publicar.sh
   ```

   El script comprueba que las pruebas están en verde, compila el frontend, sincroniza el código y el build, y en el servidor instala dependencias, aplica migraciones y refresca la caché. **Si una prueba falla, no publica nada.**

   Configuración (puede quedarse en el fichero en lugar de en la variable):

   | Variable | Por defecto |
   |---|---|
   | `PORTFOLIO_SERVIDOR` | obligatoria — `ubuntu@<IP>` |
   | `PORTFOLIO_CLAVE` | vacío si la clave ya está en el agente SSH |
   | `PORTFOLIO_RAIZ` | `/var/www/portfolio` |

4. **Comprobar la web**: la raíz debe mostrar el portfolio, no la página de Laravel.

### Si algo sale mal

El commit anterior sigue en el repositorio: se vuelve a él y se publica de nuevo.

```bash
git log --oneline
git checkout <commit-anterior>
PORTFOLIO_SERVIDOR=ubuntu@<IP> ./deploy/publicar.sh
```

### Si el script se niega a publicar

El script comprueba antes de tocar el servidor que reconoce la raíz del proyecto (`.git`, `React/` y `Laravel/`) y ejecuta **ambas** suites. Si algo falta o una prueba falla, **sale con código de salida y no publica nada**: eso es deliberado, no un fallo del script.

También se niega si en el servidor faltara `public/index.php` o `public/.htaccess` — es decir, si el backend estuviera ya roto; en ese caso no aplica cambios encima.

---

## 10 · Restaurar

Sigue el apartado **«Probar la restauración»** del paso 7, y siempre sobre **una base de datos de prueba** (`portfolio_prueba`). Solo cuando se confirme que el volcado es válido se aplica sobre la real.

Antes de restaurar sobre la real, haz una **copia de seguridad** del estado actual: una restauración no se puede deshacer.

---

## 11 · Comprobaciones finales

- [ ] `https://rbielsam.com` carga **sin aviso de sitio inseguro**.
- [ ] Por HTTP redirige a HTTPS.
- [ ] En la raíz aparece **el portfolio**, no la página de Laravel.
- [ ] El panel permite iniciar sesión y abrir **las seis vistas**.
- [ ] El cambio de idioma funciona y persiste.
- [ ] La foto se ve en la pública y en el panel.
- [ ] Los recuentos coinciden: **1 · 1 · 0 · 2 · 1**, sin registros de prueba.
- [ ] Un mensaje del formulario **llega al correo**.
- [ ] Hay copia automática **y se ha probado restaurarla**.
- [ ] Provocar un error **no** muestra trazas ni valores de entorno.
- [ ] La base de datos **no responde** desde internet.
- [ ] El repositorio no contiene claves.
