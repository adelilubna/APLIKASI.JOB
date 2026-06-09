const pool = require("../config/db");

const Shortlist = {
  create: ({ application_id, recruiter_id }) =>
    pool.execute(
      "INSERT INTO shortlists (application_id, recruiter_id) VALUES (?, ?)",
      [application_id, recruiter_id]
    ),

  getByRecruiter: (recruiter_id) =>
    pool.execute(
      `SELECT s.id, s.created_at,
              u.email AS applicant_email,
              j.title AS job_title,
              a.status AS application_status
       FROM shortlists s
       JOIN applications a ON s.application_id = a.id
       JOIN users u ON a.applicant_user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       WHERE s.recruiter_id = ?
       ORDER BY s.created_at DESC`,
      [recruiter_id]
    ),

  findByApplicationAndRecruiter: (application_id, recruiter_id) =>
    pool.execute(
      "SELECT id FROM shortlists WHERE application_id = ? AND recruiter_id = ?",
      [application_id, recruiter_id]
    ),

  getById: (id) => pool.execute("SELECT * FROM shortlists WHERE id = ?", [id]),

  delete: (id) => pool.execute("DELETE FROM shortlists WHERE id = ?", [id]),
};

module.exports = Shortlist;
