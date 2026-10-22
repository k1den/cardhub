#!/bin/bash
# ==============================================================================
# CardHub - Скрипт автоматического развертывания / обновления в Production
# ==============================================================================
# Использование:
#   chmod +x scripts/deploy-prod.sh
#   ./scripts/deploy-prod.sh
# ==============================================================================

set -e

echo "🚀 [1/6] Проверка окружения..."
if [ ! -f ".env" ]; then
    echo "❌ Ошибка: файл .env не найден в корне проекта!"
    echo "Скопируйте .env.production.example в .env и заполните переменные."
    exit 1
fi

echo "📦 [2/6] Сборка и запуск контейнеров Docker Compose..."
docker compose -f docker-compose.prod.yml up -d --build

echo "⏳ [3/6] Ожидание готовности базы данных PostgreSQL..."
until docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U cardhub > /dev/null 2>&1; do
    echo "  Ожидание подключения к БД (5 сек)..."
    sleep 5
done
echo "  ✓ База данных PostgreSQL готова к работе."

echo "🗄️  [4/6] Применение миграций схемы базы данных (Prisma Migrate)..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

echo "🌱 [5/6] Инициализация системных данных и тарифных планов (Prisma Seed)..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma db seed || true

echo "🔍 [6/6] Проверка статуса сервисов и Health Check..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=============================================================================="
echo "✅ CardHub успешно запущен в продакшен!"
echo "=============================================================================="
echo "Полезные команды:"
echo "  • Проверить логи приложения: docker compose -f docker-compose.prod.yml logs -f app"
echo "  • Назначить администратора:  docker compose -f docker-compose.prod.yml exec app npm run admin:promote admin@ваш-домен.ru"
echo "  • Проверить здоровье API:    curl -k https://localhost/api/health"
echo "=============================================================================="
