const pool = require("../config/db");

const getDashboard = async (req, res) => {
  const { id, role } = req.user;

  try {
    if (role === "admin") {
      const [[{ total_users }]] = await pool.execute("SELECT COUNT(*) AS total_users FROM users");
      const [[{ total_companies }]] = await pool.execute("SELECT COUNT(*) AS total_companies FROM companies");
      const [[{ total_jobs }]] = await pool.execute("SELECT COUNT(*) AS total_jobs FROM jobs");
      const [[{ total_applications }]] = await pool.execute(
        "SELECT COUNT(*) AS total_applications FROM applications"
      );
      const [[{ total_interviews }]] = await pool.execute("SELECT COUNT(*) AS total_interviews FROM interviews");

      return res.json({
        success: true,
        role: "admin",
        stats: { total_users, total_companies, total_jobs, total_applications, total_interviews },
      });
    }

    if (role === "recruiter") {
      const [[{ total_jobs }]] = await pool.execute(
        `SELECT COUNT(*) AS total_jobs FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE c.owner_user_id = ?`,
        [id]
      );

      const [[{ total_applications }]] = await pool.execute(
        `SELECT COUNT(*) AS total_applications FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE c.owner_user_id = ?`,
        [id]
      );

      const [[{ total_shortlisted }]] = await pool.execute(
        "SELECT COUNT(*) AS total_shortlisted FROM shortlists WHERE recruiter_id = ?",
        [id]
      );

      const [[{ total_interviews }]] = await pool.execute(
        `SELECT COUNT(*) AS total_interviews FROM interviews i
         JOIN applications a ON i.application_id = a.id
         JOIN jobs j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE c.owner_user_id = ?`,
        [id]
      );

      return res.json({
        success: true,
        role: "recruiter",
        stats: { total_jobs, total_applications, total_shortlisted, total_interviews },
      });
    }

    if (role === "applicant" || role === "user") {
      const [[{ total_applied }]] = await pool.execute(
        "SELECT COUNT(*) AS total_applied FROM applications WHERE applicant_user_id = ?",
        [id]
      );

      const [status_breakdown] = await pool.execute(
        `SELECT status, COUNT(*) AS count FROM applications
         WHERE applicant_user_id = ? GROUP BY status`,
        [id]
      );

      const [[{ total_interviews }]] = await pool.execute(
        `SELECT COUNT(*) AS total_interviews FROM interviews i
         JOIN applications a ON i.application_id = a.id
         WHERE a.applicant_user_id = ?`,
        [id]
      );

      return res.json({
        success: true,
        role: "applicant",
        stats: { total_applied, total_interviews, status_breakdown },
      });
    }

    res.status(403).json({ success: false, message: "Role tidak dikenali." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
