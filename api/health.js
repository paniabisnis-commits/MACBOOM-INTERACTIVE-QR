import { getSql, ensureSchema, sendError } from '../lib/vercel-db.js';

export default async function handler(_req, res) {
  try {
    const sql = getSql();
    await ensureSchema(sql);
    await sql`SELECT 1`;
    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendError(res, error, 'Database belum terhubung. Periksa DATABASE_URL di Vercel.');
  }
}
