export default async function handler(req, res) {
  const { input, sessiontoken } = req.query;
  if (!input) return res.status(400).json({ error: 'input required' });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&language=ja&key=${key}${sessiontoken ? '&sessiontoken='+sessiontoken : ''}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=60');
    res.json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
}
