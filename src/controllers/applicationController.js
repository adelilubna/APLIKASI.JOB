const Application = require("../model/applicationModel");
const Job = require("../model/jobModel");

const VALID_STATUS = new Set([
  "Applied",
  "Reviewed",
  "Shortlist",
  "Interview",
  "Accepted",
  "Rejected",
]);

const getAll = async (req, res) => {
  try {
    const [rows] =
      req.user.role === "admin"
        ? await Application.getAll()
        : await Application.getByUser(req.user.id);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await Application.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    const app = rows[0];
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
  if (!job_id) {
    return res.status(400).json({ success: false, message: "job_id wajib diisi." });
  }
  if (Number.isNaN(Number(job_id))) {
    return res.status(400).json({ success: false, message: "job_id harus angka." });
  }

  try {
    const [jobRows] = await Job.getById(Number(job_id));
    if (!jobRows.length) {
      return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });
    }

    const [dup] = await Application.checkDuplicate(job_id, req.user.id);
    if (dup.length) {
      return res.status(409).json({ success: false, message: "Kamu sudah melamar pekerjaan ini." });
    }

    const [result] = await Application.create({
      job_id: Number(job_id),
      applicant_user_id: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: "Lamaran berhasil dikirim.",
      data: { id: result.insertId, job_id: Number(job_id), status: "Applied" },
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
    const [rows] = await Application.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    await Application.updateStatus(req.params.id, status);
    res.json({ success: true, message: `Status lamaran diubah menjadi '${status}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getByJob = async (req, res) => {
  try {
    const [rows] = await Application.getByJob(req.params.job_id);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const [rows] = await Application.getById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Lamaran tidak ditemukan." });
    }

    await Application.delete(req.params.id);
    res.json({ success: true, message: "Lamaran berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, getByJob, remove };
