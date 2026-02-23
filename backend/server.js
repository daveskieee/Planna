const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());

const DB_PATH = path.join(__dirname, 'db', 'planna.db');

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/api/bookings', (req, res) => {
  const { event_date, type, client_id, guests, price, status } = req.body;
  if (!event_date || !client_id || !guests || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const event_total = Number(price) * Number(guests);

  const db = openDb();
  db.serialize(() => {
    const insertEvent = `INSERT INTO Events (event_date, type, client_id, guests, price, status, event_total) VALUES (?,?,?,?,?,?,?)`;
    db.run(insertEvent, [event_date, type || null, client_id, guests, price, status || 'Pending', event_total], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      const eventId = this.lastID;
      const insertFinancial = `INSERT INTO Financials (event_id, amount) VALUES (?,?)`;
      db.run(insertFinancial, [eventId, event_total], function(err2) {
        db.close();
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        // Trigger AI update in background (detached)
        try {
          // Better approach: use HTTP POST to avoid Python spawn issues
          const httpReq = require('http');
          const data = JSON.stringify({ db_path: DB_PATH });
          const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/predict',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
          };
          const req = httpReq.request(options, (res) => {
            res.on('data', () => {});
            res.on('end', () => {
              // After AI completes, fetch latest analytics and broadcast via Socket.IO
              setTimeout(() => {
                const analyticsDb = openDb();
                analyticsDb.all('SELECT * FROM Analytics ORDER BY updated_at DESC LIMIT 1', [], (err, rows) => {
                  analyticsDb.close();
                  if (!err && rows.length > 0) {
                    io.emit('analytics:update', rows[0]);
                  }
                });
              }, 500);
            });
          });
          req.on('error', () => {}); // swallow errors
          req.write(data);
          req.end();
        } catch (e) {
          // best-effort; don't block the response
          console.warn('AI trigger failed:', e.message);
        }

        res.status(201).json({ id: eventId, event_total, status: status || 'Pending' });
      });
    });
  });
});

// JWT-based auth
const jwt = require('jsonwebtoken');
const AUTH_SECRET = process.env.AUTH_SECRET || 'planna_dev_secret_change_me';
const AUTH_EXPIRES = process.env.AUTH_EXPIRES || '2h';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  // In this prototype accept any credentials but sign a JWT.
  const payload = { username };
  const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: AUTH_EXPIRES });
  res.json({ token, username });
});

app.post('/api/logout', (req, res) => {
  // With stateless JWT we can't reliably revoke without a blacklist.
  // Client should discard the token; return ok.
  res.json({ ok: true });
});

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, AUTH_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Export bookings as CSV
app.get('/api/export', verifyToken, (req, res) => {

  const q = req.query.q || '';
  const db = openDb();
  let sql = 'SELECT * FROM Events';
  const params = [];
  if (q) {
    sql += ' WHERE client_id LIKE ? OR type LIKE ? OR event_date LIKE ?';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY event_date DESC';
  db.all(sql, params, (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    // Build CSV
    const headers = ['id','event_date','type','client_id','guests','price','status','event_total','created_at'];
    const csvRows = [headers.join(',')];
    rows.forEach(r => {
      const vals = headers.map(h => {
        const v = r[h] === null || r[h] === undefined ? '' : String(r[h]);
        // escape quotes
        return '"' + v.replace(/"/g, '""') + '"';
      });
      csvRows.push(vals.join(','));
    });
    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="planna_bookings.csv"');
    res.send(csv);
  });
});

app.get('/api/bookings', (req, res) => {
  const q = req.query.q || '';
  const db = openDb();
  let sql = 'SELECT * FROM Events';
  const params = [];
  if (q) {
    sql += ' WHERE client_id LIKE ? OR type LIKE ? OR event_date LIKE ?';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY event_date DESC LIMIT 100';
  db.all(sql, params, (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/analytics', (req, res) => {
  const db = openDb();
  db.all('SELECT * FROM Analytics ORDER BY updated_at DESC LIMIT 10', [], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Planna backend listening on ${PORT}`));
