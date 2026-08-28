// api/notion.js
// Integrasi Notion API untuk KPI Dashboard Biznet

export function cleanDatabaseId(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  // Ekstrak 32 karakter hex jika berbentuk URL Notion atau UUID dengan strip
  const cleanStr = str.replace(/-/g, '');
  const match = cleanStr.match(/([a-f0-9]{32})/i);
  if (match) return match[1].toLowerCase();
  return str.replace(/[^a-f0-9]/gi, '').toLowerCase();
}

export const NOTION_API_KEY = (
  process.env.NOTION_API_TOKEN ||
  process.env.NOTION_TOKEN ||
  process.env.NOTION_KEY ||
  ''
).trim();

const NOTION_VERSION = '2022-06-28';
const BASE_URL = 'https://api.notion.com/v1';

// Database IDs dengan dukungan berbagai alias nama Environment Variable
export const DB_REGISTRASI_ID = cleanDatabaseId(
  process.env.NOTION_DB_REGISTRASI ||
  process.env.NOTION_DB_TARGET_INSTALASI ||
  process.env.NOTION_DB_INSTALASI ||
  '320dcd14e2c88034999ffc33cfe28458'
); // Form Registrasi (1)

export const DB_CUSTOMER_ID = cleanDatabaseId(
  process.env.NOTION_DB_CUSTOMER ||
  process.env.NOTION_DB_REVENUE_BUNDLING ||
  process.env.NOTION_DB_BUNDLING ||
  '29edcd14e2c880ddb393dc9f54758a18'
); // DATA MY COSTUMER METRONET

export const DB_ARCHIVE_ID = cleanDatabaseId(
  process.env.NOTION_DB_ARCHIVE ||
  process.env.NOTION_DB_ARSIP ||
  '3c7dcd14e2c88022aad6c86491e15f9f'
); // Arsip Rekapitulasi Historis

export async function notionRequest(method, endpoint, body = null) {
  const headers = {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
  const opt = { method, headers };
  if (body) opt.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, opt);
  const json = await res.json();
  if (!res.ok) {
    const errCode = json.code ? `[${json.code}] ` : '';
    throw new Error(`${errCode}${json.message || `Notion API Error: ${res.status}`}`);
  }
  return json;
}

export async function queryAllPages(databaseId, filter = null, sorts = null) {
  let results = [];
  let hasMore = true;
  let cursor = undefined;

  while (hasMore) {
    const body = { page_size: 100 };
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (cursor) body.start_cursor = cursor;

    const res = await notionRequest('POST', `/databases/${databaseId}/query`, body);
    results = results.concat(res.results || []);
    hasMore = res.has_more;
    cursor = res.next_cursor;
  }
  return results;
}

export function getProp(page, propName) {
  if (!page || !page.properties) return null;
  
  let p = page.properties[propName];
  if (!p) {
    // Cari secara case-insensitive dan trim spasi
    const target = propName.trim().toLowerCase();
    const key = Object.keys(page.properties).find(k => k.trim().toLowerCase() === target);
    if (key) p = page.properties[key];
  }
  if (!p) return null;

  switch (p.type) {
    case 'title':
      return p.title?.map(t => t.plain_text).join('') || '';
    case 'rich_text':
      return p.rich_text?.map(t => t.plain_text).join('') || '';
    case 'number':
      return p.number;
    case 'select':
      return p.select?.name || '';
    case 'multi_select':
      return p.multi_select?.map(s => s.name).join(', ') || '';
    case 'status':
      return p.status?.name || '';
    case 'date':
      return p.date?.start || '';
    case 'formula':
      if (p.formula.type === 'number') return p.formula.number;
      if (p.formula.type === 'string') return p.formula.string;
      if (p.formula.type === 'boolean') return p.formula.boolean;
      if (p.formula.type === 'date') return p.formula.date?.start || '';
      return null;
    case 'rollup':
      if (p.rollup.type === 'number') return p.rollup.number;
      if (p.rollup.type === 'array') {
        return p.rollup.array?.map(a => a.number ?? a.title ?? a.rich_text ?? '').join(', ') || null;
      }
      return null;
    case 'created_time':
      return p.created_time || '';
    default:
      return null;
  }
}

