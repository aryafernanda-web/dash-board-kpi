'use strict';

// ── State ──────────────────────────────────────────────────
const S = {
  year:    new Date().getFullYear(),
  month:   new Date().getMonth() + 1,
  data:    null,
  archive: [],
  targets: { instalasi: 300, revBundle: 900_000_000, revBul: 600_000_000 },
  chart:   null,
  tab:     'instalasi',
};

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                'Juli','Agustus','September','Oktober','November','Desember'];

// ── Format helpers ─────────────────────────────────────────
const fmtRp = (n, short=false) => {
  if (n == null || isNaN(n)) return '—';
  if (short) {
    if (Math.abs(n) >= 1e9) return 'Rp ' + (n/1e9).toFixed(2) + ' M';
    if (Math.abs(n) >= 1e6) return 'Rp ' + (n/1e6).toFixed(0) + ' Jt';
  }
  return 'Rp ' + Number(n).toLocaleString('id-ID');
};
const fmtN   = n  => (n==null||isNaN(n)) ? '—' : Number(n).toLocaleString('id-ID');
const fmtPct = p  => (p==null||isNaN(p)) ? '—%' : p.toFixed(1) + '%';
const pctCls = p  => p >= 100 ? 'pct-ok' : p >= 80 ? 'pct-mid' : 'pct-bad';
const statusLabel = s => {
  if (!s) return '—';
  const l = s.toLowerCase();
  if (l.includes('tercapai') && !l.includes('belum')) return 'Tercapai';
  if (l.includes('sebagian')) return 'Sebagian';
  return 'Belum';
};
const pillCls = s => {
  const l = (s||'').toLowerCase();
  if (l.includes('tercapai') && !l.includes('belum')) return 'pill-ok';
  if (l.includes('sebagian')) return 'pill-mid';
  return 'pill-bad';
};
const badgeCls = s => {
  const l = (s||'').toLowerCase();
  if (!s || s === '—') return 'badge-na';
  if (l.includes('tercapai') && !l.includes('belum')) return 'badge-ok';
  if (l.includes('sebagian')) return 'badge-mid';
  return 'badge-bad';
};

// ── DOM helpers ────────────────────────────────────────────
const $  = id => document.getElementById(id);
const setBar = (id, pct) => { const el = $(id); if(el) el.style.width = Math.min(pct||0,100)+'%'; };
const setText = (id, v) => { const el=$(id); if(el) el.textContent = v; };

// ── Toast ──────────────────────────────────────────────────
function toast(msg, type='', ms=3000) {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast'; }, ms);
}

// ── Loading ────────────────────────────────────────────────
const setLoading = v => { $('loading').style.display = v ? 'flex' : 'none'; };

// ── Status bar ─────────────────────────────────────────────
function setStatus(txt, ok=null) {
  const el = $('status-text');
  if (ok === null) {
    el.innerHTML = `<span class="dot-pulse"></span> ${txt}`;
  } else {
    el.textContent = txt;
    el.style.color = ok ? 'var(--ok-fg)' : 'var(--bad-fg)';
  }
}

// ── Targets ─────────────────────────────────────────────── 
function loadTargets() {
  try {
    const s = localStorage.getItem('kpi_targets_v2');
    if (s) S.targets = JSON.parse(s);
  } catch {}
}
function persistTargets() {
  localStorage.setItem('kpi_targets_v2', JSON.stringify(S.targets));
}

// ── Month navigation ───────────────────────────────────────
function updateMonthLabel() {
  $('label-month').textContent = `${MONTHS[S.month-1]} ${S.year}`;
}
function shiftMonth(d) {
  S.month += d;
  if (S.month > 12) { S.month=1; S.year++; }
  if (S.month < 1)  { S.month=12; S.year--; }
  updateMonthLabel();
  loadDashboard();
}

