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
      packageName = 'com.newoether.agora',
      trace = '',
      appVersion = 'unknown',
      versionCode = 0,
      androidApi = 0,
      androidRelease = '',
      device = '',
      ts = Date.now(),
      breadcrumbs = []
    } = body || {};

    if (!trace || trace.length < 5) {
      return res.status(400).json({ accepted: false, error: 'Invalid or missing stack trace.' });
    }

    const crashId = 'crash_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const formattedDate = new Date(ts).toLocaleString('en-US', { timeZone: 'UTC' });

    // Truncate stack trace to stay safely under Telegram 4096 character limit
    const cleanTrace = trace.length > 2400 ? trace.substring(0, 2400) + '\n... [trace truncated]' : trace;

    const trailLines = Array.isArray(breadcrumbs) && breadcrumbs.length > 0
      ? breadcrumbs.slice(-6).map(b => `• <code>${escapeHtml(b)}</code>`).join('\n')
      : '<i>No trail breadcrumbs available</i>';

    const telegramHtml = `
<b>🚨 Avro Crash Report Ingested</b>
━━━━━━━━━━━━━━━━━━
<b>Package:</b> <code>${escapeHtml(packageName)}</code>
<b>App Version:</b> <code>v${escapeHtml(appVersion)} (${versionCode})</code>
<b>Device:</b> <code>${escapeHtml(device || 'Unknown')}</code>
<b>Android:</b> <code>API ${androidApi} (Android ${escapeHtml(androidRelease)})</code>
<b>Crash ID:</b> <code>${crashId}</code>
<b>Date:</b> <code>${formattedDate} UTC</code>
━━━━━━━━━━━━━━━━━━
<b>Recent Diagnostic Trail:</b>
${trailLines}
━━━━━━━━━━━━━━━━━━
<b>Stack Trace:</b>
<blockquote expandable><pre><code>${escapeHtml(cleanTrace)}</code></pre></blockquote>
`.trim();

    const keyboard = [
      [
        { text: '🛠 Open GitHub Issues', url: 'https://github.com/Aymendjmax/Avro-ai/issues' },
        { text: '📂 GitHub Repository', url: 'https://github.com/Aymendjmax/Avro-ai' }
      ]
    ];

    // Dispatch alert to Admin Telegram
    const tgResult = await sendTelegramNotification(telegramHtml, keyboard);

    return res.status(200).json({
      accepted: true,
      telegram: tgResult,
      id: crashId,
      message: 'Crash report received and dispatched to engineering.'
    });
  } catch (err) {
    console.error('Error processing crash report:', err);
    return res.status(500).json({ accepted: false, error: 'Internal Server Error' });
  }
}
