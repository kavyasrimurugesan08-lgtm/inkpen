const http = require('http');
const fs = require('fs');
const path = require('path');
const { SEED } = require('../backend/seed');

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const cleaned = line.replace(/^export\s+/, '');
    const eq = cleaned.indexOf('=');
    if (eq === -1) continue;
    const key = cleaned.slice(0, eq).trim();
    let val = cleaned.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else {
      val = val.replace(/\s+#.*$/, '').trim();
    }
    if (key) out[key] = val;
  }
  return out;
}

function getEnv() {
  const candidates = [path.join(__dirname, '..', '.env'), path.join(__dirname, '.env')]
    .filter(p => fs.existsSync(p))
    .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);
  const merged = {};
  for (const p of candidates) Object.assign(merged, parseEnvFile(p));
  return merged;
}

function getAdminCredentials() {
  const env = getEnv();
  return {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || env.ADMIN_USERNAME || env.VITE_ADMIN_USERNAME || 'jawaharkumar',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || 'admin123'
  };
}

function injectEnvHtml(buffer) {
  const creds = getAdminCredentials();
  const payload = JSON.stringify(creds).replace(/</g, '\\u003c');
  const scriptTag = `<script>window.__INKPEN_ENV__=${payload};</script>`;
  const html = buffer.toString('utf8');
  return html.includes('</head>') ? html.replace('</head>', `${scriptTag}\n</head>`) : `${scriptTag}\n${html}`;
}

const PORT = Number(process.env.PORT || getEnv().FRONTEND_PORT || 3000);
const ROOT = __dirname;
const DB_FILE = path.join(__dirname, '..', 'backend', 'data', 'db.json');

if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(SEED, null, 2), 'utf8');
}

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch (e) { return JSON.parse(JSON.stringify(SEED)); }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => { body += c.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
    });
  });
}
function sendJSON(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

const COLLECTIONS = ['cats', 'projects', 'services', 'leads', 'reviews', 'logos', 'jobs', 'team'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const cleanUrl = req.url.split('?')[0];

  if (cleanUrl.startsWith('/api/')) {
    if (cleanUrl === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = await parseBody(req);
      const creds = getAdminCredentials();
      const u = (username || '').trim().toLowerCase();
      if (u === creds.ADMIN_USERNAME.trim().toLowerCase() && password === creds.ADMIN_PASSWORD) {
        return sendJSON(res, 200, {
          ok: true,
          token: 'inkpen-session-token-' + Date.now(),
          user: { username: creds.ADMIN_USERNAME, role: 'admin' }
        });
      }
      return sendJSON(res, 401, { ok: false, error: 'Incorrect username or password.' });
    }
    if (cleanUrl === '/api/state') {
      if (req.method === 'GET') return sendJSON(res, 200, readDB());
      if (req.method === 'PUT' || req.method === 'POST') {
        const next = await parseBody(req);
        const merged = { ...readDB(), ...next };
        writeDB(merged);
        return sendJSON(res, 200, merged);
      }
    }
    if (cleanUrl === '/api/site') {
      const db = readDB();
      if (req.method === 'GET') return sendJSON(res, 200, { site: db.site, siteContent: db.siteContent || { texts: {}, imgs: {} } });
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = await parseBody(req);
        if (body.site) db.site = { ...db.site, ...body.site };
        if (body.siteContent) db.siteContent = body.siteContent;
        writeDB(db);
        return sendJSON(res, 200, { ok: true, site: db.site, siteContent: db.siteContent });
      }
    }
    const m = cleanUrl.match(/^\/api\/([a-z]+)(?:\/([^/]+))?$/);
    if (m && COLLECTIONS.includes(m[1])) {
      const col = m[1], id = m[2], db = readDB();
      const list = Array.isArray(db[col]) ? db[col] : [];
      if (req.method === 'GET' && !id) return sendJSON(res, 200, list);
      if (req.method === 'POST' && !id) {
        const item = await parseBody(req);
        const newItem = { id: item.id || `${col[0]}${Date.now()}`, created: Date.now(), ...item };
        list.unshift(newItem);
        db[col] = list;
        writeDB(db);
        return sendJSON(res, 201, newItem);
      }
      if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
        const uo = await parseBody(req);
        const idx = list.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
        list[idx] = { ...list[idx], ...uo, id: list[idx].id };
        db[col] = list;
        writeDB(db);
        return sendJSON(res, 200, list[idx]);
      }
      if (req.method === 'DELETE' && id) {
        db[col] = list.filter(x => String(x.id) !== String(id));
        writeDB(db);
        return sendJSON(res, 200, { ok: true });
      }
    }
    return sendJSON(res, 404, { error: 'Not found' });
  }

  const relPath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
  const filePath = path.join(ROOT, relPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    if (path.basename(filePath).toLowerCase() === 'index.html') {
      return res.end(injectEnvHtml(content));
    }
    res.end(content);
  });
}).listen(PORT, () => {
  console.log(`INKPEN Frontend running on http://localhost:${PORT}`);
});
