const { Op } = require("sequelize");
const { Job, Company, Category } = require("../model/index");

const VALID_STATUS = new Set(["open", "closed"]);
const VALID_JOB_TYPE = new Set(["full-time", "part-time", "contract", "internship", "freelance"]);
const VALID_EDU = new Set(["SMA/SMK", "D3", "S1", "S2", "S3"]);

// Ambil company milik user (untuk company/recruiter role)
const getMyCompany = async (user) => {
  if (user.role === "company") {
    return await Company.findOne({ where: { owner_user_id: user.id } });
  }
  if (user.role === "recruiter" && user.company_id) {
    return await Company.findByPk(user.company_id);
  }
  return null;
};

const getAll = async (req, res) => {
  try {
    const { category_id, location, job_type, status, company_id, keyword } = req.query;
    const where = {};

    if (category_id) where.category_id = Number(category_id);
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (job_type && VALID_JOB_TYPE.has(job_type)) where.job_type = job_type;
    if (status && VALID_STATUS.has(status)) where.status = status;
    else where.status = "open"; // default tampilkan yang open saja
    if (company_id) where.company_id = Number(company_id);
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };

    const rows = await Job.findAll({
      where,
      include: [
        { model: Company, as: "company", attributes: ["id", "name", "location", "logo_url"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });
  try {
    const job = await Job.findByPk(id, {
      include: [
        { model: Company, as: "company", attributes: ["id", "name", "email", "website", "location", "logo_url", "is_verified"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const {
    company_id, category_id, title, description, location,
    job_type, education_required, experience_min_years,
    salary_min, salary_max, required_skills, deadline, status,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "title dan description wajib diisi." });
  }
  if (job_type && !VALID_JOB_TYPE.has(job_type)) {
    return res.status(400).json({ success: false, message: `job_type tidak valid. Pilihan: ${[...VALID_JOB_TYPE].join(", ")}` });
  }
  if (education_required && !VALID_EDU.has(education_required)) {
    return res.status(400).json({ success: false, message: `education_required tidak valid.` });
  }

  try {
    let targetCompanyId = company_id ? Number(company_id) : null;

    // company/recruiter: otomatis pakai company mereka sendiri
    if (req.user.role !== "admin") {
      const myCompany = await getMyCompany(req.user);
      if (!myCompany) {
        return res.status(403).json({ success: false, message: "Anda belum memiliki perusahaan." });
      }
      targetCompanyId = myCompany.id;
    }

    if (!targetCompanyId) {
      return res.status(400).json({ success: false, message: "company_id wajib diisi." });
    }

    const job = await Job.create({
      company_id: targetCompanyId,
      category_id: category_id ? Number(category_id) : null,
      title: String(title).trim(),
      description: String(description),
      location: location || null,
      job_type: job_type || "full-time",
      education_required: education_required || null,
      experience_min_years: experience_min_years ? Number(experience_min_years) : 0,
      salary_min: salary_min ? Number(salary_min) : null,
      salary_max: salary_max ? Number(salary_max) : null,
      required_skills: required_skills || null,
      deadline: deadline || null,
      status: status || "open",
    });
    res.status(201).json({ success: true, message: "Lowongan berhasil dibuat.", data: { id: job.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  try {
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });

    // Cek kepemilikan untuk non-admin
    if (req.user.role !== "admin") {
      const myCompany = await getMyCompany(req.user);
      if (!myCompany || myCompany.id !== job.company_id) {
        return res.status(403).json({ success: false, message: "Akses ditolak." });
      }
    }

    const {
      category_id, title, description, location,
      job_type, education_required, experience_min_years,
      salary_min, salary_max, required_skills, deadline, status,
    } = req.body;

    if (job_type && !VALID_JOB_TYPE.has(job_type)) {
      return res.status(400).json({ success: false, message: `job_type tidak valid.` });
    }
    if (status && !VALID_STATUS.has(status)) {
      return res.status(400).json({ success: false, message: `status harus 'open' atau 'closed'.` });
    }

    await job.update({
      category_id: category_id !== undefined ? (category_id ? Number(category_id) : null) : job.category_id,
      title: title ? String(title).trim() : job.title,
      description: description !== undefined ? description : job.description,
      location: location !== undefined ? location : job.location,
      job_type: job_type || job.job_type,
      education_required: education_required !== undefined ? education_required : job.education_required,
      experience_min_years: experience_min_years !== undefined ? Number(experience_min_years) : job.experience_min_years,
      salary_min: salary_min !== undefined ? (salary_min ? Number(salary_min) : null) : job.salary_min,
      salary_max: salary_max !== undefined ? (salary_max ? Number(salary_max) : null) : job.salary_max,
      required_skills: required_skills !== undefined ? required_skills : job.required_skills,
      deadline: deadline !== undefined ? deadline : job.deadline,
      status: status || job.status,
    });
    res.json({ success: true, message: "Lowongan berhasil diupdate." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });
  try {
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });

    if (req.user.role !== "admin") {
      const myCompany = await getMyCompany(req.user);
      if (!myCompany || myCompany.id !== job.company_id) {
        return res.status(403).json({ success: false, message: "Akses ditolak." });
      }
    }

    await job.destroy();
    res.json({ success: true, message: "Lowongan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
