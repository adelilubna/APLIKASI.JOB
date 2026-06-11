const { fn, col, Op } = require("sequelize");
const { User, Company, Job, Application, Interview, Shortlist } = require("../model/index");

const getDashboard = async (req, res) => {
  const { id, role, company_id } = req.user;

  try {
    // ── ADMIN ──────────────────────────────────────────────────
    if (role === "admin") {
      const [total_users, total_companies, total_jobs, total_applications, total_interviews, jobs_open, jobs_closed, status_breakdown] =
        await Promise.all([
          User.count(),
          Company.count(),
          Job.count(),
          Application.count(),
          Interview.count(),
          Job.count({ where: { status: "open" } }),
          Job.count({ where: { status: "closed" } }),
          Application.findAll({
            attributes: ["status", [fn("COUNT", col("id")), "count"]],
            group: ["status"],
            raw: true,
          }),
        ]);

      return res.json({
        success: true,
        role: "admin",
        stats: {
          total_users,
          total_companies,
          total_jobs,
          jobs_open,
          jobs_closed,
          total_applications,
          total_interviews,
          status_breakdown,
        },
      });
    }

    // ── COMPANY ────────────────────────────────────────────────
    if (role === "company") {
      const myCompany = await Company.findOne({ where: { owner_user_id: id } });
      if (!myCompany) {
        return res.json({ success: true, role: "company", stats: { message: "Belum memiliki perusahaan." } });
      }

      const compId = myCompany.id;
      const jobWhere = { company_id: compId };

      const [total_jobs, jobs_open, jobs_closed, total_applications, total_shortlisted, total_interviews, status_breakdown] =
        await Promise.all([
          Job.count({ where: jobWhere }),
          Job.count({ where: { ...jobWhere, status: "open" } }),
          Job.count({ where: { ...jobWhere, status: "closed" } }),
          Application.count({
            include: [{ model: Job, as: "job", where: jobWhere, attributes: [] }],
          }),
          Shortlist.count({
            include: [
              {
                model: Application,
                as: "application",
                include: [{ model: Job, as: "job", where: jobWhere, attributes: [] }],
                attributes: [],
              },
            ],
          }),
          Interview.count({
            include: [
              {
                model: Application,
                as: "application",
                include: [{ model: Job, as: "job", where: jobWhere, attributes: [] }],
                attributes: [],
              },
            ],
          }),
          Application.findAll({
            attributes: ["status", [fn("COUNT", col("Application.id")), "count"]],
            include: [{ model: Job, as: "job", where: jobWhere, attributes: [] }],
            group: ["status"],
            raw: true,
          }),
        ]);

      return res.json({
        success: true,
        role: "company",
        company: { id: compId, name: myCompany.name },
        stats: { total_jobs, jobs_open, jobs_closed, total_applications, total_shortlisted, total_interviews, status_breakdown },
      });
    }

    // ── RECRUITER ──────────────────────────────────────────────
    if (role === "recruiter") {
      if (!company_id) {
        return res.json({ success: true, role: "recruiter", stats: { message: "Belum ditugaskan ke perusahaan." } });
      }

      const jobWhere = { company_id };

      const [total_jobs, jobs_open, total_applications, total_shortlisted, total_interviews] =
        await Promise.all([
          Job.count({ where: jobWhere }),
          Job.count({ where: { ...jobWhere, status: "open" } }),
          Application.count({
            include: [{ model: Job, as: "job", where: jobWhere, attributes: [] }],
          }),
          Shortlist.count({ where: { recruiter_id: id } }),
          Interview.count({
            include: [
              {
                model: Application,
                as: "application",
                include: [{ model: Job, as: "job", where: jobWhere, attributes: [] }],
                attributes: [],
              },
            ],
          }),
        ]);

      return res.json({
        success: true,
        role: "recruiter",
        stats: { total_jobs, jobs_open, total_applications, total_shortlisted, total_interviews },
      });
    }

    // ── APPLICANT ──────────────────────────────────────────────
    if (role === "applicant") {
      const [total_applied, status_breakdown, total_interviews, total_accepted, total_rejected] =
        await Promise.all([
          Application.count({ where: { applicant_user_id: id } }),
          Application.findAll({
            where: { applicant_user_id: id },
            attributes: ["status", [fn("COUNT", col("id")), "count"]],
            group: ["status"],
            raw: true,
          }),
          Interview.count({
            include: [{ model: Application, as: "application", where: { applicant_user_id: id }, attributes: [] }],
          }),
          Application.count({ where: { applicant_user_id: id, status: "Accepted" } }),
          Application.count({ where: { applicant_user_id: id, status: "Rejected" } }),
        ]);

      return res.json({
        success: true,
        role: "applicant",
        stats: { total_applied, total_interviews, total_accepted, total_rejected, status_breakdown },
      });
    }

    res.status(403).json({ success: false, message: "Role tidak dikenali." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
