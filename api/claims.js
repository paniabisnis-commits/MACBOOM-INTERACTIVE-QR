import { randomUUID } from 'node:crypto';
import { getSql, ensureSchema, rewardCosts, validUserId, sendError } from '../lib/vercel-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });
  const { userId, rewardId, points } = req.body || {};
  const cost = rewardCosts[rewardId];
  if (!validUserId(userId) || !cost || !Number.isInteger(points))
    return res.status(400).json({ error: 'Data klaim tidak valid.' });
  if (points < cost) return res.status(400).json({ error: 'Poin tidak mencukupi.' });

  try {
    const sql = getSql();
    await ensureSchema(sql);
    const claimId = randomUUID();
    const rows = await sql`
      WITH candidate AS (
        SELECT c.id FROM macboom_coupons c
        WHERE c.reward_id = ${rewardId} AND c.claimed_by IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM macboom_claims old
            WHERE old.user_id = ${userId} AND old.reward_id = ${rewardId}
          )
        ORDER BY c.created_at, c.id
        LIMIT 1 FOR UPDATE SKIP LOCKED
      ), inserted AS (
        INSERT INTO macboom_claims (id, user_id, reward_id, coupon_id, points_spent)
        SELECT ${claimId}, ${userId}, ${rewardId}, candidate.id, ${cost} FROM candidate
        ON CONFLICT (user_id, reward_id) DO NOTHING
        RETURNING id, reward_id, coupon_id, claimed_at
      )
      UPDATE macboom_coupons c
      SET claimed_by = ${userId}, claimed_at = NOW()
      FROM inserted i WHERE c.id = i.coupon_id
      RETURNING i.id, i.reward_id AS "rewardId", i.claimed_at AS "claimedAt", c.url
    `;
    if (rows.length) return res.status(201).json({ claim: rows[0] });

    const prior = await sql`SELECT id FROM macboom_claims WHERE user_id = ${userId} AND reward_id = ${rewardId}`;
    if (prior.length) return res.status(409).json({ error: 'Reward ini sudah pernah diklaim.' });
    return res.status(410).json({ error: 'Kuota saldo kaget sudah habis.' });
  } catch (error) {
    return sendError(res, error);
  }
}
