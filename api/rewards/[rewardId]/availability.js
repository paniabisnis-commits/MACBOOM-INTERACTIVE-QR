import { getSql, ensureSchema, rewardCosts, sendError } from '../../../lib/vercel-db.js';

export default async function handler(req, res) {
  const { rewardId } = req.query;
  if (!rewardCosts[rewardId]) return res.status(404).json({ error: 'Reward tidak dikenal.' });
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`SELECT COUNT(*)::int AS available FROM macboom_coupons
      WHERE reward_id = ${rewardId} AND claimed_by IS NULL`;
    return res.status(200).json(rows[0]);
  } catch (error) {
    return sendError(res, error, 'Gagal memeriksa kuota reward.');
  }
}
