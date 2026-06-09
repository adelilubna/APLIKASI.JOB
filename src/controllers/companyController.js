const { Company } = require("../model/index");

const getAll = async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { owner_user_id: req.user.id };
    const rows = await Company.findAll({ where, order: [["created_at", "DESC"]] });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    }
    if (req.user.role !== "admin" && company.owner_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { name, email, description, website, location } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, message: "name wajib diisi dan harus string." });
  }

  try {
    const company = await Company.create({
      owner_user_id: req.user.id,
      name: name.trim(),
      email: email ? String(email).trim() : null,
      description: description || null,
      website: website || null,
      location: location || null,
    });
    res.status(201).json({ success: true, message: "Perusahaan berhasil dibuat.", data: { id: company.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  const { name, email, description, website, location } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, message: "name wajib diisi dan harus string." });
  }

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    }
    await company.update({
      name: name.trim(),
      email: email ? String(email).trim() : null,
      description: description || null,
      website: website || null,
      location: location || null,
    });
    res.json({ success: true, message: "Perusahaan berhasil diupdate." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    }
    await company.destroy();
    res.json({ success: true, message: "Perusahaan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
