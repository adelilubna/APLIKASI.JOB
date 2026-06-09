const { Job, Company, User, Profile } = require("../model/index");

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

  try {
    const job = await Job.findByPk(jobId, {
      include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const requiredSkills = toArray(job.required_skills);

    const candidates = await User.findAll({
      where: { role: ["applicant", "user"] },
      attributes: ["id", "email", "role"],
      include: [{ model: Profile, as: "profile" }],
    });

    const matches = candidates
      .filter((u) => u.profile)
      .map((u) => {
        const candidateSkills = toArray(u.profile.skills);
        return {
          userId: u.id,
          email: u.email,
          fullName: u.profile.full_name,
          location: u.profile.location,
          education: u.profile.education,
          experienceYears: u.profile.experience_years,
          matchScore: scoreSkills(requiredSkills, candidateSkills),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ job: { id: jobId, title: job.title, requiredSkills }, matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.matchJobsForUser = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found. Complete your profile first." });
    }

    const candidateSkills = toArray(profile.skills);

    const jobs = await Job.findAll({
      where: { status: "open" },
      include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    });

    const matches = jobs
      .map((job) => {
        const requiredSkills = toArray(job.required_skills);
        return {
          jobId: job.id,
          title: job.title,
          location: job.location,
          companyName: job.company?.name,
          requiredSkills,
          matchScore: scoreSkills(requiredSkills, candidateSkills),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
