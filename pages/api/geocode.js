export default async function handler(req, res) {
  const { address } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ja&key=${key}`;
  const r = await fetch(url);
  const data = await r.json();
  res.json(data);
}
