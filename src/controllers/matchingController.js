const { Job, Company, Category, User, Profile } = require("../model/index");

// Urutan tingkat pendidikan (semakin tinggi index, semakin tinggi pendidikan)
const EDU_RANK = { "SMA/SMK": 1, D3: 2, S1: 3, S2: 4, S3: 5 };

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

// Skor skill: bobot 50%
function scoreSkills(requiredSkills, candidateSkills) {
  const req = new Set(normalizeSkills(requiredSkills));
  const cand = new Set(normalizeSkills(candidateSkills));
  if (req.size === 0) return 50; // tidak ada requirement = nilai penuh
  let hit = 0;
  for (const s of req) if (cand.has(s)) hit += 1;
  return Math.round((hit / req.size) * 50);
}

// Skor pendidikan: bobot 20%
function scoreEducation(requiredLevel, candidateLevel) {
  if (!requiredLevel) return 20; // tidak ada requirement = nilai penuh
  if (!candidateLevel) return 0;
  const reqRank = EDU_RANK[requiredLevel] || 0;
  const candRank = EDU_RANK[candidateLevel] || 0;
  if (candRank >= reqRank) return 20;
  // Beri nilai parsial jika mendekati
  const diff = reqRank - candRank;
  return Math.max(0, 20 - diff * 7);
}

// Skor pengalaman: bobot 20%
function scoreExperience(minYears, candidateYears) {
  const min = Number(minYears) || 0;
  const cand = Number(candidateYears) || 0;
  if (min === 0) return 20;
  if (cand >= min) return 20;
  return Math.round((cand / min) * 20);
}

// Skor lokasi: bobot 10%
function scoreLocation(jobLocation, candidateLocation) {
  if (!jobLocation || !candidateLocation) return 5; // salah satu kosong: setengah nilai
  const jLoc = String(jobLocation).trim().toLowerCase();
  const cLoc = String(candidateLocation).trim().toLowerCase();
  if (jLoc === cLoc) return 10;
  // Cek partial match (misal "Jakarta" ada di "Jakarta Selatan")
  if (jLoc.includes(cLoc) || cLoc.includes(jLoc)) return 7;
  return 0;
}

// GET /api/matching/job/:job_id — cari kandidat yang cocok untuk suatu lowongan
exports.matchCandidatesForJob = async (req, res) => {
  const jobId = Number(req.params.job_id);
  if (!jobId) return res.status(400).json({ message: "Invalid job_id" });

  try {
    const job = await Job.findByPk(jobId, {
      include: [
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });
    if (!job) return res.status(404).json({ message: "Lowongan tidak ditemukan." });

    const requiredSkills = toArray(job.required_skills);

    const candidates = await User.findAll({
      where: { role: "applicant" },
      attributes: ["id", "email"],
      include: [{ model: Profile, as: "profile" }],
    });

    const matches = candidates
      .filter((u) => u.profile)
      .map((u) => {
        const p = u.profile;
        const skillScore = scoreSkills(requiredSkills, toArray(p.skills));
        const eduScore = scoreEducation(job.education_required, p.education_level);
        const expScore = scoreExperience(job.experience_min_years, p.experience_years);
        const locScore = scoreLocation(job.location, p.location);
        const total = skillScore + eduScore + expScore + locScore;

        return {
          userId: u.id,
          email: u.email,
          fullName: p.full_name,
          location: p.location,
          education: p.education,
          educationLevel: p.education_level,
          experienceYears: p.experience_years,
          cvUrl: p.cv_url,
          matchScore: total,
          breakdown: { skillScore, eduScore, expScore, locScore },
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      job: {
        id: jobId,
        title: job.title,
        requiredSkills,
        educationRequired: job.education_required,
        experienceMinYears: job.experience_min_years,
        location: job.location,
      },
      matches,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/matching/user — cari lowongan yang cocok untuk pelamar
exports.matchJobsForUser = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: "Lengkapi profil terlebih dahulu." });
    }

    const candidateSkills = toArray(profile.skills);

    const jobs = await Job.findAll({
      where: { status: "open" },
      include: [
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    const matches = jobs
      .map((job) => {
        const requiredSkills = toArray(job.required_skills);
        const skillScore = scoreSkills(requiredSkills, candidateSkills);
        const eduScore = scoreEducation(job.education_required, profile.education_level);
        const expScore = scoreExperience(job.experience_min_years, profile.experience_years);
        const locScore = scoreLocation(job.location, profile.location);
        const total = skillScore + eduScore + expScore + locScore;

        return {
          jobId: job.id,
          title: job.title,
          location: job.location,
          jobType: job.job_type,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          companyName: job.company?.name,
          category: job.category?.name,
          requiredSkills,
          deadline: job.deadline,
          matchScore: total,
          breakdown: { skillScore, eduScore, expScore, locScore },
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
