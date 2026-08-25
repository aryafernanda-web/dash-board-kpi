// api/kpi-archive.js
// GET /api/kpi-archive
// Mengembalikan semua data arsip historis dari database Notion Arsip

import { getArchiveData } from './notion.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const archiveData = await getArchiveData();
    return res.status(200).json({ success: true, data: archiveData });
  } catch (err) {
    console.error('[kpi-archive] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
