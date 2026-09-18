// api/debug-props.js
// GET /api/debug-props
// Dump raw property names & types dari 1 row DB_CUSTOMER_ID

import { notionRequest, queryAllPages, DB_CUSTOMER_ID } from './notion.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  try {
    // Ambil info database (daftar properti)
    const db = await notionRequest('GET', `/databases/${DB_CUSTOMER_ID}`);
    const propDefs = Object.entries(db.properties || {}).map(([name, p]) => ({
      name,
      type: p.type
    }));

    // Ambil 1 page untuk lihat nilai aktual
    const pages = await queryAllPages(DB_CUSTOMER_ID);
    const sample = pages[0];
    let sampleProps = {};
    if (sample) {
      for (const [key, val] of Object.entries(sample.properties || {})) {
        sampleProps[key] = {
          type: val.type,
          raw: val
        };
      }
    }

    return res.status(200).json({
      databaseId: DB_CUSTOMER_ID,
      totalRows: pages.length,
      propertyDefinitions: propDefs,
      firstRowRawProperties: sampleProps
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
