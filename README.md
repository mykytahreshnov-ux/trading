# Sweep&Confirm → Telegram

Маленький сервер: принимает вебхук от TradingView (когда срабатывает алерт
по индикатору Sweep&Confirm) и пересылает сигнал сообщением в Telegram.

## Шаг 1. Создать Telegram-бота

1. Открой Telegram, найди **@BotFather**.
2. Отправь ему `/newbot`.
3. Придумай имя бота (любое) и username (должен заканчиваться на `bot`,
   например `sweep_confirm_alerts_bot`).
4. BotFather пришлёт токен вида `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   — сохрани его, он понадобится ниже.

## Шаг 2. Узнать свой chat_id

1. Напиши своему новому боту любое сообщение (например "привет") — просто
   открой с ним чат и отправь текст.
2. Открой в браузере (вставив свой токен вместо `<TOKEN>`):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. В ответе (JSON) найди `"chat":{"id":123456789, ...}` — число рядом с
   `"id"` внутри `"chat"` и есть твой `chat_id`.

## Шаг 3. Залить код на GitHub

1. Создай новый репозиторий на github.com (например `sweep-confirm-bot`).
2. Загрузи в него все файлы из этой папки — проще всего через
   "Add file → Upload files" прямо на сайте GitHub (перетащи все файлы,
   кроме `.env.example` можно тоже загрузить, `.env` создавать не нужно).

## Шаг 4. Задеплоить на Railway

1. Зайди на railway.app, залогинься (можно через GitHub-аккаунт).
2. New Project → Deploy from GitHub repo → выбери репозиторий из шага 3.
3. После того как проект создался, зайди в раздел **Variables** и добавь
   три переменные (значения из шагов 1–2, третье придумай сам — любая
   случайная строка, чем длиннее и бессмысленнее, тем лучше):
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `WEBHOOK_SECRET`
4. В разделе **Settings → Networking** нажми **Generate Domain** — получишь
   публичный адрес вида `https://xxxxx.up.railway.app`.

## Шаг 5. Финальный адрес для TradingView

Собери итоговый Webhook URL по формуле:

```
https://xxxxx.up.railway.app/webhook/ТВОЙ_WEBHOOK_SECRET
```

(домен из шага 4 + `/webhook/` + значение WEBHOOK_SECRET из шага 4)

Пришли этот адрес — я вставлю его в уже созданный алерт на TradingView,
и сигналы начнут приходить в Telegram автоматически.
