import { randomUUID } from 'node:crypto';
import { getSql, ensureSchema, rewardCosts, sendError } from '../../lib/vercel-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });
  const expected = process.env.MACBOOM_ADMIN_TOKEN;
  if (!expected || req.headers.authorization !== `Bearer ${expected}`)
    return res.status(401).json({ error: 'Token admin tidak valid.' });
  const { rewardId, links, batch } = req.body || {};
  if (!rewardCosts[rewardId] || !Array.isArray(links) || links.length < 1 || links.length > 1000 ||
      links.some((url) => typeof url !== 'string' || !/^https:\/\//i.test(url)))
    return res.status(400).json({ error: 'Isi rewardId dan daftar link HTTPS (maksimal 1000).' });

  try {
    const sql = getSql();
    await ensureSchema(sql);
    const batchId = typeof batch === 'string' && batch.trim() ? batch.trim().slice(0, 80) : randomUUID();
    let added = 0;
    for (const url of links) {
      const rows = await sql`
        INSERT INTO macboom_coupons (id, reward_id, url, batch)
        VALUES (${randomUUID()}, ${rewardId}, ${url}, ${batchId})
        ON CONFLICT (reward_id, url) DO NOTHING
        RETURNING id
      `;
      added += rows.length;
    }
    return res.status(201).json({ added, batch: batchId });
  } catch (error) {
    return sendError(res, error);
  }
}
