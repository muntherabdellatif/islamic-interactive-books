/**
 * pipeline/server.js
 * 
 * Lightweight Pipeline Comparison Server.
 * Supports dynamic page detection, persistent approvals,
 * instant inline toggling (no alert popups), and interactive font zoom.
 * 
 * Run: node pipeline/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3333;
const ROOT_DIR = path.resolve(__dirname, '..');

function resolveBookFolder(bookId) {
  const norm = bookId.replace(/_/g, '-');
  const dir = path.join(ROOT_DIR, 'pipeline', 'transcription', 'books', norm);
  return fs.existsSync(dir) ? norm : bookId;
}

function getApprovalsPath(bookId) {
  const folder = resolveBookFolder(bookId);
  return path.join(ROOT_DIR, 'pipeline', 'transcription', 'books', folder, 'approvals.json');
}

function getApprovals(bookId) {
  try {
    return JSON.parse(fs.readFileSync(getApprovalsPath(bookId), 'utf-8'));
  } catch {
    return {};
  }
}

function saveApprovals(bookId, approvals) {
  const p = getApprovalsPath(bookId);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(approvals, null, 2), 'utf-8');
}

function getAvailablePages(bookId) {
  const folder = resolveBookFolder(bookId);
  const dir = path.join(ROOT_DIR, 'pipeline', 'transcription', 'books', folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== 'approvals.json')
    .map(f => parseInt(path.basename(f, '.json'), 10))
    .sort((a, b) => a - b);
}

function findTemplate(bookId) {
  const candidates = [
    path.join(ROOT_DIR, 'pipeline', 'templates', `${bookId}.html`),
    path.join(ROOT_DIR, 'pipeline', 'templates', `${bookId.replace(/_/g, '-')}.html`),
    path.join(ROOT_DIR, 'pipeline', 'templates', `${bookId.replace(/-/g, '_')}.html`),
  ];
  return candidates.find(p => fs.existsSync(p));
}

function findPageData(bookId, pageNum) {
  const folder = resolveBookFolder(bookId);
  const p = path.join(ROOT_DIR, 'pipeline', 'transcription', 'books', folder, `${pageNum}.json`);
  return fs.existsSync(p) ? p : null;
}

function findPageImage(bookId, pageNum) {
  const folder = resolveBookFolder(bookId);
  const p = path.join(ROOT_DIR, 'data', 'books', folder, 'images', `${pageNum}.webp`);
  return fs.existsSync(p) ? p : null;
}

function renderDynamicPage(bookId, pageNum) {
  const templatePath = findTemplate(bookId);
  const dataPath = findPageData(bookId, pageNum);

  if (!templatePath) throw new Error(`Template not found for ${bookId}`);
  if (!dataPath) throw new Error(`Page data not found for ${bookId} page ${pageNum}`);

  const template = fs.readFileSync(templatePath, 'utf-8');
  const pageData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const footnotesHtml = (pageData.footnotes || [])
    .map(fn => `<li id="fn-${fn.index}">${fn.content}</li>`)
    .join('\n        ');

  return template
    .replace(/{{BOOK_TITLE}}/g, pageData.bookTitle || '')
    .replace(/{{VOLUME_NUMBER}}/g, String(pageData.volumeNumber || 1))
    .replace(/{{PRINTED_PAGE}}/g, String(pageData.printedPage || pageNum))
    .replace(/{{PAGE_SEQ}}/g, String(pageData.pageSeq || pageNum))
    .replace(/{{SECTION_TITLE}}/g, pageData.sectionTitle || '')
    .replace(/{{PAGE_CONTENT_HTML}}/g, pageData.bodyHtml || '')
    .replace(/{{PAGE_FOOTNOTES_HTML}}/g, footnotesHtml);
}

function getComparisonViewerHtml(bookId, pageNum) {
  const approvals = getApprovals(bookId);
  const isApproved = !!approvals[pageNum];
  const pages = getAvailablePages(bookId);
  const maxPage = pages.length > 0 ? Math.max(...pages) : pageNum;
  const prevPage = Math.max(1, pageNum - 1);
  const nextPage = Math.min(maxPage, pageNum + 1);

  let batchStart = 1;
  let batchEnd = 10;
  if (pageNum > 10 && pageNum <= 30) {
    batchStart = 11;
    batchEnd = 30;
  } else if (pageNum > 30) {
    batchStart = Math.floor((pageNum - 31) / 20) * 20 + 31;
    batchEnd = Math.min(maxPage, batchStart + 19);
  }

  const pillsHtml = pages.map(p => {
    const approved = !!approvals[p];
    const active = p === pageNum;
    const activeClass = active ? 'pill-active' : '';
    const statusIcon = approved ? '✓' : '•';
    const statusClass = approved ? 'pill-approved' : 'pill-pending';
    return `<a class="page-pill ${activeClass} ${statusClass}" href="/compare?book=${bookId}&page=${p}">${p} ${statusIcon}</a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>خادم تدقيق خط الإنتاج - ${bookId} (صفحة ${pageNum})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: #1e293b; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; gap: 12px; }
    .header-right { display: flex; align-items: center; gap: 10px; max-width: 60%; }
    .badge { padding: 4px 10px; border-radius: 9999px; font-size: 0.82rem; font-weight: bold; white-space: nowrap; }
    .badge-approved { background: #16a34a; color: white; }
    .badge-pending { background: #d97706; color: white; }
    .pills-container { display: flex; gap: 4px; align-items: center; overflow-x: auto; padding: 2px; scrollbar-width: thin; }
    .page-pill { color: #cbd5e1; text-decoration: none; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; border: 1px solid #334155; white-space: nowrap; transition: 0.2s; }
    .page-pill:hover { background: #334155; }
    .page-pill.pill-active { border-color: #38bdf8; background: #0369a1; color: white; }
    .page-pill.pill-approved { border-color: #22c55e; color: #86efac; }
    .controls { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
    button, .nav-link { background: #334155; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.82rem; transition: 0.2s; }
    button:hover, .nav-link:hover { background: #475569; }
    .btn-toggle { background: ${isApproved ? '#b91c1c' : '#16a34a'}; font-weight: 600; }
    .btn-batch { background: #2563eb; font-weight: 600; }
    .zoom-group { display: flex; align-items: center; background: #0f172a; border-radius: 6px; padding: 2px; border: 1px solid #334155; margin: 0 4px; }
    .zoom-group button { background: transparent; padding: 4px 8px; font-size: 0.8rem; }
    .zoom-group button:hover { background: #334155; }
    #toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 8px 18px; border-radius: 8px; font-size: 0.9rem; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
    main { display: flex; flex: 1; height: calc(100vh - 58px); overflow: hidden; }
    .pane { flex: 1; height: 100%; overflow-y: auto; }
    .pane-header { position: sticky; top: 0; z-index: 10; background: rgba(30, 41, 59, 0.92); backdrop-filter: blur(4px); padding: 6px 16px; font-size: 0.8rem; border-bottom: 1px solid #334155; color: #94a3b8; }
    .left-pane { border-left: 2px solid #334155; background: #0b0f19; text-align: center; }
    .left-pane img { max-width: 95%; margin: 16px auto; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .right-pane iframe { width: 100%; height: 100%; border: none; background: white; }
  </style>
</head>
<body>
  <header>
    <div class="header-right">
      <span id="status-badge" class="badge ${isApproved ? 'badge-approved' : 'badge-pending'}">
        ${isApproved ? '✅ معتمدة' : '⏳ بانتظار الاعتماد'}
      </span>
      <div class="pills-container">${pillsHtml}</div>
    </div>
    <div class="controls">
      <!-- أزرار تكبير وتصغير الخط بدقة دون كسر الصفحة -->
      <div class="zoom-group">
        <button title="تصغير الخط" onclick="adjustFont(-0.08)">A-</button>
        <button title="حجم الخط الطبيعي" onclick="adjustFont(0)">خط</button>
        <button title="تكبير الخط" onclick="adjustFont(+0.08)">A+</button>
      </div>
      <a class="nav-link" href="/compare?book=${bookId}&page=${prevPage}">◀ السابق</a>
      <a class="nav-link" href="/compare?book=${bookId}&page=${nextPage}">التالي ▶</a>
      <button id="btn-toggle" class="btn-toggle" onclick="toggleApproval()">
        ${isApproved ? 'إلغاء الاعتماد' : 'اعتماد الصفحة ✓'}
      </button>
      <button class="btn-batch" onclick="approveBatch(${batchStart}, ${batchEnd})">
        اعتماد (${batchStart} - ${batchEnd}) معاً 🚀
      </button>
    </div>
  </header>
  <main>
    <div class="pane right-pane">
      <div class="pane-header">النص المولّد ديناميكياً (خط تراثي محسن Amiri/Scheherazade)</div>
      <iframe id="page-frame" src="/rendered?book=${bookId}&page=${pageNum}"></iframe>
    </div>
    <div class="pane left-pane">
      <div class="pane-header">الصفحة الأصلية الممسوحة ضوئياً (WebP)</div>
      <img src="/image?book=${bookId}&page=${pageNum}" alt="Page ${pageNum}">
    </div>
  </main>
  <div id="toast"></div>

  <script>
    let fontScale = parseFloat(localStorage.getItem('viewer_font_scale') || '1.0');

    function applyFontScale() {
      const iframe = document.getElementById('page-frame');
      if (iframe && iframe.contentDocument) {
        const page = iframe.contentDocument.querySelector('.manuscript-page');
        if (page) {
          page.style.fontSize = (1.35 * fontScale).toFixed(2) + 'rem';
        }
      }
    }

    document.getElementById('page-frame').addEventListener('load', applyFontScale);

    function adjustFont(delta) {
      if (delta === 0) fontScale = 1.0;
      else fontScale = Math.min(1.4, Math.max(0.85, fontScale + delta));
      localStorage.setItem('viewer_font_scale', fontScale);
      applyFontScale();
      showToast('حجم الخط: ' + Math.round(fontScale * 100) + '%', '#0284c7');
    }

    function showToast(msg, color='#10b981') {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.background = color;
      t.style.opacity = '1';
      setTimeout(() => { t.style.opacity = '0'; }, 1600);
    }

    async function toggleApproval() {
      const res = await fetch('/api/toggle-approve?book=${bookId}&page=${pageNum}', { method: 'POST' });
      const data = await res.json();
      const badge = document.getElementById('status-badge');
      const btn = document.getElementById('btn-toggle');
      if (data.approved) {
        badge.className = 'badge badge-approved';
        badge.innerText = '✅ معتمدة';
        btn.innerText = 'إلغاء الاعتماد';
        btn.style.background = '#b91c1c';
        showToast('تم اعتماد الصفحة ${pageNum} بنجاح ✓');
      } else {
        badge.className = 'badge badge-pending';
        badge.innerText = '⏳ بانتظار الاعتماد';
        btn.innerText = 'اعتماد الصفحة ✓';
        btn.style.background = '#16a34a';
        showToast('تم إلغاء الاعتماد', '#d97706');
      }
    }

    async function approveBatch(start, end) {
      const res = await fetch(\`/api/approve-batch?book=${bookId}&start=\${start}&end=\${end}\`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(\`تم اعتماد الدفعة (\${start} - \${end}) بنجاح! 🚀\`);
        setTimeout(() => location.reload(), 600);
      }
    }
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const bookId = (parsedUrl.query.book || 'al-nashr').replace(/[^a-zA-Z0-9_-]/g, '');
  const pageNum = parseInt(parsedUrl.query.page || '1', 10);

  try {
    if (pathname.startsWith('/preview')) {
      const rel = pathname.replace(/^\/preview\/?/, '') || 'index.html';
      const filePath = path.join(ROOT_DIR, 'preview', rel);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const mime = ext === '.html' ? 'text/html; charset=utf-8' :
                     ext === '.css' ? 'text/css; charset=utf-8' :
                     ext === '.js' ? 'application/javascript; charset=utf-8' : 'text/plain';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    if (pathname === '/' || pathname === '/compare') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getComparisonViewerHtml(bookId, pageNum));
    } else if (pathname === '/rendered') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDynamicPage(bookId, pageNum));
    } else if (pathname === '/image') {
      const imgPath = findPageImage(bookId, pageNum);
      if (imgPath) {
        res.writeHead(200, { 'Content-Type': 'image/webp' });
        fs.createReadStream(imgPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Image Not Found');
      }
    } else if (pathname === '/api/toggle-approve' && req.method === 'POST') {
      const approvals = getApprovals(bookId);
      approvals[pageNum] = !approvals[pageNum];
      saveApprovals(bookId, approvals);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ approved: approvals[pageNum], page: pageNum }));
    } else if (pathname === '/api/approve-batch' && req.method === 'POST') {
      const start = parseInt(parsedUrl.query.start || '1', 10);
      const end = parseInt(parsedUrl.query.end || '70', 10);
      const approvals = getApprovals(bookId);
      for (let p = start; p <= end; p++) approvals[p] = true;
      saveApprovals(bookId, approvals);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, count: end - start + 1 }));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal Error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 خادم المقارنة يعمل: http://localhost:${PORT}/compare?book=al-nashr&page=1`);
});
