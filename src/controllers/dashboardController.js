const { fn, col } = require("sequelize");
const { User, Company, Job, Application, Interview, Shortlist } = require("../model/index");

const getDashboard = async (req, res) => {
  const { id, role } = req.user;

  try {
    if (role === "admin") {
      const [total_users, total_companies, total_jobs, total_applications, total_interviews] =
        await Promise.all([
          User.count(),
          Company.count(),
          Job.count(),
          Application.count(),
          Interview.count(),
        ]);

      return res.json({
        success: true,
        role: "admin",
        stats: { total_users, total_companies, total_jobs, total_applications, total_interviews },
      });
    }

    if (role === "recruiter") {
      const [total_jobs, total_applications, total_shortlisted, total_interviews] = await Promise.all([
        Job.count({ include: [{ model: Company, as: "company", where: { owner_user_id: id } }] }),
        Application.count({
          include: [
            {
              model: Job,
              as: "job",
              include: [{ model: Company, as: "company", where: { owner_user_id: id } }],
            },
          ],
        }),
        Shortlist.count({ where: { recruiter_id: id } }),
        Interview.count({
          include: [
            {
              model: Application,
              as: "application",
              include: [
                {
                  model: Job,
                  as: "job",
                  include: [{ model: Company, as: "company", where: { owner_user_id: id } }],
                },
              ],
            },
          ],
        }),
      ]);

      return res.json({
        success: true,
        role: "recruiter",
        stats: { total_jobs, total_applications, total_shortlisted, total_interviews },
      });
    }

    if (role === "applicant" || role === "user") {
      const [total_applied, status_breakdown, total_interviews] = await Promise.all([
        Application.count({ where: { applicant_user_id: id } }),
        Application.findAll({
          where: { applicant_user_id: id },
          attributes: ["status", [fn("COUNT", col("id")), "count"]],
          group: ["status"],
          raw: true,
        }),
        Interview.count({
          include: [
            {
              model: Application,
              as: "application",
              where: { applicant_user_id: id },
            },
          ],
        }),
      ]);

      return res.json({
        success: true,
        role: "applicant",
        stats: { total_applied, total_interviews, status_breakdown },
      });
    }

    res.status(403).json({ success: false, message: "Role tidak dikenali." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
