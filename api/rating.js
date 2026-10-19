import { sendTelegramNotification, escapeHtml } from './telegram.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const {
      rating = 0,
      name = '',
      email = '',
      comment = '',
      appVersion = 'unknown',
      versionCode = 0,
      device = '',
      ts = Date.now()
    } = body || {};

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ accepted: false, error: 'Rating must be an integer between 1 and 5.' });
    }

    const feedbackId = 'rate_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

    // Build rich Telegram message with stars, formatting, and expandable blockquote
    const stars = '⭐'.repeat(numericRating) + '☆'.repeat(5 - numericRating);
    const formattedDate = new Date(ts).toLocaleString('en-US', { timeZone: 'UTC' });

    const telegramHtml = `
<b>🌟 New Avro User Rating</b>
━━━━━━━━━━━━━━━━━━
<b>Score:</b> ${stars} (<code>${numericRating}/5</code>)
<b>User:</b> <code>${escapeHtml(name ? name.trim() : 'Anonymous')}</code>
<b>Email:</b> ${email && email.trim() ? `<code>${escapeHtml(email.trim())}</code>` : '<i>Not provided</i>'}
<b>Device:</b> <code>${escapeHtml(device || 'Unknown')}</code>
<b>App Version:</b> <code>v${escapeHtml(appVersion)} (${versionCode})</code>
<b>Feedback ID:</b> <code>${feedbackId}</code>
<b>Date:</b> <code>${formattedDate} UTC</code>
━━━━━━━━━━━━━━━━━━
<b>User Comment:</b>
<blockquote expandable>${escapeHtml(comment && comment.trim() ? comment.trim() : 'No comment provided.')}</blockquote>
`.trim();

    // Valid HTTPS buttons only (Telegram strictly disallows mailto: in inline buttons)
    const keyboard = [
      [
        { text: '🌐 Avro Web Portal', url: 'https://avro-app.vercel.app' },
        { text: '📂 GitHub Repository', url: 'https://github.com/fifikoridek2-boop/Avro' }
      ]
    ];

    // Dispatch notification to Admin Telegram
    await sendTelegramNotification(telegramHtml, keyboard);

    return res.status(200).json({
      accepted: true,
      message: {
        id: feedbackId,
        text: 'Thank you for rating Avro! Your feedback helps Akio co improve future releases.'
      }
    });
  } catch (err) {
    console.error('Error processing rating submission:', err);
    return res.status(500).json({ accepted: false, error: 'Internal Server Error' });
  }
}
