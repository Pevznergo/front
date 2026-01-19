# План реализации Реферальной Системы

## 1. База Данных (Schema Updates)

### 1.1 Таблица `User`
-   **Новые поля:**
    -   `referral_code` (VARCHAR, UNIQUE): Уникальный код приглашения.

### 1.2 Новая таблица `referrals`
Хранит связи между пользователями.
-   `id` (SERIAL PK)
-   `referrer_id` (VARCHAR/BIGINT): Кто пригласил.
-   `referred_id` (VARCHAR/BIGINT): Кого пригласили (UNIQUE).
-   `status` (VARCHAR): 'registered', 'pro_upgraded'.
-   `reward_amount` (INTEGER): Сколько начислено бонусов за этого реферала.
-   `created_at` (TIMESTAMP)

### 1.3 Новая таблица `withdrawals`
Хранит заявки на вывод средств.
-   `id` (SERIAL PK)
-   `user_id` (VARCHAR/BIGINT): Кто запрашивает.
-   `amount` (INTEGER): Сумма токенов (минимум 2000).
-   `status` (VARCHAR): 'pending' (ожидает), 'completed' (выплачено), 'rejected'.
-   `contact_info` (TEXT): Email или @username для связи (берем из профиля).
-   `created_at` (TIMESTAMP)

## 2. Backend API & Logic

### 2.1. Авторизация (`app/api/webapp/auth/route.ts`)
-   Проверяем `start_param`.
-   Если `start_param` == `referral_code` и пользователю создается аккаунт:
    -   Создаем запись в `referrals`.
    -   Начисляем **30 points** рефереру (обновляем `User.points` реферера).

### 2.2. Генерация ссылки (`app/api/webapp/referral/route.ts`)
-   **GET:** Возвращает `referral_code`, ссылку, кол-во рефералов, заработанные токены.

### 2.3. Обработка оплаты PRO (Webhook)
-   При оплате проверяем наличие записи в `referrals` для этого юзера.
-   Если есть -> Начисляем **1000 токенов (Credits/Balance)** рефереру.
-   Обновляем статус в `referrals` на 'pro_upgraded'.

### 2.4. Вывод средств (`app/api/webapp/withdraw/route.ts`)
-   **POST:** Запрос на вывод.
-   Проверка: Баланс токенов >= 2000.
-   Действие:
    -   Списываем токены с баланса пользователя.
    -   Создаем запись в `withdrawals` со статусом 'pending'.
    -   Возвращаем успех.

## 3. Frontend (WebApp)

### 3.1. `TasksModal.tsx`
-   **Скрыть раздел "Игры".**
-   Добавить задание "Приведи друга".

### 3.2. `ReferralModal.tsx`
-   Информация и ссылка.
-   Кнопка "Вывести" (активна если >= 2000).
-   **Logic:** При нажатии "Вывести" -> API call -> Показ сообщения "Заявка отправлена, с вами свяжутся через email или Telegram".

## 4. Admin Panel (`front/app/admin`)

### 4.1. Новая вкладка "Выплаты" (Payouts)
-   Таблица заявок из `withdrawals`.
-   Колонки: Дата, Юзер, Сумма, Статус, Контакты.
-   Действия: Кнопка "Выплачено" (меняет статус на completed), "Отклонить".

### 4.2. Уведомление (Badge)
-   В меню навигации админки, рядом с ссылкой "Выплаты", отображать **Красный кружок** (Badge), если есть заявки со статусом 'pending'.
