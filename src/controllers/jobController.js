const { Job, Company } = require("../model/index");

const VALID_STATUS = new Set(["open", "closed"]);

const getAll = async (req, res) => {
  try {
    const rows = await Job.findAll({
      include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
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
      include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    });
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { company_id, title, description, location, required_skills, status } = req.body;

  if (!company_id || !title || !description) {
    return res.status(400).json({ success: false, message: "company_id, title, dan description wajib diisi." });
  }
  if (Number.isNaN(Number(company_id))) {
    return res.status(400).json({ success: false, message: "company_id harus angka." });
  }
  if (status && !VALID_STATUS.has(status)) {
    return res.status(400).json({ success: false, message: "status harus 'open' atau 'closed'." });
  }

  try {
    const job = await Job.create({
      company_id: Number(company_id),
      title: String(title).trim(),
      description: String(description),
      location: location || null,
      required_skills: required_skills || null,
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

  const { title, description, location, required_skills, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: "title dan description wajib diisi." });
  }
  if (status && !VALID_STATUS.has(status)) {
    return res.status(400).json({ success: false, message: "status harus 'open' atau 'closed'." });
  }

  try {
    const job = await Job.findByPk(id);
    if (!job) return res.status(404).json({ success: false, message: "Lowongan tidak ditemukan." });

    await job.update({
      title: String(title).trim(),
      description: String(description),
      location: location || null,
      required_skills: required_skills || null,
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
    await job.destroy();
    res.json({ success: true, message: "Lowongan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