export function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const mIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${months[mIdx] || m} ${y}`;
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

export function parseMonthYear(dateStr) {
  if (!dateStr) return null;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [, m, y] = dateStr.split('/');
    return { month: parseInt(m, 10), year: parseInt(y, 10) };
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    }
  } catch (e) {}
  return null;
}

export function standardizePaket(rawPaket) {
  if (!rawPaket) return 'HOME INTERNET 0D';
  const s = String(rawPaket).toUpperCase().trim();

  // Metro packages
  if (s.includes('METR')) {
    if (s.includes('5D') || s.includes('5 D')) return 'METRONET 5D';
    if (s.includes('4D') || s.includes('4 D')) return 'METRONET 4D';
    if (s.includes('3D') || s.includes('3 D')) return 'METRONET 3D';
    if (s.includes('2D') || s.includes('2 D')) return 'METRONET 2D';
    if (s.includes('1D') || s.includes('1 D')) return 'METRONET 1D';
    return 'METRONET 1D';
  }

  // Home packages
  if (s.includes('3D') || s.includes('3 D')) return 'HOME INTERNET 3D';
  if (s.includes('2D') || s.includes('2 D')) return 'HOME INTERNET 2D';
  if (s.includes('1D') || s.includes('1 D')) return 'HOME INTERNET 1D';
  if (s.includes('0D') || s.includes('0 D')) return 'HOME INTERNET 0D';

  return 'HOME INTERNET 0D';
}

export async function aggregateKPI(year, month, targetRevBundling = 25000000, targetRevBulanan = 60000000, targetInstalasi = 25) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonthDate = new Date(year, month, 1);
  const endDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;

  // 1. Query Realisasi Target Instalasi dari Form Registrasi (1)
  let regPages = [];
  try {
    const regFilter = {
      and: [
        { property: 'Tanggal Instalasi', date: { on_or_after: startDate } },
        { property: 'Tanggal Instalasi', date: { before: endDate } }
      ]
    };
    regPages = await queryAllPages(DB_REGISTRASI_ID, regFilter);
  } catch (filterErr) {
    console.warn('[notion.js] Query filter Tanggal Instalasi gagal, fallback ke query seluruh data:', filterErr.message);
    const allPages = await queryAllPages(DB_REGISTRASI_ID);
    regPages = allPages.filter(page => {
      const tgl = getProp(page, 'Tanggal Instalasi') || getProp(page, 'Tanggal') || getProp(page, 'Submission time');
      const my = parseMonthYear(tgl);
      return my && my.year === year && my.month === month;
    });
  }

  const instalasi = regPages.length;

  // 2. Query Data Bundling Existing dari DATA MY COSTUMER METRONET
  let custPages = [];
  try {
    custPages = await queryAllPages(DB_CUSTOMER_ID);
  } catch (e) {
    console.warn('[notion.js] Query DB_CUSTOMER_ID failed or empty:', e.message);
  }

  const monthNames = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  const monthName = monthNames[month - 1];

  const excelRows = [];

  // A. Baris Target Instalasi (Status: NEW)
  for (const page of regPages) {
    const nama = getProp(page, 'Nama Lengkap') || 'Tanpa Nama';
    const rawTgl = getProp(page, 'Tanggal Instalasi') || getProp(page, 'Submission time') || '';
    const tglIndo = formatTanggalIndo(rawTgl);
    const prodHome = getProp(page, 'Layanan Home ') || getProp(page, 'Layanan Home') || '';
    const prodMetro = getProp(page, 'Layanan Metronet') || '';
    const paketRaw = prodHome || prodMetro || 'HOME INTERNET 0D';
    const cleanPaket = standardizePaket(paketRaw);

    const kategori = cleanPaket.startsWith('METRO') ? 'METRO' : 'HOME';
    const sales = 'MUHAMAD ARYA FERNANDA';

    const rawModem = (getProp(page, 'Modem') || '').trim();
    let modem = '';
    if (rawModem) {
      modem = rawModem.toUpperCase().includes('RENT') ? 'RENT' : (rawModem.toUpperCase().includes('BUY') ? 'BUY' : rawModem.toUpperCase());
    }

    let skema = '';
    const promo = (getProp(page, 'Promo') || '').toUpperCase();
    const skemaMatch = promo.match(/\d+\+\d+/);
    if (skemaMatch) {
      skema = skemaMatch[0];
    } else if (promo.includes('MONTHLY') || promo.includes('MONTLY')) {
      skema = 'MONTHLY F';
    }

    excelRows.push({
      ro: 10,
      bulan: monthName,
      target: monthName,
      status: 'NEW',
      nama: nama.trim(),
      paket: cleanPaket,
      kategori,
      tanggal: tglIndo,
      sales,
      wilayah: sales,
      skema,
      revenue: '',
      modem,
      source: 'instalasi'
    });
  }

  // B. Baris Bundling Existing (Status: EXISTING)
  let bundlingRevenueSum = 0;
  for (const page of custPages) {
    const bExisting = getProp(page, 'Bundling Exsisting') || getProp(page, 'Bundling Exsisting Home') || getProp(page, 'Bundling Exsisting Metro');
    const rawTgl = getProp(page, 'Tanggal') || '';
    const my = parseMonthYear(rawTgl);

    const matchesPeriod = my ? (my.year === year && my.month === month) : Boolean(bExisting);
    if (bExisting && matchesPeriod) {
      const nama = getProp(page, 'Nama Pelanggan') || getProp(page, 'Nama Costumer') || 'Tanpa Nama';
      const tglIndo = formatTanggalIndo(rawTgl);
      const paketRaw = getProp(page, 'Paket') || getProp(page, 'Paket Home') || getProp(page, 'Paket Metro') || 'HOME INTERNET 0D';
      const cleanPaket = standardizePaket(paketRaw);
      const kategori = cleanPaket.startsWith('METRO') ? 'METRO' : 'HOME';
      const sales = 'MUHAMAD ARYA FERNANDA';
      const skema = String(bExisting || '').trim();
      const totalRev = getProp(page, 'Total Revenue') || getProp(page, 'Revenue Bundling Home') || getProp(page, 'Revenue') || 0;
      const revNum = Number(totalRev) || 0;
      bundlingRevenueSum += revNum;
      
      const rawModemCust = (getProp(page, 'MODEM') || '').trim();
      let modem = '';
      if (rawModemCust) {
        modem = rawModemCust.toUpperCase().includes('RENT') ? 'RENT' : (rawModemCust.toUpperCase().includes('BUY') ? 'BUY' : rawModemCust.toUpperCase());
      }

      excelRows.push({
        ro: 10,
        bulan: monthName,
        target: monthName,
        status: 'EXISTING',
        nama: nama.trim(),
        paket: cleanPaket,
        kategori,
        tanggal: tglIndo,
        sales,
        wilayah: sales,
        skema,
        revenue: revNum,
        modem,
        source: 'bundling_existing'
      });
    }
  }

  const revenueBundling = bundlingRevenueSum > 0 ? bundlingRevenueSum : 0;
  const revenueBulanan  = 49075000;
  const totalRevenue = revenueBundling + revenueBulanan;
  const targetRevTotal = targetRevBundling + targetRevBulanan;

  function pct(real, target) {
    return target > 0 ? Math.round((real / target * 100) * 10) / 10 : 0;
  }
  function getStatus(p) {
    if (p >= 100) return 'Tercapai';
    if (p >= 80) return 'Sebagian';
    return 'Belum Tercapai';
  }

  const pctInstalasi   = pct(instalasi, targetInstalasi);
  const pctRevBundling = pct(revenueBundling, targetRevBundling);
  const pctRevBulanan  = pct(revenueBulanan, targetRevBulanan);
  const pctRevTotal    = pct(totalRevenue, targetRevTotal);

  return {
    year,
    month,
    periode: `${year}-${String(month).padStart(2, '0')}`,
    instalasi,
    targetInstalasi,
    pctInstalasi,
    statusInstalasi: getStatus(pctInstalasi),

    revenueBundling,
    targetRevBundling,
    pctRevBundling,
    statusRevBundling: getStatus(pctRevBundling),

    revenueBulanan,
    targetRevBulanan,
    pctRevBulanan,
    statusRevBulanan: getStatus(pctRevBulanan),

    totalRevenue,
    targetRevTotal,
    pctRevTotal,
    statusRevTotal: getStatus(pctRevTotal),

    excelRows,
    dataCount: regPages.length,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getArchiveData() {
  try {
    const pages = await queryAllPages(DB_ARCHIVE_ID);
    const rows = [];
    for (const page of pages) {
      const periode = getProp(page, 'Periode') || '';
      const instalasi = Number(getProp(page, 'Instalasi')) || 0;
      let pIns = Number(getProp(page, '%Ins')) || 0;
      if (pIns > 0 && pIns <= 1) pIns = Math.round(pIns * 1000) / 10;
      
      const revBundle = Number(getProp(page, 'Rev Bundling')) || 0;
      let pRb = Number(getProp(page, '%Bund')) || 0;
      if (pRb > 0 && pRb <= 1) pRb = Math.round(pRb * 1000) / 10;

      const revBulanan = Number(getProp(page, 'Rev Bulanan')) || 0;
      let pRl = Number(getProp(page, '%Bul')) || 0;
      if (pRl > 0 && pRl <= 1) pRl = Math.round(pRl * 1000) / 10;

      const totalRev = Number(getProp(page, 'Total Rev')) || (revBundle + revBulanan);
      let pRt = Number(getProp(page, '%Total')) || 0;
      if (pRt > 0 && pRt <= 1) pRt = Math.round(pRt * 1000) / 10;

      const stRt = getProp(page, 'Status') || (pRt >= 100 ? 'Tercapai' : (pRt >= 80 ? 'Sebagian' : 'Belum'));

      if (periode) {
        rows.push({
          periode,
          instalasi,
          pIns,
          revBundle,
          pRb,
          revBulanan,
          pRl,
          totalRev,
          pRt,
          stRt,
          savedAt: page.created_time || new Date().toISOString()
        });
      }
    }
    rows.sort((a, b) => a.periode.localeCompare(b.periode));
    return rows;
  } catch (err) {
    console.error('[notion.js] getArchiveData error:', err.message);
    return [];
  }
}

export async function saveSnapshot(kpiData) {
  const periode = kpiData.periode || `${kpiData.year}-${String(kpiData.month).padStart(2, '0')}`;

  let existingPages = [];
  try {
    existingPages = await queryAllPages(DB_ARCHIVE_ID, {
      property: 'Periode',
      title: { equals: periode }
    });
  } catch (e) {}

  const pInsDecimal = (kpiData.pctInstalasi || 0) / 100;
  const pRbDecimal  = (kpiData.pctRevBundling || 0) / 100;
  const pRlDecimal  = (kpiData.pctRevBulanan || 0) / 100;
  const pRtDecimal  = (kpiData.pctRevTotal || 0) / 100;

  const properties = {
    'Periode': {
      title: [{ text: { content: periode } }]
    },
    'Instalasi': {
      number: kpiData.instalasi || 0
    },
    '%Ins': {
      number: pInsDecimal
    },
    'Rev Bundling': {
      number: kpiData.revenueBundling || 0
    },
    '%Bund': {
      number: pRbDecimal
    },
    'Rev Bulanan': {
      number: kpiData.revenueBulanan || 0
    },
    '%Bul': {
      number: pRlDecimal
    },
    'Total Rev': {
      number: kpiData.totalRevenue || 0
    },
    '%Total': {
      number: pRtDecimal
    },
    'Status': {
      rich_text: [{ text: { content: kpiData.statusRevTotal || kpiData.statusInstalasi || 'Tercapai' } }]
    }
  };

  if (existingPages.length > 0) {
    const pageId = existingPages[0].id;
    return await notionRequest('PATCH', `/pages/${pageId}`, { properties });
  } else {
    return await notionRequest('POST', '/pages', {
      parent: { database_id: DB_ARCHIVE_ID },
      properties
    });
  }
}

export async function diagnoseNotionConnection() {
  const result = {
    tokenValid: false,
    botInfo: null,
    databases: {
      registrasi: { id: DB_REGISTRASI_ID, accessible: false, title: '', error: null, rowCount: 0 },
      customer:   { id: DB_CUSTOMER_ID, accessible: false, title: '', error: null, rowCount: 0 },
      archive:    { id: DB_ARCHIVE_ID, accessible: false, title: '', error: null, rowCount: 0 },
    },
    recommendations: []
  };

  // 1. Uji Token
  try {
    const me = await notionRequest('GET', '/users/me');
    result.tokenValid = true;
    result.botInfo = {
      name: me.name,
      id: me.id,
      workspace: me.bot?.workspace_name || 'Notion Workspace'
    };
  } catch (err) {
    result.tokenValid = false;
    result.recommendations.push(`Token Notion API bermasalah: ${err.message}. Pastikan NOTION_API_TOKEN sudah diset di Vercel.`);
    return result;
  }

  // 2. Uji DB Registrasi
  try {
    const db = await notionRequest('GET', `/databases/${DB_REGISTRASI_ID}`);
    result.databases.registrasi.accessible = true;
    result.databases.registrasi.title = db.title?.map(t => t.plain_text).join('') || 'Form Registrasi';
    const sample = await queryAllPages(DB_REGISTRASI_ID);
    result.databases.registrasi.rowCount = sample.length;
  } catch (err) {
    result.databases.registrasi.error = err.message;
    result.recommendations.push(`Database Form Registrasi (${DB_REGISTRASI_ID}) belum bisa diakses: ${err.message}. Pastikan sudah di-share ke integrasi.`);
  }

  // 3. Uji DB Customer
  try {
    const db = await notionRequest('GET', `/databases/${DB_CUSTOMER_ID}`);
    result.databases.customer.accessible = true;
    result.databases.customer.title = db.title?.map(t => t.plain_text).join('') || 'DATA MY CUSTOMER METRONET';
    const sample = await queryAllPages(DB_CUSTOMER_ID);
    result.databases.customer.rowCount = sample.length;
  } catch (err) {
    result.databases.customer.error = err.message;
    result.recommendations.push(`Database Customer (${DB_CUSTOMER_ID}) belum bisa diakses: ${err.message}. Pastikan sudah di-share ke integrasi.`);
  }

  // 4. Uji DB Archive
  try {
    const db = await notionRequest('GET', `/databases/${DB_ARCHIVE_ID}`);
    result.databases.archive.accessible = true;
    result.databases.archive.title = db.title?.map(t => t.plain_text).join('') || 'Arsip Rekapitulasi Historis';
    const sample = await queryAllPages(DB_ARCHIVE_ID);
    result.databases.archive.rowCount = sample.length;
  } catch (err) {
    result.databases.archive.error = err.message;
    result.recommendations.push(`Database Arsip (${DB_ARCHIVE_ID}) belum bisa diakses: ${err.message}. Pastikan sudah di-share ke integrasi.`);
  }

  return result;
}
