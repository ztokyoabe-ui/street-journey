export default function handler(req, res) {
  const key = process.env.GOOGLE_MAPS_JS_API_KEY;
  if (!key) return res.status(500).json({ error: 'Maps JS API key not configured' });
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).json({
    scriptUrl: `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly`
  });
}
