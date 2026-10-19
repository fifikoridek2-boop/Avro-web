// Telegram Bot Dispatcher for Avro Web APIs
// Uses Telegram Bot API with HTML parse_mode and expandable blockquotes

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendTelegramNotification(htmlMessage, inlineKeyboard = null) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram] Notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID is not configured.');
    return { sent: false, reason: 'unconfigured' };
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: htmlMessage,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (inlineKeyboard && Array.isArray(inlineKeyboard) && inlineKeyboard.length > 0) {
    payload.reply_markup = {
      inline_keyboard: inlineKeyboard
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('[Telegram] API error:', data);
      return { sent: false, error: data.description };
    }

    return { sent: true, messageId: data.result?.message_id };
  } catch (err) {
    console.error('[Telegram] Network dispatch failed:', err);
    return { sent: false, error: err.message };
  }
}
