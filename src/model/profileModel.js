const pool = require("../config/db");

async function upsertProfile({
  userId,
  fullName,
  location,
  education,
  experienceYears,
  skills,
  cvUrl,
}) {
  const sql = `
    INSERT INTO profiles (user_id, full_name, location, education, experience_years, skills, cv_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      location = VALUES(location),
      education = VALUES(education),
      experience_years = VALUES(experience_years),
      skills = VALUES(skills),
      cv_url = VALUES(cv_url)
  `;

  const skillsJson = skills ? JSON.stringify(skills) : null;

  await pool.execute(sql, [
    userId,
    fullName || null,
    location || null,
    education || null,
    typeof experienceYears === "number" ? experienceYears : 0,
    skillsJson,
    cvUrl || null,
  ]);

  return true;
}

async function getProfileByUserId(userId) {
  const sql = "SELECT * FROM profiles WHERE user_id = ? LIMIT 1";
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0] || null;
}

module.exports = { upsertProfile, getProfileByUserId };

