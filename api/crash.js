// Serverless API for Avro Crash Reporting
// Matches CrashReporter.kt payload from Avro Android App

export default async function handler(req, res) {
  // CORS headers
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
      packageName = 'unknown',
      trace = '',
      appVersion = 'unknown',
      versionCode = 0,
      androidApi = 0,
      androidRelease = '',
      device = '',
      ts = Date.now(),
      breadcrumbs = []
    } = body || {};

    // Validate essential crash telemetry
    if (!trace || trace.length < 5) {
      return res.status(400).json({ accepted: false, error: 'Invalid or missing stack trace.' });
    }

    const crashId = 'crash_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

    // Diagnostic logging in Vercel Runtime Logs
    console.log(JSON.stringify({
      level: 'FATAL_CRASH',
      crashId,
      packageName,
      appVersion,
      versionCode,
      androidApi,
      androidRelease,
      device,
      timestamp: new Date(ts).toISOString(),
      breadcrumbsCount: Array.isArray(breadcrumbs) ? breadcrumbs.length : 0,
      tracePreview: trace.substring(0, 300)
    }));

    return res.status(200).json({
      accepted: true,
      id: crashId,
      message: 'Crash report received and queued for investigation.'
    });
  } catch (err) {
    console.error('Error ingesting crash report:', err);
    return res.status(500).json({ accepted: false, error: 'Internal Server Error' });
  }
}
