export default async function handler(req, res) {
  const { lat, lng, path } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const marker = `color:white|size:small|${lat},${lng}`;
  const styles = [
    'feature:all|element:geometry|color:0x1a1a2e',
    'feature:all|element:labels.text.fill|color:0x8a8a9a',
    'feature:road|element:geometry|color:0x2d2d4e',
    'feature:road.highway|element:geometry|color:0x3d3d6e',
    'feature:water|element:geometry|color:0x0a0a1e',
    'feature:poi|visibility:off',
    'feature:transit|visibility:off',
  ].map(s => `&style=${encodeURIComponent(s)}`).join('');
  let url = `https://maps.googleapis.com/maps/api/staticmap?size=300x220&scale=2&zoom=15&center=${lat},${lng}&markers=${encodeURIComponent(marker)}${styles}&key=${key}`;
  if (path) url += `&path=color:0x00e5ffaa|weight:2|${encodeURIComponent(path)}`;
  try {
    const r = await fetch(url);
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(Buffer.from(buf));
  } catch(e) { res.status(500).end(); }
}
