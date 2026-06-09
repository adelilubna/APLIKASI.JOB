const { getJobById } = require("../model/jobModel");
const pool = require("../config/db");

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeSkills(skills) {
  return skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
}

function scoreSkills(requiredSkills, candidateSkills) {
  const req = new Set(normalizeSkills(requiredSkills));
  const cand = new Set(normalizeSkills(candidateSkills));
  if (req.size === 0) return 0;
  let hit = 0;
  for (const s of req) if (cand.has(s)) hit += 1;
  return Math.round((hit / req.size) * 100);
}

exports.matchCandidatesForJob = async (req, res) => {
  const jobId = Number(req.params.job_id);
  if (!jobId) return res.status(400).json({ message: "Invalid job_id" });

  const job = await getJobById(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const requiredSkills = toArray(job.required_skills);

  const sql = `
    SELECT u.id AS user_id, u.email, u.role, p.full_name, p.location, p.education, p.experience_years, p.skills
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.role IN ('applicant','user')
  `;
  const [rows] = await pool.execute(sql);

  const matches = rows
    .map((r) => {
      const candidateSkills = toArray(r.skills);
      const matchScore = scoreSkills(requiredSkills, candidateSkills);
      return {
        userId: r.user_id,
        email: r.email,
        fullName: r.full_name,
        location: r.location,
        education: r.education,
        experienceYears: r.experience_years,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    job: { id: jobId, title: job.title, requiredSkills },
    matches,
  });
};

exports.matchJobsForUser = async (req, res) => {
  const userId = req.user.id;

  const [profileRows] = await pool.execute("SELECT * FROM profiles WHERE user_id = ? LIMIT 1", [userId]);
  if (!profileRows.length) {
    return res.status(404).json({ message: "Profile not found. Complete your profile first." });
  }

  const candidateSkills = toArray(profileRows[0].skills);

  const [jobs] = await pool.execute(
    `SELECT j.id, j.title, j.location, j.required_skills, c.name AS company_name
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     WHERE j.status = 'open'`
  );

  const matches = jobs
    .map((job) => {
      const requiredSkills = toArray(job.required_skills);
      const matchScore = scoreSkills(requiredSkills, candidateSkills);
      return {
        jobId: job.id,
        title: job.title,
        location: job.location,
        companyName: job.company_name,
        requiredSkills,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ matches });
};
