import pool from "../config/db.js";

export async function createPaper(paper) {
    const { owner_id, title, abstract, publication_year } = paper;

    const result = await pool.query(
        `INSERT INTO papers
         (owner_id, title, abstract, publication_year)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [owner_id, title, abstract, publication_year]
    );

    return result.rows[0];
}
export async function getAllPapers(owner_id) {
    const result = await pool.query(
        `SELECT * FROM papers
         WHERE owner_id = $1
         ORDER BY created_at DESC`,
        [owner_id]
    );

    return result.rows;
}