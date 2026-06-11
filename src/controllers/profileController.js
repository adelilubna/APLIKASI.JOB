const { Profile } = require("../model/index");

exports.myProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.upsertMyProfile = async (req, res) => {
  try {
    const {
      fullName, phone, gender, dateOfBirth, bio,
      location, education, educationLevel,
      experienceYears, skills, linkedinUrl, githubUrl,
    } = req.body;

    const updateData = {
      user_id: req.user.id,
      full_name: fullName || null,
      phone: phone || null,
      gender: gender || null,
      date_of_birth: dateOfBirth || null,
      bio: bio || null,
      location: location || null,
      education: education || null,
      education_level: educationLevel || null,
      experience_years: experienceYears !== undefined ? Number(experienceYears) || 0 : 0,
      skills: skills
        ? (typeof skills === "string" ? JSON.parse(skills) : skills)
        : null,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
    };

    const [profile] = await Profile.upsert(updateData);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadCV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File CV tidak ditemukan." });
  }
  try {
    const cvUrl = `/uploads/${req.file.filename}`;
    await Profile.upsert({ user_id: req.user.id, cv_url: cvUrl });
    res.json({ success: true, message: "CV berhasil diupload.", cv_url: cvUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File foto tidak ditemukan." });
  }
  try {
    const photoUrl = `/uploads/${req.file.filename}`;
    await Profile.upsert({ user_id: req.user.id, photo_url: photoUrl });
    res.json({ success: true, message: "Foto profil berhasil diupload.", photo_url: photoUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
