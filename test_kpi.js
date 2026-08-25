import { aggregateKPI } from './api/notion.js';

async function main() {
  const data = await aggregateKPI(2026, 8, 2000000, 50000000, 20);
  console.log('=== HASIL AGREGASI KPI AGUSTUS 2026 ===');
  console.log('Periode         :', data.periode);
  console.log('Instalasi       :', data.instalasi, 'unit / target:', data.targetInstalasi, '->', data.pctInstalasi + '% (' + data.statusInstalasi + ')');
  console.log('Rev Bundling    : Rp', data.revenueBundling.toLocaleString('id-ID'), '->', data.pctRevBundling + '%');
  console.log('Rev Bulanan     : Rp', data.revenueBulanan.toLocaleString('id-ID'), '->', data.pctRevBulanan + '%');
  console.log('Total Revenue   : Rp', data.totalRevenue.toLocaleString('id-ID'), '->', data.pctRevTotal + '% (' + data.statusRevTotal + ')');
  console.log('\n=== DATA EXPORT EXCEL (TOTAL ' + data.excelRows.length + ' BARIS) ===');
  console.table(data.excelRows.map((r) => ({
    RO: 10,
    Bulan: r.bulan,
    Status: r.status,
    'Nama Pelanggan': r.nama,
    Paket: r.paket,
    Kategori: r.kategori,
    Tanggal: r.tanggal,
    Sales: r.sales,
    'Skema Bundling': r.skema,
    'Revenue (Rp)': r.revenue !== '' ? 'Rp ' + Number(r.revenue).toLocaleString('id-ID') : '(kosong)',
    'Tipe Modem': r.modem
  })));
}

main().catch(console.error);
