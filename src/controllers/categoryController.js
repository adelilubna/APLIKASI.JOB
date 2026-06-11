const { Category } = require("../model/index");

const getAll = async (req, res) => {
  try {
    const rows = await Category.findAll({ order: [["name", "ASC"]] });
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });
  try {
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan." });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "name wajib diisi." });
  try {
    const category = await Category.create({
      name: String(name).trim(),
      description: description || null,
    });
    res.status(201).json({ success: true, message: "Kategori berhasil dibuat.", data: { id: category.id, name: category.name } });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Nama kategori sudah ada." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "name wajib diisi." });
  try {
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan." });
    await category.update({ name: String(name).trim(), description: description || null });
    res.json({ success: true, message: "Kategori berhasil diupdate." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });
  try {
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan." });
    await category.destroy();
    res.json({ success: true, message: "Kategori berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
