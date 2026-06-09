const pool = require("../config/db");

async function getJobById(id) {
  const [rows] = await pool.execute(
    `SELECT j.*, c.name AS company_name
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     WHERE j.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

const Job = {
  getAll: () =>
    pool.execute(`
      SELECT j.*, c.name AS company_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC
    `),

  getById: (id) =>
    pool.execute(
      `SELECT j.*, c.name AS company_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ?
       LIMIT 1`,
      [id]
    ),

  create: (data) =>
    pool.execute(
      `INSERT INTO jobs (company_id, title, description, location, required_skills, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.title,
        data.description,
        data.location || null,
        data.required_skills ? JSON.stringify(data.required_skills) : null,
        data.status || "open",
      ]
    ),

  update: (id, data) =>
    pool.execute(
      `UPDATE jobs SET title = ?, description = ?, location = ?,
        required_skills = ?, status = ?
       WHERE id = ?`,
      [
        data.title,
        data.description,
        data.location || null,
        data.required_skills ? JSON.stringify(data.required_skills) : null,
        data.status || "open",
        id,
      ]
    ),

  delete: (id) => pool.execute("DELETE FROM jobs WHERE id = ?", [id]),
};

module.exports = { ...Job, getJobById };
