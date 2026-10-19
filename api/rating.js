// Serverless API for Avro User Ratings and Feedback
// Matches RatingForm.kt payload from Avro Android App

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

    // Diagnostic logging in Vercel Runtime Logs
    console.log(JSON.stringify({
      level: 'USER_RATING',
      feedbackId,
      rating: numericRating,
      name: name.trim().substring(0, 100),
      email: email.trim().substring(0, 150),
      comment: comment.trim().substring(0, 10000),
      appVersion,
      versionCode,
      device,
      timestamp: new Date(ts).toISOString()
    }));

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
