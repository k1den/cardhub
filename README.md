# CardHub — Сервис цифровых NFC-визиток

Сервис для создания и распространения современных цифровых визиток с поддержкой коротких ссылок, QR-кодов и бесконтактных NFC-меток (NTAG213/215/216).

---

## 🛠 Технологический стек

- **Фреймворк:** Next.js (App Router, React 19, TypeScript)
- **Стилизация:** Tailwind CSS
- **База данных:** PostgreSQL 16+ (Prisma ORM)
- **Кэширование и Rate Limiting:** Redis / In-memory fallback
- **Безопасность:** Argon2id (`@node-rs/argon2`), серверные HttpOnly сессии, TOTP 2FA
- **Тестирование:** Vitest
- **Контейнеризация:** Docker, Docker Compose

---

## 🚀 Быстрый запуск для разработки

### 1. Требования
- Node.js 20+ (рекомендуется 22 или 24)
- PostgreSQL 16+ (локально или через Docker)

### 2. Установка зависимостей
```bash
npm install --legacy-peer-deps
```

### 3. Настройка окружения
Скопируйте пример файла конфигурации:
```bash
cp .env.example .env
```
Убедитесь, что в `.env` указаны корректные параметры `DATABASE_URL` и `SESSION_SECRET`.

### 4. Применение миграций базы данных
```bash
npx prisma migrate dev
```

### 5. Запуск сервера разработки
```bash
npm run dev
```
Приложение откроется по адресу [http://localhost:3000](http://localhost:3000).

---

## 🧪 Запуск тестов

```bash
# Однократный прогон всех тестов
npm test

# Запуск тестов в режиме наблюдателя
npm run test:watch
```

---

## 🐳 Запуск через Docker Compose

Для запуска сервисов приложения, PostgreSQL и Redis в контейнерах:
```bash
docker compose up -d
```

---

## 📜 Документация и стандарты

- [TZ_NFC_vizitki.md](./TZ_NFC_vizitki.md) — Исходное техническое задание.
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) — Чек-лист подготовки и вывода проекта в боевой продакшен.
- [SECURITY.md](./SECURITY.md) — Политика безопасности, соответствие OWASP ASVS и 152-ФЗ.
- [DECISIONS.md](./DECISIONS.md) — Журнал архитектурных решений (ADR).