// ── API fetch ──────────────────────────────────────────────
async function fetchKPI() {
  const { year, month, targets } = S;
  const url = `/api/kpi-current?year=${year}&month=${month}`
    + `&targetRevBundling=${targets.revBundle}&targetRevBulanan=${targets.revBul}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!j.success) throw new Error(j.error || 'Gagal memuat KPI');
  return j.data;
}
async function fetchArchive() {
  const r = await fetch('/api/kpi-archive');
  const j = await r.json();
  if (!j.success) throw new Error(j.error);
  return j.data;
}

// ── Main loader ────────────────────────────────────────────
async function loadDashboard() {
  setLoading(true);
  setStatus('Memuat data dari Notion…');
  $('error-bar').style.display = 'none';

  try {
    const [data, archive] = await Promise.all([fetchKPI(), fetchArchive()]);
    S.data    = data;
    S.archive = archive;

    renderCards(data);
    renderMainTable(data);
    renderBreakdowns(data);
    renderDetail(data);
    renderArchive(archive);
    renderChart(S.tab);

    const t = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    setStatus('✓ Data diperbarui', true);
    $('last-update').textContent = t;

  } catch(err) {
    console.error(err);
    setStatus('⚠ Gagal memuat: ' + err.message, false);
    $('error-msg').textContent = err.message;
    $('error-bar').style.display = 'flex';
    renderEmptyState();
  } finally {
    setLoading(false);
  }
}

// ── Render Cards ───────────────────────────────────────────
function renderCards(d) {
  const tgtI = d.targetInstalasi || S.targets.instalasi;

  // Instalasi
  setText('v-instalasi', fmtN(d.instalasi));
  setText('s-instalasi', `Target: ${fmtN(tgtI)} unit`);
  setText('p-instalasi', fmtPct(d.pctInstalasi));
  setBar('bar-instalasi', d.pctInstalasi);
  setBadge('b-instalasi', d.statusInstalasi);

  // Revenue Bundling
  setText('v-rev-bundle', fmtRp(d.revenueBundling, true));
  setText('s-rev-bundle', `Target: ${fmtRp(S.targets.revBundle, true)}`);
  setText('p-rev-bundle', fmtPct(d.pctRevBundling));
  setBar('bar-rev-bundle', d.pctRevBundling);
  setBadge('b-rev-bundle', d.statusRevBundling);

  // Revenue Bulanan
  setText('v-rev-bul', fmtRp(d.revenueBulanan, true));
  setText('s-rev-bul', `Target: ${fmtRp(S.targets.revBul, true)}`);
  setText('p-rev-bul', fmtPct(d.pctRevBulanan));
  setBar('bar-rev-bul', d.pctRevBulanan);
  setBadge('b-rev-bul', d.statusRevBulanan);

  // Total Revenue
  const tgtTotal = S.targets.revBundle + S.targets.revBul;
  setText('v-rev-total', fmtRp(d.totalRevenue, true));
  setText('s-rev-total', `Target: ${fmtRp(tgtTotal, true)}`);
  setText('p-rev-total', fmtPct(d.pctRevTotal));
  setBar('bar-rev-total', d.pctRevTotal);
  setBadge('b-rev-total', d.statusRevTotal);

  // Print info
  setText('print-period', `${MONTHS[S.month-1]} ${S.year}`);
  setText('print-date', new Date().toLocaleDateString('id-ID',{dateStyle:'long'}));
  setText('print-now',  new Date().toLocaleDateString('id-ID',{dateStyle:'long'}));
}

function setBadge(id, status) {
  const el = $(id);
  if (!el) return;
  el.textContent = statusLabel(status);
  el.className   = `kpi-badge ${badgeCls(status)}`;
}

// ── Render Main KPI Table ──────────────────────────────────
function renderMainTable(d) {
  const tgtI = d.targetInstalasi || S.targets.instalasi;

  const rows = [
    // Instalasi group
    { label:'INSTALASI', real:fmtN(d.instalasi), tgt:fmtN(tgtI)+' unit',
      pct:d.pctInstalasi, status:d.statusInstalasi, isGroup:true },
    { label:'Status NEW',   real:fmtN(d.byStatus?.NEW  ||0), tgt:'—', pct:null, indent:true },
    { label:'Status EXIST', real:fmtN(d.byStatus?.EXIST||0), tgt:'—', pct:null, indent:true },
    { label:'Tipe BUY',     real:fmtN(d.byTipe?.BUY    ||0), tgt:'—', pct:null, indent:true },
    { label:'Tipe RENT',    real:fmtN(d.byTipe?.RENT   ||0), tgt:'—', pct:null, indent:true },
    { sep: true },
    // Revenue Bundling group
    { label:'REVENUE BUNDLING', real:fmtRp(d.revenueBundling,true),
      tgt:fmtRp(S.targets.revBundle,true), pct:d.pctRevBundling,
      status:d.statusRevBundling, isGroup:true },
    { sep: true },
    // Revenue Bulanan group
    { label:'REVENUE BULANAN', real:fmtRp(d.revenueBulanan,true),
      tgt:fmtRp(S.targets.revBul,true), pct:d.pctRevBulanan,
      status:d.statusRevBulanan, isGroup:true },
    { sep: true },
    // Total
    { label:'TOTAL REVENUE',
      real:fmtRp(d.totalRevenue,true),
      tgt:fmtRp(S.targets.revBundle+S.targets.revBul,true),
      pct:d.pctRevTotal, status:d.statusRevTotal, isTotal:true },
  ];

  $('tbody-main').innerHTML = rows.map(r => {
    if (r.sep) return `<tr class="row-sep"><td colspan="5"></td></tr>`;
    const pctHtml = r.pct != null
      ? `<span class="${pctCls(r.pct)}">${fmtPct(r.pct)}</span>` : '<span class="pct-mid">—</span>';
    const stHtml  = r.status
      ? `<span class="pill ${pillCls(r.status)}">${statusLabel(r.status)}</span>` : '—';
    const cls = r.isTotal ? 'row-total' : r.isGroup ? 'row-group' : r.indent ? 'row-indent' : '';
    return `<tr class="${cls}">
      <td>${r.label}</td>
      <td class="r">${r.real}</td>
      <td class="r">${r.tgt}</td>
      <td class="r">${pctHtml}</td>
      <td class="c">${stHtml}</td>
    </tr>`;
  }).join('');
}

// ── Render Breakdowns ──────────────────────────────────────
function renderBreakdowns(d) {
  const total = d.instalasi || 1;

  // Per produk
  $('tbody-produk').innerHTML = Object.entries(d.byProduk||{})
    .sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>`<tr>
      <td>${k}</td>
      <td class="r">${fmtN(v)}</td>
      <td class="r"><span class="${pctCls(v/total*100)}">${fmtPct(v/total*100)}</span></td>
    </tr>`).join('') || `<tr><td colspan="3" class="empty">—</td></tr>`;

  // Per kecamatan
  $('tbody-kec').innerHTML = Object.entries(d.byKecamatan||{})
    .sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>`<tr>
      <td>${k}</td>
      <td class="r">${fmtN(v)}</td>
      <td class="r">${fmtPct(v/total*100)}</td>
    </tr>`).join('') || `<tr><td colspan="3" class="empty">—</td></tr>`;

  // Status & Tipe
  const rows = [
    ['NEW',   d.byStatus?.NEW   || 0, 'Status'],
    ['EXIST', d.byStatus?.EXIST || 0, 'Status'],
    ['BUY',   d.byTipe?.BUY     || 0, 'Tipe'],
    ['RENT',  d.byTipe?.RENT    || 0, 'Tipe'],
  ];
  $('tbody-status').innerHTML = rows.map(([k,v,g])=>`<tr>
    <td><span style="font-size:10px;color:var(--text-3)">${g}</span> ${k}</td>
    <td class="r">${fmtN(v)}</td>
    <td class="r">${fmtPct(v/total*100)}</td>
  </tr>`).join('');
}

// ── Render Detail Table ────────────────────────────────────
function renderDetail(d) {
  const rows = d.rowDetails || [];
  $('detail-count').textContent = rows.length;
  $('tbody-detail').innerHTML = rows.length
    ? rows.map((r,i)=>`<tr>
        <td class="r" style="color:var(--text-3)">${i+1}</td>
        <td>${r.nama||'—'}</td>
        <td style="color:var(--text-2)">${r.tanggal||'—'}</td>
        <td>${r.produk||'—'}</td>
        <td>${r.kecamatan||'—'}</td>
        <td><span class="pill ${r.status==='NEW'?'pill-ok':'pill-mid'}" style="font-size:10px">${r.status||'—'}</span></td>
        <td>${r.tipe||'—'}</td>
        <td class="r">${fmtRp(r.revenue)}</td>
      </tr>`).join('')
    : `<tr><td colspan="8" class="empty">Tidak ada data</td></tr>`;
}

// ── Render Archive Table ───────────────────────────────────
function renderArchive(data) {
  if (!data || !data.length) {
    $('tbody-archive').innerHTML = `<tr><td colspan="10" class="empty">Belum ada data arsip historis</td></tr>`;
    return;
  }
  $('tbody-archive').innerHTML = data.map(r=>`<tr>
    <td><strong>${r.periode}</strong></td>
    <td class="r">${fmtN(r.totalInstalasi)}</td>
    <td class="r"><span class="${pctCls(r.pctInstalasi)}">${fmtPct(r.pctInstalasi)}</span></td>
    <td class="r">${fmtRp(r.revenueBundling,true)}</td>
    <td class="r"><span class="${pctCls(r.pctRevBundling)}">${fmtPct(r.pctRevBundling)}</span></td>
    <td class="r">${fmtRp(r.revenueBulanan,true)}</td>
    <td class="r"><span class="${pctCls(r.pctRevBulanan)}">${fmtPct(r.pctRevBulanan)}</span></td>
    <td class="r">${fmtRp(r.totalRevenue,true)}</td>
    <td class="r"><span class="${pctCls(r.pctRevTotal)}">${fmtPct(r.pctRevTotal)}</span></td>
    <td class="c"><span class="pill ${pillCls(r.status)}">${statusLabel(r.status)}</span></td>
  </tr>`).join('');
}

// ── Render Chart ───────────────────────────────────────────
function renderChart(tab) {
  S.tab = tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));

  const canvas = $('main-chart');
  const empty  = $('chart-empty');
  const data   = S.archive;

  if (!data || !data.length) {
    canvas.style.display = 'none';
    empty.style.display  = 'block';
    return;
  }
  canvas.style.display = 'block';
  empty.style.display  = 'none';

  const labels = data.map(d => d.periode);
  let datasets = [];

  if (tab === 'instalasi') {
    datasets = [
      { label:'Realisasi', data:data.map(d=>d.totalInstalasi), type:'bar',
        backgroundColor:'rgba(59,130,246,.6)', borderColor:'#3b82f6',
        borderWidth:1.5, borderRadius:4, order:2 },
      { label:'Target', data:data.map(d=>d.targetInstalasi), type:'line',
        borderColor:'#ef4444', borderWidth:2, borderDash:[5,3],
        pointRadius:3, fill:false, tension:.3, order:1 },
    ];
  } else if (tab === 'revenue') {
    datasets = [
      { label:'Rev Bundling', data:data.map(d=>d.revenueBundling), type:'bar',
        backgroundColor:'rgba(16,185,129,.6)', borderColor:'#10b981',
        borderWidth:1.5, borderRadius:4, order:3 },
      { label:'Rev Bulanan', data:data.map(d=>d.revenueBulanan), type:'bar',
        backgroundColor:'rgba(8,145,178,.6)', borderColor:'#0891b2',
        borderWidth:1.5, borderRadius:4, order:2 },
      { label:'Target Total', data:data.map(d=>d.targetRevTotal), type:'line',
        borderColor:'#ef4444', borderWidth:2, borderDash:[5,3],
        pointRadius:3, fill:false, tension:.3, order:1 },
    ];
  } else {
    datasets = [
      { label:'% Instalasi', data:data.map(d=>d.pctInstalasi), type:'line',
        borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.08)',
        fill:true, tension:.4, pointRadius:4, borderWidth:2 },
      { label:'% Rev Bundling', data:data.map(d=>d.pctRevBundling), type:'line',
        borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.08)',
        fill:true, tension:.4, pointRadius:4, borderWidth:2 },
      { label:'% Rev Bulanan', data:data.map(d=>d.pctRevBulanan), type:'line',
        borderColor:'#0891b2', backgroundColor:'rgba(8,145,178,.06)',
        fill:true, tension:.4, pointRadius:4, borderWidth:2 },
      { label:'Target 100%', data:data.map(()=>100), type:'line',
        borderColor:'rgba(239,68,68,.5)', borderWidth:1.5, borderDash:[4,4],
        pointRadius:0, fill:false },
    ];
  }

  if (S.chart) S.chart.destroy();
  S.chart = new Chart(canvas.getContext('2d'), {
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { labels: { font:{family:'Inter',size:11}, boxWidth:10, padding:12 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (tab==='revenue') return ` ${ctx.dataset.label}: ${fmtRp(v,true)}`;
              if (tab==='pct')     return ` ${ctx.dataset.label}: ${fmtPct(v)}`;
              return ` ${ctx.dataset.label}: ${fmtN(v)}`;
            }
          }
        }
      },
      scales: {
        x: { grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{size:11},color:'#94a3b8'} },
        y: {
          grid:{color:'rgba(0,0,0,.04)'},
          ticks:{font:{size:11},color:'#94a3b8', callback: v => {
            if (tab==='revenue') return fmtRp(v,true);
            if (tab==='pct')     return fmtPct(v);
            return fmtN(v);
          }},
          beginAtZero: true,
        }
      }
    }
  });
}

// ── Empty state ────────────────────────────────────────────
function renderEmptyState() {
  const zero = { instalasi:0, targetInstalasi:0, pctInstalasi:0,
    revenueBundling:0, targetRevBundling:0, pctRevBundling:0, statusRevBundling:'—',
    revenueBulanan:0,  targetRevBulanan:0,  pctRevBulanan:0,  statusRevBulanan:'—',
    totalRevenue:0,    targetRevTotal:0,    pctRevTotal:0,    statusRevTotal:'—',
    statusInstalasi:'—',
    byProduk:{}, byKecamatan:{}, byStatus:{NEW:0,EXIST:0}, byTipe:{BUY:0,RENT:0}, rowDetails:[] };
  renderCards(zero);
  renderMainTable(zero);
  renderBreakdowns(zero);
}

// ── Modal Target ───────────────────────────────────────────
function openTarget() {
  $('in-tgt-instalasi').value = S.targets.instalasi;
  $('in-tgt-bundle').value    = S.targets.revBundle;
  $('in-tgt-bul').value       = S.targets.revBul;
  updatePreview();
  $('modal-target').style.display = 'flex';
}
function updatePreview() {
  const b = parseFloat($('in-tgt-bundle').value)||0;
  const u = parseFloat($('in-tgt-bul').value)||0;
  $('prev-bundle').textContent = fmtRp(b);
  $('prev-bul').textContent    = fmtRp(u);
}
function saveTarget() {
  const i = parseInt($('in-tgt-instalasi').value);
  const b = parseFloat($('in-tgt-bundle').value);
  const u = parseFloat($('in-tgt-bul').value);
  if (!i||i<1)      return toast('Target instalasi tidak valid','err');
  if (isNaN(b)||b<0) return toast('Target Revenue Bundling tidak valid','err');
  if (isNaN(u)||u<0) return toast('Target Revenue Bulanan tidak valid','err');
  S.targets = { instalasi:i, revBundle:b, revBul:u };
  persistTargets();
  closeModal('modal-target');
  toast('✓ Target disimpan','ok');
  loadDashboard();
}

// ── Modal Snapshot ─────────────────────────────────────────
function openSnapshot() {
  $('snap-period-label').textContent = `${MONTHS[S.month-1]} ${S.year}`;
  $('in-catatan').value = '';
  $('modal-snap').style.display = 'flex';
}
async function doSnapshot() {
  const btn = $('btn-do-snap');
  btn.disabled = true; btn.textContent = 'Menyimpan…';
  try {
    const r = await fetch('/api/kpi-snapshot', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        year: S.year, month: S.month,
        targetRevBundling: S.targets.revBundle,
        targetRevBulanan:  S.targets.revBul,
        catatan: $('in-catatan').value.trim(),
      }),
    });
    const j = await r.json();
    if (j.success) {
      closeModal('modal-snap');
      toast(`✓ Snapshot ${MONTHS[S.month-1]} ${S.year} tersimpan!`, 'ok', 4000);
      loadDashboard();
    } else {
      toast('Gagal: ' + j.error, 'err');
    }
  } catch(e) {
    toast('Error: ' + e.message, 'err');
  }
  btn.disabled=false; btn.textContent='Simpan';
}

// ── Modal helpers ──────────────────────────────────────────
function closeModal(id, e) {
  if (e && e.target.id !== id) return;
  $(id).style.display = 'none';
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTargets();
  updateMonthLabel();

  $('btn-prev').addEventListener('click', () => shiftMonth(-1));
  $('btn-next').addEventListener('click', () => shiftMonth(+1));
  $('btn-refresh').addEventListener('click', () => loadDashboard());
  $('btn-target').addEventListener('click', openTarget);
  $('btn-snapshot').addEventListener('click', openSnapshot);
  $('btn-print').addEventListener('click', () => window.print());

  $('in-tgt-bundle').addEventListener('input', updatePreview);
  $('in-tgt-bul').addEventListener('input', updatePreview);

  document.querySelectorAll('.tab').forEach(b =>
    b.addEventListener('click', () => renderChart(b.dataset.tab))
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $('modal-target').style.display = 'none';
      $('modal-snap').style.display   = 'none';
    }
  });

  loadDashboard();
});
