const Shortlist = require("../model/shortlistModel");

const addToShortlist = async (req, res) => {
  const { application_id } = req.body;
  const recruiter_id = req.user.id;

  if (!application_id) {
    return res.status(400).json({ success: false, message: "application_id wajib diisi." });
  }

  try {
    const [existing] = await Shortlist.findByApplicationAndRecruiter(application_id, recruiter_id);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Kandidat sudah ada di shortlist." });
    }

    await Shortlist.create({ application_id, recruiter_id });
    res.status(201).json({ success: true, message: "Kandidat berhasil ditambahkan ke shortlist." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getShortlist = async (req, res) => {
  try {
    const [rows] = await Shortlist.getByRecruiter(req.user.id);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeFromShortlist = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await Shortlist.getById(id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Data shortlist tidak ditemukan." });
    }
    await Shortlist.delete(id);
    res.json({ success: true, message: "Kandidat berhasil dihapus dari shortlist." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addToShortlist, getShortlist, removeFromShortlist };
