// api/target.js
// GET  /api/target         — ambil target KPI tersimpan
// POST /api/target         — simpan target KPI baru
//
// Target disimpan di Vercel KV (key-value store) jika tersedia,
// fallback ke environment variables untuk nilai default.
// Jika tidak ada Vercel KV, target dari query string saja.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Coba gunakan Vercel KV jika tersedia
  let kv = null;
  try {
    const kvModule = await import('@vercel/kv');
    kv = kvModule.kv;
  } catch {
    // Vercel KV tidak tersedia, gunakan env vars sebagai default
  }

  const KEY = 'kpi_targets';

  if (req.method === 'GET') {
    try {
      let targets = null;

      if (kv) {
        targets = await kv.get(KEY);
      }

      // Default targets dari environment variables
      if (!targets) {
        targets = {
          instalasi: parseInt(process.env.DEFAULT_TARGET_INSTALASI || 300),
          revenue:   parseFloat(process.env.DEFAULT_TARGET_REVENUE || 1500000000),
          updatedAt: null,
        };
      }

      return res.status(200).json({ success: true, data: targets });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const targets = {
        instalasi: parseInt(body.instalasi || 0),
        revenue:   parseFloat(body.revenue || 0),
        updatedAt: new Date().toISOString(),
      };

      if (isNaN(targets.instalasi) || isNaN(targets.revenue)) {
        return res.status(400).json({ error: 'Nilai target tidak valid' });
      }

      if (kv) {
        await kv.set(KEY, targets);
        return res.status(200).json({ success: true, message: 'Target berhasil disimpan', data: targets });
      } else {
        // Tanpa KV: kembalikan data saja, simpan di frontend localStorage
        return res.status(200).json({
          success: true,
          message: 'Target disimpan di browser (tambahkan Vercel KV untuk persistensi server)',
          data: targets,
          clientSide: true,
        });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
