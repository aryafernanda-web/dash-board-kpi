// api/diagnose.js
// GET /api/diagnose
// Menguji koneksi Notion API token dan akses ke ketiga database Notion

import { diagnoseNotionConnection } from './notion.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const diagnostic = await diagnoseNotionConnection();
    const isAllOk = diagnostic.tokenValid &&
      diagnostic.databases.registrasi.accessible &&
      diagnostic.databases.customer.accessible &&
      diagnostic.databases.archive.accessible;

    return res.status(200).json({
      success: isAllOk,
      diagnostic,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[diagnose] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
