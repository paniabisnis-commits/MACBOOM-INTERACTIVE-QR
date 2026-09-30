import { neon } from '@neondatabase/serverless';

let cachedSql;
export function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('Set DATABASE_URL (or POSTGRES_URL) in Vercel project settings.');
  cachedSql ||= neon(connectionString);
  return cachedSql;
}

export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS macboom_coupons (
    id TEXT PRIMARY KEY,
    reward_id TEXT NOT NULL CHECK (reward_id IN ('dana', 'shopee')),
    url TEXT NOT NULL,
    batch TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_by TEXT,
    claimed_at TIMESTAMPTZ
  )`;
  await sql`CREATE INDEX IF NOT EXISTS macboom_coupons_available_idx
    ON macboom_coupons (reward_id, created_at, id) WHERE claimed_by IS NULL`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS macboom_coupons_reward_url_idx
    ON macboom_coupons (reward_id, url)`;
  await sql`CREATE TABLE IF NOT EXISTS macboom_claims (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reward_id TEXT NOT NULL CHECK (reward_id IN ('dana', 'shopee')),
    coupon_id TEXT NOT NULL UNIQUE REFERENCES macboom_coupons(id),
    points_spent INTEGER NOT NULL,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, reward_id)
  )`;
}

export function validUserId(value) {
  return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value);
}

export const rewardCosts = { dana: 100, shopee: 100 };

export function sendError(res, error, fallback = 'Permintaan gagal diproses.') {
  console.error(error);
  return res.status(500).json({ error: fallback });
}
