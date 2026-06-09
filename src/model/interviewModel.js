const pool = require("../config/db");

async function scheduleInterview({ applicationId, scheduledAt, meetingLink, location, notes }) {
  const sql =
    "INSERT INTO interviews (application_id, scheduled_at, meeting_link, location, notes) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.execute(sql, [
    applicationId,
    scheduledAt,
    meetingLink || null,
    location || null,
    notes || null,
  ]);
  return result.insertId;
}

async function listInterviewsByApplication(applicationId) {
  const sql = "SELECT * FROM interviews WHERE application_id = ? ORDER BY scheduled_at ASC";
  const [rows] = await pool.execute(sql, [applicationId]);
  return rows;
}

async function getAllInterviews() {
  const sql = `
    SELECT i.*, u.email AS applicant_email, j.title AS job_title
    FROM interviews i
    JOIN applications a ON i.application_id = a.id
    JOIN users u ON a.applicant_user_id = u.id
    JOIN jobs j ON a.job_id = j.id
    ORDER BY i.scheduled_at ASC
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}

async function getInterviewsByRecruiter(ownerUserId) {
  const sql = `
    SELECT i.*, u.email AS applicant_email, j.title AS job_title
    FROM interviews i
    JOIN applications a ON i.application_id = a.id
    JOIN users u ON a.applicant_user_id = u.id
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    WHERE c.owner_user_id = ?
    ORDER BY i.scheduled_at ASC
  `;
  const [rows] = await pool.execute(sql, [ownerUserId]);
  return rows;
}

async function getInterviewsByApplicant(applicantUserId) {
  const sql = `
    SELECT i.*, j.title AS job_title, c.name AS company_name
    FROM interviews i
    JOIN applications a ON i.application_id = a.id
    JOIN jobs j ON a.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    WHERE a.applicant_user_id = ?
    ORDER BY i.scheduled_at ASC
  `;
  const [rows] = await pool.execute(sql, [applicantUserId]);
  return rows;
}

async function getInterviewById(id) {
  const [rows] = await pool.execute("SELECT * FROM interviews WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function updateInterview(id, { scheduledAt, meetingLink, location, notes }) {
  await pool.execute(
    "UPDATE interviews SET scheduled_at = ?, meeting_link = ?, location = ?, notes = ? WHERE id = ?",
    [scheduledAt, meetingLink || null, location || null, notes || null, id]
  );
}

async function deleteInterview(id) {
  await pool.execute("DELETE FROM interviews WHERE id = ?", [id]);
}

module.exports = {
  scheduleInterview,
  listInterviewsByApplication,
  getAllInterviews,
  getInterviewsByRecruiter,
  getInterviewsByApplicant,
  getInterviewById,
  updateInterview,
  deleteInterview,
};
