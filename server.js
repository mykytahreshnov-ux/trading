import express from "express";

const app = express();

// Принимаем сырое тело запроса как текст — TradingView не всегда
// шлёт корректный Content-Type: application/json, поэтому парсим
// JSON вручную ниже, с запасным вариантом на случай, если это не JSON.
app.use(express.text({ type: "*/*" }));

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!BOT_TOKEN || !CHAT_ID || !WEBHOOK_SECRET) {
  console.warn(
    "Внимание: не заданы переменные окружения TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID / WEBHOOK_SECRET. " +
      "Задай их в настройках Railway (Variables), иначе бот не сможет присылать сообщения."
  );
}

function formatMessage(raw) {
  try {
    const data = JSON.parse(raw);
    const side = String(data.side || "").toLowerCase();
    const emoji = side === "long" ? "🟢" : side === "short" ? "🔴" : "⚪";
    const dir =
      side === "long" ? "LONG" : side === "short" ? "SHORT" : (data.side || "SIGNAL");

    if (data.type === "sweep") {
      const lines = [`⚠️ SWEEP ${emoji} ${dir} ${data.symbol || ""}`.trim()];
      lines.push("Это только свип уровня, не сигнал на вход — ждём подтверждения");
      if (data.price !== undefined) lines.push(`Цена: ${data.price}`);
      lines.push(`Время: ${new Date().toISOString()}`);
      return lines.join("\n");
    }

    const lines = [`${emoji} ${dir} ${data.symbol || ""}`.trim()];
    if (data.price !== undefined) lines.push(`Вход: ${data.price}`);
    if (data.sl !== undefined) lines.push(`Stop-Loss: ${data.sl}`);
    if (data.model) lines.push(`Модель: ${data.model}`);
    lines.push(`Время: ${new Date().toISOString()}`);
    return lines.join("\n");
  } catch (e) {
    // Пришло что-то не в формате JSON — просто пересылаем как есть
    return `Новый сигнал от TradingView:\n${raw}`;
  }
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Ошибка отправки сообщения в Telegram:", resp.status, errText);
  }
  return resp.ok;
}

// TradingView шлёт POST на этот адрес при срабатывании алерта.
// Секрет зашит прямо в путь URL, т.к. TradingView не позволяет
// добавлять свои заголовки (headers) к вебхуку.
app.post("/webhook/:secret", async (req, res) => {
  if (req.params.secret !== WEBHOOK_SECRET) {
    return res.status(403).send("forbidden");
  }

  const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  console.log("Получен алерт от TradingView:", raw);

  try {
    await sendTelegramMessage(formatMessage(raw));
    res.status(200).send("ok");
  } catch (e) {
    console.error("Ошибка обработки вебхука:", e);
    res.status(500).send("error");
  }
});

// Простая страница проверки, что сервис живой
app.get("/", (_req, res) => {
  res.send("Sweep&Confirm webhook bot работает.");
});

app.listen(PORT, () => {
  console.log(`Сервер запущен, слушает порт ${PORT}`);
});
