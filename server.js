// Zero-dependency server — no npm install needed.
// Serves static files + a small API for the participant↔operator chat channel.

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const crypto = require('crypto');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript',
  '.json': 'application/json',
  '.css':  'text/css',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
};

// ─── In-memory session state ────────────────────────────────────────────────
// Everything is wiped on server restart — intentional, each study session
// starts clean. Use the /api/log endpoint to download a session log first.

const participants        = new Map();  // id → { id, name, joinedAt }
const messageLog          = [];         // full audit trail for the session
const operatorClients     = new Set();  // SSE res objects for operator panel(s)
const participantClients  = new Map();  // id → Set of SSE res objects

const uid = () => crypto.randomBytes(6).toString('hex');

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e5) { req.destroy(); reject(new Error('Body too large')); }
    });
    req.on('end',   () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function sseWrite(res, event) {
  try { res.write(`data: ${JSON.stringify(event)}\n\n`); } catch (e) {}
}

function broadcastToOperators(event) {
  for (const res of operatorClients) sseWrite(res, event);
}

function sendToParticipant(id, event) {
  const set = participantClients.get(id);
  if (!set) return;
  for (const res of set) sseWrite(res, event);
}

// ─── HTTP server ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url   = new URL(req.url, `http://${req.headers.host}`);
  const route = url.pathname;

  // ── POST /api/join — participant enters name, receives an id ─────────────
  if (route === '/api/join' && req.method === 'POST') {
    try {
      const { name } = await readBody(req);
      if (!name || typeof name !== 'string' || !name.trim()) {
        return sendJSON(res, 400, { error: 'Name required' });
      }
      const participant = {
        id: uid(),
        name: name.trim().slice(0, 40),
        joinedAt: Date.now(),
      };
      participants.set(participant.id, participant);
      broadcastToOperators({ type: 'participant_joined', participant });
      return sendJSON(res, 200, participant);
    } catch (e) {
      return sendJSON(res, 400, { error: 'Invalid request' });
    }
  }

  // ── POST /api/send — participant sends a message ─────────────────────────
  if (route === '/api/send' && req.method === 'POST') {
    try {
      const { participantId, text } = await readBody(req);
      const p = participants.get(participantId);
      if (!p) return sendJSON(res, 404, { error: 'Unknown participant' });
      if (!text || typeof text !== 'string' || !text.trim()) {
        return sendJSON(res, 400, { error: 'Empty message' });
      }
      const message = {
        id: uid(),
        from: 'participant',
        participantId: p.id,
        participantName: p.name,
        text: text.trim().slice(0, 2000),
        timestamp: Date.now(),
      };
      messageLog.push(message);
      broadcastToOperators({ type: 'participant_message', message });
      return sendJSON(res, 200, { ok: true, id: message.id });
    } catch (e) {
      return sendJSON(res, 400, { error: 'Invalid request' });
    }
  }

  // ── POST /api/reply — operator sends a pre-scripted ack to a participant ─
  if (route === '/api/reply' && req.method === 'POST') {
    try {
      const { participantId, text, replyId } = await readBody(req);
      const p = participants.get(participantId);
      if (!p) return sendJSON(res, 404, { error: 'Unknown participant' });
      if (!text || typeof text !== 'string') {
        return sendJSON(res, 400, { error: 'Reply text required' });
      }
      const message = {
        id: uid(),
        from: 'mediator',
        participantId: p.id,
        participantName: p.name,
        text,
        replyId: replyId || null,
        timestamp: Date.now(),
      };
      messageLog.push(message);
      sendToParticipant(p.id, { type: 'mediator_message', message });
      broadcastToOperators({ type: 'mediator_message_sent', message });
      return sendJSON(res, 200, { ok: true, id: message.id });
    } catch (e) {
      return sendJSON(res, 400, { error: 'Invalid request' });
    }
  }

  // ── GET /api/log — export full session log as JSON for analysis ──────────
  if (route === '/api/log' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="session-${Date.now()}.json"`,
    });
    return res.end(JSON.stringify({
      exportedAt: new Date().toISOString(),
      participants: Array.from(participants.values()),
      messages: messageLog,
    }, null, 2));
  }

  // ── POST /api/reset — clear session state (useful between test groups) ───
  if (route === '/api/reset' && req.method === 'POST') {
    participants.clear();
    messageLog.length = 0;
    broadcastToOperators({ type: 'session_reset' });
    return sendJSON(res, 200, { ok: true });
  }

  // ── GET /api/events — SSE stream ─────────────────────────────────────────
  //   ?role=operator                → operator panel subscribes
  //   ?role=participant&id=<uid>    → individual participant subscribes
  if (route === '/api/events' && req.method === 'GET') {
    const role = url.searchParams.get('role');
    const pid  = url.searchParams.get('id');

    res.writeHead(200, {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': connected\n\n');

    const heartbeat = setInterval(() => {
      try { res.write(': hb\n\n'); } catch (e) {}
    }, 25000);

    if (role === 'operator') {
      operatorClients.add(res);
      // replay state so a reconnecting operator sees current participants/messages
      sseWrite(res, {
        type: 'snapshot',
        participants: Array.from(participants.values()),
        messages: messageLog,
      });
      req.on('close', () => {
        clearInterval(heartbeat);
        operatorClients.delete(res);
      });
    } else if (role === 'participant' && pid && participants.has(pid)) {
      if (!participantClients.has(pid)) participantClients.set(pid, new Set());
      participantClients.get(pid).add(res);
      req.on('close', () => {
        clearInterval(heartbeat);
        const set = participantClients.get(pid);
        if (set) { set.delete(res); if (set.size === 0) participantClients.delete(pid); }
      });
    } else {
      clearInterval(heartbeat);
      res.end();
    }
    return;
  }

  // ── Static files ─────────────────────────────────────────────────────────
  const safePath = path.normalize(route);
  const filePath = path.join(__dirname, safePath === '/' ? 'participant.html' : safePath);

  // prevent directory traversal (belt & braces)
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ─── Local-network IP discovery (so participants can reach the server) ──────
function localIPs() {
  const ips = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const a of iface) {
      if (a.family === 'IPv4' && !a.internal) ips.push(a.address);
    }
  }
  return ips;
}

// Render (and most hosts) assign the port via env var; fall back to 3000 locally.
const PORT = process.env.PORT || 3000;
const IS_DEPLOYED = !!process.env.PORT; // rough heuristic, good enough for log messages

server.listen(PORT, () => {
  console.log('\n  AI Mediator Prototype — listening on port ' + PORT + '\n');

  if (IS_DEPLOYED) {
    console.log('  Running in deployed mode. Use your public URL, e.g.:');
    console.log('    Mediator screen   →  https://<your-app>.onrender.com/participant.html');
    console.log('    Operator panel    →  https://<your-app>.onrender.com/operator.html');
    console.log('    Participant chat  →  https://<your-app>.onrender.com/chat.html');
  } else {
    const ips = localIPs();
    console.log('  On this machine (researcher laptop):');
    console.log('    Mediator screen   →  http://localhost:' + PORT + '/participant.html');
    console.log('    Operator panel    →  http://localhost:' + PORT + '/operator.html');
    console.log('');
    if (ips.length) {
      console.log('  For participant laptops on the same Wi-Fi:');
      for (const ip of ips) console.log('    Participant chat  →  http://' + ip + ':' + PORT + '/chat.html');
    } else {
      console.log('  No local IP detected — participants need network access to this machine.');
    }
    console.log('\n  Session tools:');
    console.log('    Download log      →  http://localhost:' + PORT + '/api/log');
    console.log('    Reset session     →  POST http://localhost:' + PORT + '/api/reset');
  }
  console.log('\n  Ctrl+C to stop.\n');
});
