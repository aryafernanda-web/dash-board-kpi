// api/kpi-current.js
// GET /api/kpi-current?year=2026&month=8&targetRevBundling=900000000&targetRevBulanan=600000000&targetInstalasi=300

import { aggregateKPI } from './notion.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const now   = new Date();
    const year  = parseInt(req.query.year  || now.getFullYear());
    const month = parseInt(req.query.month || (now.getMonth() + 1));
    const targetRevBundling = parseFloat(req.query.targetRevBundling || 900000000);
    const targetRevBulanan  = parseFloat(req.query.targetRevBulanan  || 600000000);
    const targetInstalasi   = parseInt(req.query.targetInstalasi || 300);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Parameter year/month tidak valid' });
    }

    const kpiData = await aggregateKPI(year, month, targetRevBundling, targetRevBulanan, targetInstalasi);
    return res.status(200).json({ success: true, data: kpiData });

  } catch (err) {
    console.error('[kpi-current] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
