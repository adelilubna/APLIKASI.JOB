const Company = require("../model/companyModel");

const getAll = async (req, res) => {
  try {
    const [rows] =
      req.user?.role === "admin"
        ? await Company.getAll()
        : await Company.getByOwnerUserId(req.user.id);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  try {
    const [rows] = await Company.getById(id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    }

    const company = rows[0];
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
  if (!name) {
    return res.status(400).json({ success: false, message: "name wajib diisi." });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ success: false, message: "name harus string." });
  }

  try {
    const [result] = await Company.create({
      owner_user_id: req.user.id,
      name: String(name).trim(),
      email: email ? String(email).trim() : null,
      description,
      website,
      location,
    });
    res.status(201).json({
      success: true,
      message: "Perusahaan berhasil dibuat.",
      data: { id: result.insertId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  const { name, email, description, website, location } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: "name wajib diisi." });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ success: false, message: "name harus string." });
  }

  try {
    const [rows] = await Company.getById(id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    }

    await Company.update(id, {
      name: String(name).trim(),
      email: email ? String(email).trim() : null,
      description,
      website,
      location,
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
    const [rows] = await Company.getById(id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    }

    await Company.delete(id);
    res.json({ success: true, message: "Perusahaan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
