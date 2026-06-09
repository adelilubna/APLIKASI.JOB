const { upsertProfile, getProfileByUserId } = require("../model/profileModel");

exports.upsertMyProfile = async (req, res) => {
  const { fullName, location, education, experienceYears, skills, cvUrl } = req.body;
  await upsertProfile({
    userId: req.user.id,
    fullName,
    location,
    education,
    experienceYears: typeof experienceYears === "number" ? experienceYears : 0,
    skills,
    cvUrl,
  });

  const profile = await getProfileByUserId(req.user.id);
  res.json({ profile });
};

exports.myProfile = async (req, res) => {
  const profile = await getProfileByUserId(req.user.id);
  res.json({ profile });
};

