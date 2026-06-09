const pool = require("../config/db");

async function getApplicationById(id) {
  const [rows] = await pool.execute(
    `SELECT a.*, u.email AS applicant_email, j.title AS job_title
     FROM applications a
     JOIN users u ON a.applicant_user_id = u.id
     JOIN jobs j ON a.job_id = j.id
     WHERE a.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updateApplicationStatus({ id, status }) {
  await pool.execute("UPDATE applications SET status = ? WHERE id = ?", [status, id]);
}

const Application = {
  getAll: () =>
    pool.execute(`
      SELECT a.*, u.email AS applicant_email,
             j.title AS job_title, c.name AS company_name
      FROM applications a
      JOIN users u ON a.applicant_user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      ORDER BY a.created_at DESC
    `),

  getById: (id) =>
    pool.execute(
      `SELECT a.*, u.email AS applicant_email, j.title AS job_title
       FROM applications a
       JOIN users u ON a.applicant_user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [id]
    ),

  getByUser: (applicant_user_id) =>
    pool.execute(
      `SELECT a.*, j.title AS job_title, c.name AS company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.applicant_user_id = ?
       ORDER BY a.created_at DESC`,
      [applicant_user_id]
    ),

  getByJob: (job_id) =>
    pool.execute(
      `SELECT a.*, u.email AS applicant_email
       FROM applications a
       JOIN users u ON a.applicant_user_id = u.id
       WHERE a.job_id = ?`,
      [job_id]
    ),

  create: ({ job_id, applicant_user_id }) =>
    pool.execute(
      "INSERT INTO applications (job_id, applicant_user_id) VALUES (?, ?)",
      [job_id, applicant_user_id]
    ),

  updateStatus: (id, status) =>
    pool.execute("UPDATE applications SET status = ? WHERE id = ?", [status, id]),

  delete: (id) => pool.execute("DELETE FROM applications WHERE id = ?", [id]),

  checkDuplicate: (job_id, applicant_user_id) =>
    pool.execute(
      "SELECT id FROM applications WHERE job_id = ? AND applicant_user_id = ?",
      [job_id, applicant_user_id]
    ),
};

module.exports = { ...Application, getApplicationById, updateApplicationStatus };
