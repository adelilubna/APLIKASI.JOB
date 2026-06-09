const { Application, Job, Company, User } = require("../model/index");

const VALID_STATUS = new Set(["Applied", "Reviewed", "Shortlist", "Interview", "Accepted", "Rejected"]);

const getAll = async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { applicant_user_id: req.user.id };
    const rows = await Application.findAll({
      where,
      include: [
        { model: User, as: "applicant", attributes: ["id", "email"] },
        { model: Job, as: "job", attributes: ["id", "title"], include: [{ model: Company, as: "company", attributes: ["id", "name"] }] },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id, {
      include: [
        { model: User, as: "applicant", attributes: ["id", "email"] },
        { model: Job, as: "job", attributes: ["id", "title"] },
      ],
    });
    if (!app) return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });

    if (
      req.user.role !== "admin" &&
      req.user.role !== "recruiter" &&
      app.applicant_user_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ success: false, message: "job_id wajib diisi." });
  if (Number.isNaN(Number(job_id))) {
    return res.status(400).json({ success: false, message: "job_id harus angka." });
  }

  try {
    const job = await Job.findByPk(Number(job_id));
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });

    const dup = await Application.findOne({ where: { job_id: Number(job_id), applicant_user_id: req.user.id } });
    if (dup) return res.status(409).json({ success: false, message: "Kamu sudah melamar pekerjaan ini." });

    const app = await Application.create({ job_id: Number(job_id), applicant_user_id: req.user.id });
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
      message: `Status tidak valid. Pilihan: ${Array.from(VALID_STATUS).join(", ")}`,
    });
  }

  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });

    await app.update({ status });
    res.json({ success: true, message: `Status lamaran diubah menjadi '${status}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getByJob = async (req, res) => {
  try {
    const rows = await Application.findAll({
      where: { job_id: req.params.job_id },
      include: [{ model: User, as: "applicant", attributes: ["id", "email"] }],
    });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    await app.destroy();
    res.json({ success: true, message: "Lamaran berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, getByJob, remove };
