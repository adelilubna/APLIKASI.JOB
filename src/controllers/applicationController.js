const { Application, Job, Company, User, Profile } = require("../model/index");

const VALID_STATUS = new Set(["Applied", "Reviewed", "Interview", "Accepted", "Rejected"]);

const getAll = async (req, res) => {
  try {
    const { role, id, company_id } = req.user;
    let where = {};

    if (role === "applicant") {
      where = { applicant_user_id: id };
    } else if (role === "company") {
      // company: lihat lamaran untuk semua job milik perusahaannya
    } else if (role === "recruiter") {
      // recruiter: lihat lamaran untuk job di perusahaan mereka
    }
    // admin: lihat semua

    const includeJob = {
      model: Job,
      as: "job",
      attributes: ["id", "title", "company_id"],
      include: [{ model: Company, as: "company", attributes: ["id", "name", "owner_user_id"] }],
    };

    const rows = await Application.findAll({
      where,
      include: [
        { model: User, as: "applicant", attributes: ["id", "email"] },
        includeJob,
      ],
      order: [["created_at", "DESC"]],
    });

    // Filter untuk company dan recruiter di level aplikasi
    let filtered = rows;
    if (role === "company") {
      filtered = rows.filter((a) => a.job?.company?.owner_user_id === id);
    } else if (role === "recruiter" && company_id) {
      filtered = rows.filter((a) => a.job?.company_id === company_id);
    }

    res.json({ success: true, total: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id, {
      include: [
        { model: User, as: "applicant", attributes: ["id", "email"], include: [{ model: Profile, as: "profile" }] },
        { model: Job, as: "job", attributes: ["id", "title", "company_id"], include: [{ model: Company, as: "company", attributes: ["id", "name", "owner_user_id"] }] },
      ],
    });
    if (!app) return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });

    const { role, id, company_id } = req.user;
    const isOwner = app.applicant_user_id === id;
    const isCompanyOwner = role === "company" && app.job?.company?.owner_user_id === id;
    const isRecruiter = role === "recruiter" && app.job?.company_id === company_id;

    if (role !== "admin" && !isOwner && !isCompanyOwner && !isRecruiter) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getByJob = async (req, res) => {
  try {
    const jobId = Number(req.params.job_id);
    if (!jobId) return res.status(400).json({ success: false, message: "job_id wajib angka." });

    // Cek akses
    if (req.user.role === "applicant") {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    const rows = await Application.findAll({
      where: { job_id: jobId },
      include: [
        {
          model: User, as: "applicant", attributes: ["id", "email"],
          include: [{ model: Profile, as: "profile", attributes: ["full_name", "phone", "education_level", "experience_years", "skills", "cv_url"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { job_id, cover_letter } = req.body;
  if (!job_id) return res.status(400).json({ success: false, message: "job_id wajib diisi." });
  if (Number.isNaN(Number(job_id))) {
    return res.status(400).json({ success: false, message: "job_id harus angka." });
  }

  try {
    const job = await Job.findByPk(Number(job_id));
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });
    if (job.status === "closed") {
      return res.status(400).json({ success: false, message: "Lowongan sudah ditutup." });
    }

    const dup = await Application.findOne({
      where: { job_id: Number(job_id), applicant_user_id: req.user.id },
    });
    if (dup) return res.status(409).json({ success: false, message: "Kamu sudah melamar pekerjaan ini." });

    const app = await Application.create({
      job_id: Number(job_id),
      applicant_user_id: req.user.id,
      cover_letter: cover_letter || null,
    });
    res.status(201).json({
      success: true,
      message: "Lamaran berhasil dikirim.",
      data: { id: app.id, job_id: app.job_id, status: app.status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!status || !VALID_STATUS.has(status)) {
    return res.status(400).json({
      success: false,
      message: `Status tidak valid. Pilihan: ${[...VALID_STATUS].join(", ")}`,
    });
  }

  try {
    const app = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: "job", include: [{ model: Company, as: "company" }] }],
    });
    if (!app) return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });

    // Cek akses: hanya admin, company owner, atau recruiter dari perusahaan terkait
    const { role, id, company_id } = req.user;
    const isCompanyOwner = role === "company" && app.job?.company?.owner_user_id === id;
    const isRecruiter = role === "recruiter" && app.job?.company_id === company_id;

    if (role !== "admin" && !isCompanyOwner && !isRecruiter) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    await app.update({ status });
    res.json({ success: true, message: `Status lamaran diubah menjadi '${status}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });

    // Pelamar bisa hapus lamarannya sendiri, admin bisa hapus semua
    if (req.user.role !== "admin" && app.applicant_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    await app.destroy();
    res.json({ success: true, message: "Lamaran berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, getByJob, remove };
