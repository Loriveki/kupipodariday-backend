# КупиПодариДай

## 🚀 О проекте  
Backend для сервиса вишлистов «КупиПодариДай», реализованный на NestJS, TypeScript и PostgreSQL. Позволяет пользователям создавать списки желаемых подарков, скидываться на подарки других, управлять профилями и тематическими подборками. Поддерживает регистрацию, авторизацию, валидацию и интеграцию с фронтендом.

## ✨ Функциональность  
🔹 API роуты:  
&nbsp;&nbsp;&nbsp;&nbsp;POST /auth/signup — регистрация.  
&nbsp;&nbsp;&nbsp;&nbsp;POST /auth/signin — авторизация.  
&nbsp;&nbsp;&nbsp;&nbsp;GET /users, /users/:id, /users/me — просмотр пользователей и профилей.  
&nbsp;&nbsp;&nbsp;&nbsp;PATCH /users/me — редактирование профиля.  
&nbsp;&nbsp;&nbsp;&nbsp;GET /wishes, POST /wishes, PATCH /wishes/:id, DELETE /wishes/:id — CRUD для подарков.  
&nbsp;&nbsp;&nbsp;&nbsp;GET /wishlists, POST /wishlists, PATCH /wishlists/:id, DELETE /wishlists/:id — CRUD для вишлистов.  
&nbsp;&nbsp;&nbsp;&nbsp;POST /offers — заявки на скидывание на подарок.  
&nbsp;&nbsp;&nbsp;&nbsp;GET /wishes/top — 20 популярных подарков.  
&nbsp;&nbsp;&nbsp;&nbsp;GET /wishes/last — 40 последних подарков.  
&nbsp;&nbsp;&nbsp;&nbsp;GET /users/find — поиск пользователей по username или email.  
🔹 PostgreSQL — база kupipodariday, схемы:  
&nbsp;&nbsp;&nbsp;&nbsp;user — username, about, avatar, email, password, связи с wishes, offers, wishlists.  
&nbsp;&nbsp;&nbsp;&nbsp;wish — name, link, image, price, raised, owner, description, offers, copied.  
&nbsp;&nbsp;&nbsp;&nbsp;wishlist — name, description, image, items.  
&nbsp;&nbsp;&nbsp;&nbsp;offer — user, item, amount, hidden.  
🔹 Авторизация — JWT (Passport, local и jwt стратегии).  
🔹 Валидация — class-validator для тел запросов, TypeORM для схем (URL, строки, числа).  
🔹 Ошибки — 400 (некорректные данные), 401 (неавторизован), 403 (запрещено), 404 (не найдено), 409 (конфликт).  
🔹 ESLint — линтинг кода.

## 🛠 Используемые технологии

🔹 NestJS  
🔹 TypeScript  
🔹 PostgreSQL/TypeORM  

## 📦 Структура проекта:
🔹 src/ — исходный код:  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 auth/ — авторизация и регистрация.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 email/ — отправка email (для заявок).  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 filters/ — обработка ошибок.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 hash/ — хеширование паролей.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 offers/ — логика заявок на скидывание.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 users/ — управление пользователями и профилями.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 wishes/ — управление подарками.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 wishlists/ — управление списками подарков.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 app.controller.ts — базовый контроллер.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 app.module.ts — корневой модуль.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 configuration.ts — настройки.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 main.ts — запуск приложения.  
🔹 .eslintrc — настройки ESLint.  
🔹 package.json, package-lock.json — скрипты, зависимости.  
🔹 tsconfig.json — настройки TypeScript.

## 📥 Установка и запуск

1. Склонируйте репозиторий:
```
git clone https://github.com/Loriveki/kupipodariday-backend.git
```

2. Установите зависимости:
```
npm install
```

3. Создайте базу PostgreSQL kupipodariday и настройте доступ для пользователя student.
 ```
psql -U postgres -c "CREATE DATABASE kupipodariday;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kupipodariday TO student;"
```

5. Запустите сервер в режиме разработки:
```
npm run dev
```

5. Скомпилируйте проект:
```
npm run build
```

6. Проверьте код на ошибки линтера:
```
npm run lint
```

## 📬 Контакты

👩‍💻 Автор: Анастасия
