#!/usr/bin/env bash
# =============================================================================
# deploy/respaldo.sh — copia de seguridad de la base de datos hacia S3
#
# Se copia al servidor y se programa en cron. Lee la configuración del .env de
# Laravel que esté en RUTA_APP, así que no guarda credenciales en este fichero.
#
# Instalación en el servidor:
#   sudo cp deploy/respaldo.sh /usr/local/bin/respaldo-portfolio
#   sudo chmod +x /usr/local/bin/respaldo-portfolio
#   sudo crontab -e        →  0 4 * * * /usr/local/bin/respaldo-portfolio >> /var/log/respaldo-portfolio.log 2>&1
#
# Restaurar (siempre en una base de datos de prueba primero):
#   aws s3 cp s3://<bucket>/<archivo> - | gunzip | mysql -h <endpoint> -u <usuario> -p <base>
# =============================================================================

set -euo pipefail

# --- CONFIGURACIÓN -----------------------------------------------------------
RUTA_APP="${RUTA_APP:-/var/www/portfolio/Laravel}"
BUCKET="${PORTFOLIO_BUCKET:-}"          # nombre del bucket de copias
DIAS_KEEPS3="${PORTFOLIO_DIAS_KEEPS3:-14}"   # retención si no hay ciclo de vida en el bucket
# -----------------------------------------------------------------------------

FECHA="$(date +%Y%m%d-%H%M%S)"
NOMBRE="portfolio-${FECHA}.sql.gz"
ENV="$RUTA_APP/.env"
TMP="$(mktemp /tmp/respaldo-portfolio.XXXXXX.sql.gz)"
trap 'rm -f "$TMP"' EXIT

echo "════════════════════════════════════════════════════════════════"
echo "$(date '+%Y-%m-%d %H:%M:%S')  Inicio del respaldo"

# 1 · Comprobaciones ----------------------------------------------------------
if [[ ! -f "$ENV" ]]; then
    echo "✗ No existe $ENV. ¿Está instalada la aplicación?"
    exit 1
fi

# Lee un valor del .env sin enseñarlo por pantalla.
leer_env() {
    sed -n "s/^${1}=//p" "$ENV" | tail -1 | tr -d '"' | tr -d "'"
}

export MYSQL_PWD="$(leer_env DB_PASSWORD)"
DB_HOST="$(leer_env DB_HOST)"
DB_USER="$(leer_env DB_USERNAME)"
DB_NAME="$(leer_env DB_DATABASE)"

if [[ -z "$BUCKET" ]]; then
    BUCKET="$(leer_env PORTFOLIO_BUCKET)"
fi

if [[ -z "$DB_HOST" || -z "$DB_USER" || -z "$DB_NAME" ]]; then
    echo "✗ Faltan datos de base de datos en $ENV (DB_HOST, DB_USERNAME, DB_DATABASE)."
    exit 1
fi

if [[ -z "$BUCKET" ]]; then
    echo "✗ Falta el nombre del bucket."
    echo "  Exporta PORTFOLIO_BUCKET o añade PORTFOLIO_BUCKET=<nombre> al .env"
    exit 1
fi

# 2 · Volcado -----------------------------------------------------------------
echo "→ Volcando $DB_NAME desde $DB_HOST"
# --set-gtid-purged=OFF: en RDS los GTID vienen activos y, con el valor por
# defecto (AUTO), mysqldump ejecuta FLUSH TABLES WITH READ LOCK para capturar
# la posición GTID, y RDS lo bloquea con un 1045. Con OFF no hace falta ese
# bloqueo y el volcado sigue siendo consistente gracias a --single-transaction.
mysqldump \
    --host="$DB_HOST" \
    --user="$DB_USER" \
    --single-transaction \
    --set-gtid-purged=OFF \
    --quick \
    --routines \
    --triggers \
    --events \
    "$DB_NAME" | gzip > "$TMP"

TAMANIO="$(du -h "$TMP" | cut -f1)"
FILAS="$(gzip -dc "$TMP" | grep -c '^INSERT INTO' || true)"
echo "  Volcado generado: $TAMANIO, $FILAS tablas con datos"

if [[ ! -s "$TMP" ]]; then
    echo "✗ El volcado está vacío: no se sube nada."
    exit 1
fi

# 3 · Subida a S3 -------------------------------------------------------------
echo "→ Subiendo a s3://$BUCKET/$NOMBRE"
aws s3 cp "$TMP" "s3://$BUCKET/$NOMBRE" --only-show-errors

# 4 · Retención ---------------------------------------------------------------
# El ciclo de vida del bucket es lo principal. Esto limpia además los que ya
# hubieran quedado fuera de plazo por si el bucket no lo tiene configurado.
echo "→ Conservando los últimos $DIAS_KEEPS3 días"
LIMITE="$(date -d "-${DIAS_KEEPS3} days" +%Y%m%d-%H%M%S 2>/dev/null || date -v-"${DIAS_KEEPS3}"d +%Y%m%d-%H%M%S)"

for f in $(aws s3 ls "s3://$BUCKET/" | awk '{print $4}' | grep '^portfolio-' | sort); do
    FECHA_FICHERO="$(echo "$f" | sed -E 's/^portfolio-([0-9]{8}-[0-9]{6})\.sql\.gz$/\1/')"
    if [[ "$FECHA_FICHERO" < "$LIMITE" ]]; then
        echo "  borrando $f"
        aws s3 rm "s3://$BUCKET/$f" --only-show-errors
    fi
done

# 5 · Verificación ------------------------------------------------------------
# Se comprueba que el archivo existe en S3 y pesa lo mismo. Un respaldo que no
# se verifica puede fallar en silencio durante meses.
REMOTE="$(aws s3 ls "s3://$BUCKET/$NOMBRE" | awk '{print $3}')"
LOCAL="$(stat -c%s "$TMP" 2>/dev/null || stat -f%z "$TMP")"

if [[ "$REMOTE" != "$LOCAL" ]]; then
    echo "✗ El tamaño en S3 ($REMOTE) no coincide con el local ($LOCAL)."
    exit 1
fi

echo "✅ Respaldo completado: $NOMBRE ($TAMANIO)"
echo "════════════════════════════════════════════════════════════════"
