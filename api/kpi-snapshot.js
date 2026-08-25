// api/kpi-snapshot.js
// POST /api/kpi-snapshot
// Body: { year, month, targetRevBundling, targetRevBulanan, catatan? }

import { aggregateKPI, saveSnapshot } from './notion.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-snapshot-secret'] || req.body?.secret;
  if (process.env.SNAPSHOT_SECRET && secret !== process.env.SNAPSHOT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = req.body || {};
    const now  = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const year              = parseInt(body.year  || prevMonth.getFullYear());
    const month             = parseInt(body.month || (prevMonth.getMonth() + 1));
    const targetRevBundling = parseFloat(body.targetRevBundling || 0);
    const targetRevBulanan  = parseFloat(body.targetRevBulanan  || 0);
    const catatan           = body.catatan || '';

    console.log(`[kpi-snapshot] Snapshotting ${year}-${String(month).padStart(2,'0')}`);

    const kpiData = await aggregateKPI(year, month, targetRevBundling, targetRevBulanan);
    kpiData.catatan = catatan;

    const result = await saveSnapshot(kpiData);

    return res.status(200).json({
      success: true,
      message: `Snapshot berhasil untuk periode ${kpiData.periode}`,
      data: kpiData,
      notionPage: result.id,
    });

  } catch (err) {
    console.error('[kpi-snapshot] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
