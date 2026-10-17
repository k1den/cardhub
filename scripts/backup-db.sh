#!/bin/bash
# ==============================================================================
# CardHub - Скрипт автоматического резервного копирования PostgreSQL
# ==============================================================================
# Возможности:
# 1. Дамп базы данных через Docker контейнер cardhub-db или локальный pg_dump
# 2. Сжатие в gzip на лету (.sql.gz)
# 3. Вычисление контрольной суммы SHA-256 для проверки целостности
# 4. Автоматическая ротация: удаление дампов старше 7 дней
# 5. Ведение журнала /var/log/cardhub-backup.log или backups/backup.log
# ==============================================================================

set -euo pipefail

# Директория проекта (определяется автоматически)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups/postgres"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Параметры подключения к базе данных (по умолчанию совпадают с docker-compose.prod.yml)
CONTAINER_NAME="cardhub-db"
DB_NAME="${POSTGRES_DB:-cardhub}"
DB_USER="${POSTGRES_USER:-cardhub}"

# Временная метка
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILENAME="cardhub_backup_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
CHECKSUM_FILEPATH="${BACKUP_FILEPATH}.sha256"

# Создаем папку для бэкапов
mkdir -p "$BACKUP_DIR"

log() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] $1"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE"
}

log "=================================================="
log "Начало процесса резервного копирования базы ${DB_NAME}..."

# Способ создания дампа: проверяем запущен ли Docker контейнер cardhub-db
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log "Используется контейнер Docker: ${CONTAINER_NAME}"
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILEPATH"
elif command -v pg_dump >/dev/null 2>&1; then
    log "Используется локальная утилита pg_dump"
    pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILEPATH"
else
    log "ОШИБКА: Ни контейнер Docker '${CONTAINER_NAME}', ни утилита 'pg_dump' не найдены!"
    exit 1
fi

# Проверяем, что файл создан и не пустой
if [ ! -s "$BACKUP_FILEPATH" ]; then
    log "ОШИБКА: Файл резервной копии пуст или не был создан!"
    rm -f "$BACKUP_FILEPATH"
    exit 1
fi

# Подсчет размера
FILE_SIZE=$(du -h "$BACKUP_FILEPATH" | cut -f1)
log "Дамп успешно создан: ${BACKUP_FILENAME} (размер: ${FILE_SIZE})"

# Подсчет SHA-256 контрольной суммы
if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$BACKUP_FILEPATH" > "$CHECKSUM_FILEPATH"
    log "Контрольная сумма SHA-256 сохранена в ${BACKUP_FILENAME}.sha256"
fi

# Ротация: удаляем бэкапы старше 7 дней
log "Выполняется проверка ротации (удаление копий старше 7 дней)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "cardhub_backup_*.sql.gz*" -mtime +7 | wc -l)
find "$BACKUP_DIR" -name "cardhub_backup_*.sql.gz*" -mtime +7 -delete

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Удалено старых копий: ${DELETED_COUNT}"
else
    log "Старых копий для удаления не обнаружено."
fi

log "Резервное копирование успешно завершено!"
log "=================================================="
