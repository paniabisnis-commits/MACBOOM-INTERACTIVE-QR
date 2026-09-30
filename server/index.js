import express from 'express';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const app = express();
const port = Number(process.env.PORT || 3000);
const adminToken = process.env.MACBOOM_ADMIN_TOKEN;
const dbFile = process.env.MACBOOM_DB_FILE || path.resolve('data/macboom.sqlite');
const dbDir = path.dirname(dbFile);
import fs from 'node:fs';
fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY, reward_id TEXT NOT NULL CHECK (reward_id IN ('dana','shopee')),
    url TEXT NOT NULL, batch TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    claimed_by TEXT, claimed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS coupons_available ON coupons(reward_id, claimed_by);
  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, reward_id TEXT NOT NULL,
    coupon_id TEXT NOT NULL UNIQUE REFERENCES coupons(id), points_spent INTEGER NOT NULL,
    claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, reward_id)
  );
`);
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.resolve('dist')));

const rewardCosts = { dana: 100, shopee: 100 };
const validUser = (value) => typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value);

app.get('/api/rewards/:rewardId/availability', (req, res) => {
  const rewardId = req.params.rewardId;
  if (!rewardCosts[rewardId]) return res.status(404).json({ error: 'Reward tidak dikenal.' });
  const row = db.prepare('SELECT COUNT(*) AS count FROM coupons WHERE reward_id = ? AND claimed_by IS NULL').get(rewardId);
  res.json({ available: row.count });
});

app.get('/api/claims/:userId', (req, res) => {
  if (!validUser(req.params.userId)) return res.status(400).json({ error: 'ID pengguna tidak valid.' });
  const rows = db.prepare(`SELECT claims.id, claims.reward_id AS rewardId, claims.claimed_at AS claimedAt,
    coupons.url FROM claims JOIN coupons ON coupons.id = claims.coupon_id
    WHERE claims.user_id = ? ORDER BY claims.claimed_at DESC`).all(req.params.userId);
  res.json({ claims: rows });
});

const claimCoupon = db.transaction(({ userId, rewardId, points }) => {
  const existing = db.prepare('SELECT id FROM claims WHERE user_id = ? AND reward_id = ?').get(userId, rewardId);
  if (existing) return { error: 'Reward ini sudah pernah diklaim.', status: 409 };
  const coupon = db.prepare(`SELECT id, url FROM coupons WHERE reward_id = ? AND claimed_by IS NULL ORDER BY created_at, id LIMIT 1`).get(rewardId);
  if (!coupon) return { error: 'Kuota saldo kaget sudah habis.', status: 410 };
  const claimId = randomUUID();
  const update = db.prepare('UPDATE coupons SET claimed_by = ?, claimed_at = CURRENT_TIMESTAMP WHERE id = ? AND claimed_by IS NULL').run(userId, coupon.id);
  if (update.changes !== 1) return { error: 'Kuota baru saja habis. Coba lagi.', status: 409 };
  db.prepare('INSERT INTO claims (id,user_id,reward_id,coupon_id,points_spent) VALUES (?,?,?,?,?)').run(claimId, userId, rewardId, coupon.id, points);
  return { claim: { id: claimId, rewardId, claimedAt: new Date().toISOString(), url: coupon.url } };
});

app.post('/api/claims', (req, res) => {
  const { userId, rewardId, points } = req.body || {};
  if (!validUser(userId) || !rewardCosts[rewardId] || !Number.isInteger(points))
    return res.status(400).json({ error: 'Data klaim tidak valid.' });
  if (points < rewardCosts[rewardId]) return res.status(400).json({ error: 'Poin tidak mencukupi.' });
  try {
    const result = claimCoupon.immediate({ userId, rewardId, points: rewardCosts[rewardId] });
    if (result.error) return res.status(result.status).json({ error: result.error });
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Reward ini sudah diklaim.' });
    console.error(error);
    res.status(500).json({ error: 'Klaim gagal diproses.' });
  }
});

app.post('/api/admin/coupons', (req, res) => {
  if (!adminToken || req.get('Authorization') !== `Bearer ${adminToken}`)
    return res.status(401).json({ error: 'Token admin tidak valid.' });
  const { rewardId, links, batch } = req.body || {};
  if (!rewardCosts[rewardId] || !Array.isArray(links) || links.length < 1 || links.length > 1000 ||
      links.some((url) => typeof url !== 'string' || !/^https:\/\//i.test(url)))
    return res.status(400).json({ error: 'Isi rewardId dan daftar link HTTPS (maksimal 1000).' });
  const batchId = typeof batch === 'string' && batch.trim() ? batch.trim().slice(0, 80) : randomUUID();
  const insert = db.prepare('INSERT INTO coupons (id,reward_id,url,batch) VALUES (?,?,?,?)');
  const addBatch = db.transaction(() => links.map((url) => insert.run(randomUUID(), rewardId, url, batchId)));
  addBatch();
  res.status(201).json({ added: links.length, batch: batchId });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const distIndex = path.resolve('dist/index.html');
app.get('*path', (_req, res) => {
  if (fs.existsSync(distIndex)) return res.sendFile(distIndex);
  res.status(404).send('Frontend belum dibuild. Jalankan npm run build.');
});

app.listen(port, () => console.log(`Macboom API aktif di http://localhost:${port}`));
