const { Company, User } = require("../model/index");

const VALID_SIZES = new Set(["1-10", "11-50", "51-200", "201-500", "500+"]);

// Cek apakah user adalah owner atau admin
const isOwnerOrAdmin = (user, company) =>
  user.role === "admin" || company.owner_user_id === user.id;

// Ambil company_id yang relevan untuk recruiter/company
const getMyCompanyId = async (user) => {
  if (user.role === "admin") return null; // admin: lihat semua
  if (user.role === "company") {
    const c = await Company.findOne({ where: { owner_user_id: user.id } });
    return c ? c.id : -1;
  }
  if (user.role === "recruiter") return user.company_id || -1;
  return -1;
};

const getAll = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "company") {
      where = { owner_user_id: req.user.id };
    } else if (req.user.role === "recruiter") {
      if (req.user.company_id) where = { id: req.user.company_id };
    }
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
    if (!company) return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  const { name, email, phone, description, website, location, industry, company_size } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "name wajib diisi." });
  if (company_size && !VALID_SIZES.has(company_size)) {
    return res.status(400).json({ success: false, message: `company_size tidak valid. Pilihan: ${[...VALID_SIZES].join(", ")}` });
  }

  try {
    // Cegah user company membuat lebih dari 1 perusahaan
    if (req.user.role === "company") {
      const existing = await Company.findOne({ where: { owner_user_id: req.user.id } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Akun ini sudah memiliki perusahaan." });
      }
    }

    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const company = await Company.create({
      owner_user_id: req.user.id,
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      description: description || null,
      website: website || null,
      location: location || null,
      industry: industry || null,
      company_size: company_size || null,
      logo_url: logoUrl,
    });
    res.status(201).json({ success: true, message: "Perusahaan berhasil dibuat.", data: { id: company.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });

  try {
    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    if (!isOwnerOrAdmin(req.user, company)) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    const { name, email, phone, description, website, location, industry, company_size } = req.body;
    if (company_size && !VALID_SIZES.has(company_size)) {
      return res.status(400).json({ success: false, message: `company_size tidak valid. Pilihan: ${[...VALID_SIZES].join(", ")}` });
    }

    const updateData = {
      name: name ? name.trim() : company.name,
      email: email !== undefined ? email : company.email,
      phone: phone !== undefined ? phone : company.phone,
      description: description !== undefined ? description : company.description,
      website: website !== undefined ? website : company.website,
      location: location !== undefined ? location : company.location,
      industry: industry !== undefined ? industry : company.industry,
      company_size: company_size !== undefined ? company_size : company.company_size,
    };
    if (req.file) updateData.logo_url = `/uploads/${req.file.filename}`;

    await company.update(updateData);
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
    if (!company) return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    await company.destroy();
    res.json({ success: true, message: "Perusahaan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: verifikasi perusahaan
const verify = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "id wajib angka." });
  try {
    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });
    await company.update({ is_verified: 1 });
    res.json({ success: true, message: "Perusahaan berhasil diverifikasi." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: assign recruiter ke perusahaan
const assignRecruiter = async (req, res) => {
  const id = Number(req.params.id);
  const { recruiter_user_id } = req.body;
  if (!id || !recruiter_user_id) {
    return res.status(400).json({ success: false, message: "id perusahaan dan recruiter_user_id wajib diisi." });
  }
  try {
    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ success: false, message: "Perusahaan tidak ditemukan." });

    const recruiter = await User.findByPk(recruiter_user_id);
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(404).json({ success: false, message: "Recruiter tidak ditemukan." });
    }

    await recruiter.update({ company_id: id });
    res.json({ success: true, message: `Recruiter berhasil ditetapkan ke perusahaan ${company.name}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, verify, assignRecruiter };
