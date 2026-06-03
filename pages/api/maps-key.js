// Returns the PUBLIC Maps JS key (safe - restricted to Maps JS API only)
export default function handler(req, res) {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
}
