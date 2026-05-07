# Smart Remont — Интерактивный каталог товаров

Веб-приложение для просмотра и покупки товаров для ремонта. Включает каталог с фильтрацией и поиском, корзину, сравнение товаров и аутентификацию пользователей.

## Стек технологий

**Backend**
- Python 3.11+, FastAPI, SQLAlchemy (async), Alembic
- PostgreSQL, asyncpg
- JWT-аутентификация (python-jose, bcrypt)

**Frontend**
- Next.js 16, React 19
- Tailwind CSS, Axios
- React Toastify, Lucide React

---

## Структура проекта

```
smart-remont-app/
├── backend/       # FastAPI приложение
└── frontend/      # Next.js приложение
```

---

## Запуск Backend

### 1. Перейдите в папку backend

```bash
cd backend
```

### 2. Создайте и активируйте виртуальное окружение

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 3. Установите зависимости

```bash
pip install -r requirements.txt
```

### 4. Создайте файл `.env`

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/smart_remont
SECRET_KEY=your-secret-key
```

### 5. Примените миграции

```bash
alembic upgrade head
```

### 6. (Опционально) Заполните БД тестовыми данными

```bash
python seed.py
```

### 7. Запустите сервер

```bash
uvicorn app.main:app --reload
```

API будет доступен по адресу: [http://localhost:8000](http://localhost:8000)  
Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Запуск Frontend

### 1. Перейдите в папку frontend

```bash
cd frontend
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Создайте файл `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Запустите приложение в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)

---

## Основные возможности

- Каталог товаров с фильтрацией по категории, цене и поиском
- Пагинация и виртуализация списка товаров
- Корзина с управлением количеством
- Сравнение товаров
- Регистрация и авторизация (JWT)
- Адаптивный интерфейс (Tailwind CSS)
