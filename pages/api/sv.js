export default async function handler(req, res) {
  const { lat, lng, heading = '', w = 800, h = 500 } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  let url = `https://maps.googleapis.com/maps/api/streetview?size=${w}x${h}&location=${lat},${lng}&fov=90&source=outdoor&key=${key}`;
  if (heading) url += `&heading=${heading}`;
  try {
    const r = await fetch(url);
    if (!r.ok) { res.status(r.status).end(); return; }
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(Buffer.from(buf));
  } catch(e) { res.status(500).end(); }
}
