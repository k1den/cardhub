#!/bin/bash
# ==============================================================================
# CardHub - Let's Encrypt SSL Bootstrap Script
# ==============================================================================
# Использование:
#   chmod +x scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh cardhub.ru admin@cardhub.ru
# ==============================================================================

set -e

DOMAIN=${1:-""}
EMAIL=${2:-""}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Ошибка: укажите домен и email!"
    echo "Пример: ./scripts/init-letsencrypt.sh cardhub.ru admin@cardhub.ru"
    exit 1
fi

echo "==> Инициализация SSL Let's Encrypt для $DOMAIN ($EMAIL)..."

# Создаем папки
mkdir -p nginx/certbot/conf/live/$DOMAIN
mkdir -p nginx/certbot/www

# Проверяем, есть ли уже сертификат
if [ -f "nginx/certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "Сертификат для $DOMAIN уже существует."
    exit 0
fi

echo "==> Создание временного самоподписанного сертификата для первого старта Nginx..."
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "nginx/certbot/conf/live/$DOMAIN/privkey.pem" \
    -out "nginx/certbot/conf/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=localhost"

echo "==> Запуск Nginx..."
docker compose -f docker-compose.prod.yml up -d nginx

echo "==> Удаление временного сертификата перед запросом к Let's Encrypt..."
rm -rf "nginx/certbot/conf/live/$DOMAIN"

echo "==> Запрос боевого сертификата Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "==> Обновление путей SSL в конфигурации Nginx (nginx/conf.d/cardhub.conf)..."
sed -i "s|/etc/nginx/ssl/cert.pem|/etc/letsencrypt/live/$DOMAIN/fullchain.pem|g" nginx/conf.d/cardhub.conf || true
sed -i "s|/etc/nginx/ssl/key.pem|/etc/letsencrypt/live/$DOMAIN/privkey.pem|g" nginx/conf.d/cardhub.conf || true

echo "==> Перезагрузка Nginx для применения боевого SSL..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "==> Готово! Сертификат Let's Encrypt успешно установлен и будет обновляться автоматически."
