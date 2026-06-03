export default async function handler(req, res) {
  const { origin, destination, mode } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode||'walking'}&language=ja&key=${key}`;
  const r = await fetch(url);
  const data = await r.json();
  res.json(data);
}
