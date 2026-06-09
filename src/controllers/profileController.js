const { Profile } = require("../model/index");

exports.upsertMyProfile = async (req, res) => {
  try {
    const { fullName, location, education, experienceYears, skills, cvUrl } = req.body;

    const [profile] = await Profile.upsert({
      user_id: req.user.id,
      full_name: fullName || null,
      location: location || null,
      education: education || null,
      experience_years: typeof experienceYears === "number" ? experienceYears : 0,
      skills: skills || null,
      cv_url: cvUrl || null,
    });

    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.myProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
