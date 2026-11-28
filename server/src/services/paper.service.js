import pool from "../config/db.js";

// Helper to format a paper row for API responses
function formatPaperRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    authors: row.authors || [],
    publication_year: row.publication_year,
    collection: row.collection || "General",
    reading_status: row.status || "not read",
    currentPage: row.current_page || 1,
    totalPages: row.total_pages || 14,
    date_added: row.date_added ? new Date(row.date_added).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    created_at: row.created_at,
    venue: row.venue || "arXiv",
    arxiv_id: row.arxiv_id || null,
    pdf_url: row.pdf_url || null,
    abstract: row.abstract || "",
    notes: row.notes || "",
    highlights: row.highlights || [],
    tags: row.tags || [],
  };
}

export async function getAllPapers(ownerId) {
  let query = `
    SELECT p.*,
           COALESCE(
             array_agg(pa.author_name ORDER BY pa.author_order) FILTER (WHERE pa.author_name IS NOT NULL),
             '{}'::text[]
           ) as authors
    FROM papers p
    LEFT JOIN paper_authors pa ON p.id = pa.paper_id
  `;
  const params = [];

  if (ownerId) {
    query += ` WHERE p.owner_id = $1`;
    params.push(ownerId);
  }

  query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows.map(formatPaperRow);
}

export async function getPaperById(id) {
  const query = `
    SELECT p.*,
           COALESCE(
             array_agg(pa.author_name ORDER BY pa.author_order) FILTER (WHERE pa.author_name IS NOT NULL),
             '{}'::text[]
           ) as authors
    FROM papers p
    LEFT JOIN paper_authors pa ON p.id = pa.paper_id
    WHERE p.id = $1
    GROUP BY p.id
  `;
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;
  return formatPaperRow(result.rows[0]);
}

export async function createPaper(paperData) {
  const {
    owner_id,
    title,
    authors = [],
    publication_year,
    collection = "General",
    reading_status = "not read",
    status,
    currentPage = 1,
    current_page = 1,
    totalPages = 14,
    total_pages = 14,
    date_added,
    venue = "arXiv",
    arxiv_id = null,
    pdf_url = null,
    abstract = "",
    notes = "",
    highlights = [],
    tags = [],
  } = paperData;

  const resolvedOwnerId = owner_id || (await getDefaultOwnerId());
  const finalStatus = reading_status || status || "not read";
  const finalCurrentPage = currentPage || current_page || 1;
  const finalTotalPages = totalPages || total_pages || 14;
  const finalDateAdded = date_added || new Date().toISOString().slice(0, 10);

  const insertQuery = `
    INSERT INTO papers
      (owner_id, title, abstract, publication_year, venue, arxiv_id, pdf_url,
       status, current_page, total_pages, date_added, collection, notes, highlights, tags)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [
    resolvedOwnerId,
    title,
    abstract,
    publication_year || 2024,
    venue,
    arxiv_id,
    pdf_url,
    finalStatus,
    finalCurrentPage,
    finalTotalPages,
    finalDateAdded,
    collection,
    notes,
    JSON.stringify(highlights || []),
    tags || [],
  ]);

  const newPaper = result.rows[0];

  // Insert authors
  if (Array.isArray(authors) && authors.length > 0) {
    for (let i = 0; i < authors.length; i++) {
      await pool.query(
        `INSERT INTO paper_authors (paper_id, author_name, author_order)
         VALUES ($1, $2, $3)`,
        [newPaper.id, authors[i], i + 1]
      );
    }
  }

  // Ensure collection exists
  if (collection) {
    await pool.query(
      `INSERT INTO collections (owner_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [resolvedOwnerId, collection]
    );
  }

  return getPaperById(newPaper.id);
}

export async function updatePaper(id, updates) {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIdx++}`);
    values.push(updates.title);
  }
  if (updates.abstract !== undefined) {
    fields.push(`abstract = $${paramIdx++}`);
    values.push(updates.abstract);
  }
  if (updates.publication_year !== undefined) {
    fields.push(`publication_year = $${paramIdx++}`);
    values.push(updates.publication_year);
  }
  if (updates.reading_status !== undefined || updates.status !== undefined) {
    fields.push(`status = $${paramIdx++}`);
    values.push(updates.reading_status || updates.status);
  }
  if (updates.currentPage !== undefined || updates.current_page !== undefined) {
    fields.push(`current_page = $${paramIdx++}`);
    values.push(updates.currentPage || updates.current_page);
  }
  if (updates.totalPages !== undefined || updates.total_pages !== undefined) {
    fields.push(`total_pages = $${paramIdx++}`);
    values.push(updates.totalPages || updates.total_pages);
  }
  if (updates.collection !== undefined) {
    fields.push(`collection = $${paramIdx++}`);
    values.push(updates.collection);
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIdx++}`);
    values.push(updates.notes);
  }
  if (updates.highlights !== undefined) {
    fields.push(`highlights = $${paramIdx++}`);
    values.push(JSON.stringify(updates.highlights));
  }
  if (updates.tags !== undefined) {
    fields.push(`tags = $${paramIdx++}`);
    values.push(updates.tags);
  }

  if (fields.length > 0) {
    values.push(id);
    const updateQuery = `
      UPDATE papers
      SET ${fields.join(", ")}
      WHERE id = $${paramIdx}
      RETURNING *
    `;
    await pool.query(updateQuery, values);
  }

  // Update authors if provided
  if (Array.isArray(updates.authors)) {
    await pool.query("DELETE FROM paper_authors WHERE paper_id = $1", [id]);
    for (let i = 0; i < updates.authors.length; i++) {
      await pool.query(
        `INSERT INTO paper_authors (paper_id, author_name, author_order)
         VALUES ($1, $2, $3)`,
        [id, updates.authors[i], i + 1]
      );
    }
  }

  return getPaperById(id);
}

export async function deletePaper(id) {
  const result = await pool.query("DELETE FROM papers WHERE id = $1 RETURNING id", [id]);
  return result.rows.length > 0;
}

export async function addHighlight(paperId, highlight) {
  const paper = await getPaperById(paperId);
  if (!paper) return null;
  const highlights = [...(paper.highlights || []), highlight];
  return updatePaper(paperId, { highlights });
}

export async function deleteHighlight(paperId, highlightId) {
  const paper = await getPaperById(paperId);
  if (!paper) return null;
  const highlights = (paper.highlights || []).filter((h) => h.id !== highlightId);
  return updatePaper(paperId, { highlights });
}

// Helper to get fallback default owner id
async function getDefaultOwnerId() {
  const res = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
  return res.rows[0]?.id || 1;
}
