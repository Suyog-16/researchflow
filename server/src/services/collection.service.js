import pool from "../config/db.js";

export async function getAllCollections(ownerId) {
  const query = `
    SELECT c.id, c.name,
           COUNT(p.id)::int as count
    FROM collections c
    LEFT JOIN papers p ON (p.collection = c.name)
    GROUP BY c.id, c.name
    ORDER BY count DESC, c.name ASC
  `;
  const result = await pool.query(query);
  return result.rows.map((row) => ({
    id: `col-${row.id}`,
    name: row.name,
    count: row.count || 0,
  }));
}

export async function createCollection(name, ownerId) {
  const resolvedOwnerId = ownerId || (await getDefaultOwnerId());
  const result = await pool.query(
    `INSERT INTO collections (owner_id, name)
     VALUES ($1, $2)
     ON CONFLICT (owner_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name`,
    [resolvedOwnerId, name]
  );
  return {
    id: `col-${result.rows[0].id}`,
    name: result.rows[0].name,
    count: 0,
  };
}

async function getDefaultOwnerId() {
  const res = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
  return res.rows[0]?.id || 1;
}
